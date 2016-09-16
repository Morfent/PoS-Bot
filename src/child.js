'use strict';

import Bot from './bot';
import Connection from './connection';
import config from '../config';

global.Config = config
	.find(c => c.get('id') === process.env.id)
	.update('server', (server) => {
		let {protocol, hostname, port, id} = server.toObject();
		return server.set('url', `${protocol}//${hostname}:${port}/${id}/`);
	})
	.toObject();

// TODO: wrap console.log with process.env.id

let connection = new Connection(
	Config.server.get('url'),
	Config.server.get('_reserved'),
	Config.server.get('options')
);
let bot = new Bot(connection.publication, connection.outCh); // eslint-disable-line no-unused-vars

// Let's get this party started already!
connection.open();
