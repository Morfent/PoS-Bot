'use strict';

import {Map, Set} from 'immutable';
import csp from 'js-csp';
import SockJS from 'sockjs-client';

import {toRoomid} from './utils/helpers';

const actionTypes = Map({
	global: Set([
		'updateuser', 'formats', 'queryresponse', 'challstr', 'pm', 'popup',
		'usercount', 'nametaken', 'updatechallenges', 'updatesearch', 'refresh',
		'disconnect'
	]),
	chat: Set([
		'init', 'title', 'users', ':', 'raw', 'html', 'uhtml', 'uhtmlchange',
		'deinit', 'noinit', 'unlink', 'expire', 'userstats', 'tournament', 'tournaments',
		'j', 'J', 'l', 'L', 'n', 'N', 'b', 'B', 'c', 'c:', 'm:', '', 'tc',
		'chat', 'join', 'leave', 'name'
	]),
	battle: Set([
		'init', 'title', 'inactiveoff', 'askreg', 'inactive', 'inactiveoff', 'eval',
		'request', 'dealloc', 'choose', 'undo', 'rename', 'join', 'leave', 'win', 'tie',
		'sideupdate', 'callback', 'choice', 'teampreview', 'message', 'move', 'shift',
		'inactiveside', 'swap', 'gametype', 'gen', 'tier', 'seed', 'rated', 'team',
		'pass', 'default', 'skip', 'switch', 'instaswitch', 'split', 'debug', 'player',
		'score', 'winupdate', 'update', 'log', 'start', 'turn', 'variation', 'rule',
		'chatmessage', 'chatmessage-raw', 'raw', 'html', 'spectator', 'spectatorleave',
		'prematureend', 'clearpoke', 'poke', 'detailschange', 'drag', 'replace',
		'faint', 'cant', 'done', '', 'error', 'warning', 'unlink',
		'chat', 'join', 'leave', 'name', 'j', 'J', 'l', 'L', 'n', 'N', 'c', 'c:', 'm:',
		'-message', '-transform', '-formechange', '-curestatus', '-fail', '-immune',
		'-enditem', '-activate', '-ability', '-center', '-boost', '-unboost',
		'-setboost', '-hint', '-damage', '-heal', '-supereffective', '-resisted',
		'-crit', '-sethp', '-swapboost', '-restoreboost', '-copyboost', '-clearboost',
		'-invertboost', '-clearallboost', '-miss', '-notarget', '-ohko', '-hitcount',
		'-nothing', '-waiting', '-combine', '-prepare', '-mustrecharge', '-status',
		'-cureteam', '-item', '-endability', '-mega', '-primal', '-end', '-singleturn',
		'-singlemove', '-activate', '-weather', '-fieldstart', '-fieldend', '-anim',
		'-fieldactivate'
	])
});

class Connection {
	constructor(url, _reserved, options) {
		this.url = url;
		this._reserved = _reserved;
		this.options = options;
		this.socket = null;

		// PoS-Bot uses the publisher/subscriber model to process the messages
		// received from the server sequentially and asynchronously. The bot
		// and room objects subscribe to actions put in this CSP channel given
		// a topic (for room objects, their roomid; the bot object pretends to
		// be the global room). When this receives a message from the server,
		// it creates an action object with the room name determined from the
		// message as the topic and the message itself as the payload. When the
		// bot object or a room wants to send something to the server, they do
		// so through their CSP channel; they never interact with WebSockets
		// directly, since they have no reason whatsoever to know anything
		// about it or even its existence.
		this.pubCh = csp.chan(50);
		this.publication = csp.operations.pub(this.pubCh, this.getTopic);

		// Likewise, the subscribers will need to be able to send messages to
		// the server, but they can't do this through the publication channel.
		let outCh = this.outCh = csp.chan(50);
		let self = this;
		csp.go(function* () {
			let message = yield outCh;
			while (message !== csp.CLOSED) {
				self.send(...message);
				yield csp.sleep(600);
				message = yield outCh;
			}
		});
	}

	get isOpen() {
		return !!this.socket && this.socket.readyState === SockJS.OPEN;
	}

	getTopic(message) {
		// Typically, the first line of a message sent from the server includes
		// the ID of the room the message was sent from. Lobby and the global
		// rooms don't, since they're obviously not rooms in any shape or form,
		// so if a message originated from either of those rooms, we have to
		// determine which room it was implicitly.
		if (message.startsWith('>')) {
			let idx = message.indexOf('\n');
			return message.slice(1, idx);
		}

		// Because PS protocol is very consistent, some command responses don't
		// bother to follow it. Luckily, the global room can't send these.
		if (!message.startsWith('|')) return 'lobby';

		// The only other way we can tell which room the message came from is
		// its type, which is the first argument in a line; the global room
		// only sends types of messages that no other room sends.
		let type = message.split('|')[1];
		if (actionTypes.getIn(['global', type])) return 'global';
		if (actionTypes.getIn(['chat', type])) return 'lobby';
		throw new TypeError(`Message sent from battle room with no roomid included...? Payload: ${payload}`);
	}

	open() {
		if (this.isOpen) return false;

		this.socket = new SockJS(this.url, this._reserved, this.options);
		this.socket.addEventListener('open', () => console.log(`[${process.env.id}] SockJS connection opened.`));
		this.socket.addEventListener('message', (e) => csp.putAsync(this.pubCh, e.data));
		this.socket.addEventListener('close', () => {
			console.log(`[${process.env.id}] SockJS connection closed.`);

			// Prevent our event handlers from leaking after reconnecting.
			for (let event in this.socket._listeners) {
				let listeners = this.socket._listeners[event];
				listeners.forEach((listener) => this.socket.removeEventListener(event, listener));
			}
		});
	}

	send(message, room='') { // eslint-disable-line space-infix-ops
		if (!this.isOpen) return false;
		if (!message || !message.trim()) return false;

		let roomid = toRoomid(room);
		if (roomid === 'lobby' || roomid === 'global') roomid = '';
		if (!/^\/[^\/]/.test(message) && message.length > 300) {
			for (let i = 0; i < message.length; i += 300) {
				let chunk = message.substr(i, i + 300);
				let outgoing = `${roomid}|${chunk}`;
				this.socket.send(outgoing);
				console.log(`[${process.env.id}] Sent ${outgoing}`);
			}
		} else {
			let outgoing = `${roomid}|${message}`;
			this.socket.send(outgoing);
			console.log(`[${process.env.id}] Sent ${outgoing}`);
		}

		return true;
	}
}

export default Connection;
