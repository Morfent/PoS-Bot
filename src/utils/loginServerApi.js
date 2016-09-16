'use strict';

import http from 'http';
import https from 'https';

import {toId} from './helpers';

function getAssertion(username, challstr) {
	let userid = toId(username);
	let serverid = Config.server.get('id');
	let ssl = Config.server.get('ssl');
	let reqOpts = {
		method: 'GET',
		hostname: 'play.pokemonshowdown.com',
		port: ssl ? 443 : 8000,
		path: `/~~${serverid}/action.php?act=getassertion&userid=${userid}&challstr=${challstr}`,
		agent: false
	};

	return new Promise((resolve, reject) => {
		let _http = ssl ? https : http;
		let req = _http.request(reqOpts, (res) => {
			let assertion = '';
			res.on('data', (chunk) => {
				assertion += chunk.toString();
			});
			res.on('end', () => {
				if (assertion.startsWith(';;')) {
					reject(new SyntaxError(`Failed to get an assertion: ${assertion.slice(2)}`));
				}

				if (res.statusCode !== 200) {
					reject(new TimeoutError(`Failed to get a response from the login server: `
						+ `${res.statusMessage} (${res.statusCode}).`));
				}

				resolve(assertion);
			});
		});

		req.on('error', reject);

		req.end();
	});
}

function logIn(username, password, challstr) {
	let query = `act=login&name=${username}&pass=${password}&challstr=${challstr}`;
	let serverid = Config.server.get('id');
	let ssl = Config.server.get('ssl');
	let reqOpts = {
		method: 'POST',
		hostname: 'play.pokemonshowdown.com',
		port: ssl ? 443 : 8000,
		path: `/~~${serverid}/action.php`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': query.length
		},
		agent: false
	};

	return new Promise((resolve, reject) => {
		let _http = ssl ? https : http;
		let req = _http.request(reqOpts, (res) => {
			let data = '';
			res.on('data', (chunk) => {
				data += chunk.toString();
			});
			res.on('end', () => {
				if (!data) {
					reject(new SyntaxError('Failed to log in: missing query values or invalid request method'));
				}

				if (res.statusCode !== 200) {
					reject(new TimeoutError('Failed to log in: no response from the login server '
						+ `(${res.statucCode} ${res.statusMessage})`));
				}

				let response;
				try {
					response = JSON.parse(data.substr(1));
				} catch (e) {}

				let {curuser: {loggedin}, assertion} = response;
				if (!loggedin) {
					reject(new SyntaxError('Failed to log in: invalid username, password, or challenge string.'));
				}

				if (assertion.startsWith(';;')) {
					reject(new Error('Failed to log in: ' + assertion.substr(2)));
				}

				// response.curuser.group:
				// 0: guest
				// 1: regular user
				// 2: admin (not sysop)
				// 3: voice (unused)
				// 4: driver (unused)
				// 5: mod (unused)
				// 6: leader

				// responser.curuser.banstate:
				// >-10: other trusted users (not important to us)
				// -10: autoconfirmed
				// 0: regular user
				// >0: permalock/permaban

				// response.assertion.split('|')[2] (user type)
				// 1: unregistered
				// 2: registered
				// 3: sysop
				// 4: autoconfirmed
				// 5: permalocked
				// 6: permabanned

				resolve(assertion);
			});
		});

		req.on('error', reject);

		req.write(query);

		req.end();
	});
}

// TODO: add function to deal with third way to log in: using the upkeep action.

export default function verifyIdentity(username, password, challstr) {
	if (password) return logIn(username, password, challstr);
	return getAssertion(username, challstr);
}
