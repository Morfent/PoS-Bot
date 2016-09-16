'use strict';

const Immutable = require('immutable');
const Map = Immutable.Map;
const Set = Immutable.Set;

// PoS-Bot can run multiple bots at once! When running npm start, a child
// process will be forked for each config object that appears in
// module.exports, so if you want to run bots on several servers, for instance,
// simply add extra copies of the config Map and edit them as you see fit.
module.exports = [
	Map({
		// The ID to use for this bot when logging to console.
		id: '',
		server: Map({
			// Whether or not to use SSL when dealing with the login server.
			// Leave set to true unless you have issues connecting over HTTPS
			// for whatever reason.
			ssl: true,
			// Protocol to use when connecting to the server. Set to 'http:' if
			// the server does not have its own SSL certificate or if you have
			// issues connecting to it.
			protocol: 'https:',
			// The hostname of the server.
			hostname: 'sim.psim.us',
			// The port of the server. Set to 443 if you are using HTTPS.
			port: 443,
			// The id of the server.
			id: 'showdown',
			// The second argument to give when constructing the SockJS
			// connection.
			_reserved: null,
			// The third argument to give when constructing the SockJS
			// connection.
			options: null
		}),
		login: Map({
			// The username the bot should log in with.
			username: '',
			// The password the bot should log in with.
			password: '',
			// The avatar the bot should use.
			avatar: 1
		}),
		// The rooms the bot should autojoin.
		rooms: Set([])
	})
];
