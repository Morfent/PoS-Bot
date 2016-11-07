'use strict';

import SockJS from 'sockjs-client';

import {toRoomid} from './utils/helpers';

class Connection {
	constructor(url, _reserved, options, parser) {
		this.url = url;
		this._reserved = _reserved;
		this.options = options;
		this.parse = parser;
		this.socket = null;

		this.open();
	}

	get isOpen() {
		return !!this.socket && this.socket.readyState === SockJS.OPEN;
	}

	open() {
		if (this.isOpen) return false;

		let socket = new SockJS(this.url, this._reserved, this.options);
		socket.addEventListener('open', () => console.log(`[${process.env.id}] SockJS connection opened.`));
		socket.addEventListener('message', (e) => this.parse(e.data))
		socket.addEventListener('close', () => {
			console.log(`[${process.env.id}] SockJS connection closed.`);

			// Prevent our event handlers from leaking after reconnecting.
			for (let event in this.socket._listeners) {
				let listeners = this.socket._listeners[event];
				listeners.forEach((listener) => this.socket.removeEventListener(event, listener));
			}
		});

		this.socket = socket;
	}

	send(message, room='') { // eslint-disable-line space-infix-ops
		if (!this.isOpen) return false;
		if (!message || !message.trim()) return false;

		let roomid = toRoomid(room);
		if (roomid === 'lobby' || roomid === 'global') roomid = '';
		if (message.length > 300 && !/^(?:\/[^\/]|>>>?\s)/.test(message)) {
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
