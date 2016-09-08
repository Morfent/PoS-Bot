'use strict';

const {Map, Set} = require('immutable');

module.exports = {
	server: Map({
		protocol: 'https',
		hostname: 'sim.psim.us',
		port: 443,
		id: 'showdown'
	}),
	login: Map({
		username: '',
		password: '',
		avatar: 0
	}),
	rooms: Map({
		publc: Set(),
		hidden: Set(),
		private: Set(),
		group: Set()
	})
};
