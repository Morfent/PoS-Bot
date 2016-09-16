'use strict';

import csp from 'js-csp';

import verifyIdentity from './utils/loginServerApi';

class Bot {
	constructor(publication, outCh) {
		this.name = '';
		this.isRegistered = false;
		this.rank = ' ';
		this.avatar = 0;
		this.autojoin = Config.rooms.toArray();

		// TODO: get list of rooms from |queryresponse|rooms to determine if
		// they're public or not.
		// this.roomsData = Set();

		this.publication = publication;
		this.outCh = outCh;

		// Bots subscribe to messages originating from the global room.
		let brokerCh = this.brokerCh = csp.chan(50);
		csp.operations.pub.sub(publication, 'global', brokerCh);

		let self = this;
		csp.go(function* () {
			let message = yield brokerCh;
			while (message !== csp.CLOSED) {
				self.parseBlock(message);
				message = yield brokerCh;
			}
		});
	}

	send(message, roomid='') { // eslint-disable-line space-infix-ops
		csp.putAsync(this.outCh, [message, roomid]);
	}

	parseBlock(message) {
		let lines = message.split('\n');
		lines.forEach(this.parse, this);
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
