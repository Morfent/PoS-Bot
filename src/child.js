'use strict';

import Bot from './bot';
import config from '../config';

global.Config = config
	.find(c => c.get('id') === process.env.id)
	.update('server', server => {
		let {protocol, hostname, port, id} = server.toObject();
		return server.set('url', `${protocol}//${hostname}:${port}/${id}/`);
	})
	.toObject();

// Let's get started already!
let bot = new Bot();
