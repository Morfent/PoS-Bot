'use strict';

import {fork} from 'child_process';

import config from '../config';

if (!config.length) {
	throw new Error("You can't run any bots if you don't have any configured.");
}

const children = new Set();
for (let c of config) {
	let id = c.get('id');
	let child = fork(`${__dirname}/child.js`, {
		env: {...process.env, id}
	});
	child.on('error', (err) => {
		console.log(`[${id}] Error: ${err.message}`);
		child.kill('SIGTERM');
	});
	child.on('close', (code, signal) => {
		console.log(`[${id}] Process closed with code ${code}, signal ${signal}.`);
		children.delete(child);
		if (!children.size) {
			console.log('All child processes closed; exiting.');
			process.exit(0);
		}
	});

	children.add(child);

	console.log(`[${id}] Initialized process with PID ${child.pid}`);
}
