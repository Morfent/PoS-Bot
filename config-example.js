'use strict';

const Immutable = require('immutable');
const Map = Immutable.Map;
const Set = Immutable.Set;

module.exports = {
	server: Map({hostname: 'sim.psim.us', port: 443, id: 'showdown', protocol: 'https'}),
	login: Map({username: '', password: '', avatar: 0}),
	rooms: Map({publc: Set([]), hidden: Set([]), private: Set([]), group: Set([])})
};
