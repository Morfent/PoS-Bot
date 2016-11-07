'use strict';

import verifyIdentity from './utils/loginServerApi';
import messageTypes from './utils/messageTypes';

import Connection from './connection';

class Bot {
	constructor() {
		this.name = '';
		this.isRegistered = false;
		this.rank = ' ';
		this.avatar = 0;
		this.autojoin = new Set(Config.rooms.toArray());

		// TODO: get list of rooms from |queryresponse|rooms to determine if
		// they're public or not.
		// this.roomsData = Set();

		this.connection = new Connection(
			Config.server.get('url'),
			Config.server.get('_reserved'),
			Config.server.get('options'),
			(m) => this.parse(m)
		);;
	}

	send(message, roomid) {
		this.connection.send(message, roomid);
	}

	getTargetRoom(message) {
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
		if (messageTypes.getIn(['global', type])) return 'global';
		if (messageTypes.getIn(['chat', type])) return 'lobby';
		throw new TypeError(`Message sent from battle room with no roomid included...? Payload: ${payload}`);
	}

	parseBlock(block) {
		let messages = block.split('\n');
		let roomid = this.getTargetRoom(messages[0]);
		if (roomid === 'global') return messages.forEach(m => this.parse(m));
	}

	parse(message) {
		let parts = message.split('|');
		let type = parts[1];
		switch (type) {
			case 'updateuser':
				this.updateUser(parts[2], parts[3], parts[4]);
				break;
			case 'challstr':
				this.getChallstr(parts.slice(2).join('|'));
				break;
		}
	}

	updateUser(name, isRegistered, avatar) {
		this.name = name;
		this.isRegistered = !!isRegistered;
		this.avatar = isNaN(+avatar) ? avatar : +avatar;

		// TODO: autojoin rooms if the nick received is a guest nick
	}

	getChallstr(challstr) {
		let name = Config.login.get('username');
		let password = Config.login.get('password');
		verifyIdentity(name, password, challstr)
			.then((assertion) => {
				this.send(`/trn ${name},0,${assertion}`);

				if (this.avatar !== Config.login.get('avatar')) {
					let avatar = Config.login.get('avatar');
					this.send(`/avatar ${avatar}`);
					this.avatar = avatar;
				}

				this.autojoin.forEach(room => this.send(`/j ${room}`));
			});
	}
}

export default Bot;
