'use strict';

import http from 'http';
import https from 'https';

import {server} from '../../config';
import {toId} from './helpers';

const ssl = server.get('ssl');
const _http = ssl ? https : http;

function getAssertion(username, challstr) {
	let reqOpts = {
		hostname: 'play.pokemonshowdown.com',
		port: ssl ? 443 : 80,
		path: '/~~' + server.id + '/action.php?act=getassertion&userid=' +
			toId(username) + '&challstr=' + challstr,
		method: 'GET',
		agent: false
	};

	return new Promise((resolve, reject) => {
		let req = _http.request(reqOpts, (res) => {
			let assertion = '';

			res.on('data', (chunk) => {
				assertion += chunk.toString();
			});

			res.on('end', () => {
				// We sent an invalid challstr.
				if (assertion.startsWith(';;')) {
					reject(new Error('Failed to get assertion: ' + assertion.substr(2)));
				}

				// Cloudflare spits out the HTML for an error page occasionally
				// when there are connection problems.
				if (res.statusCode !== 200) {
					reject(new Error('Failed to get assertion: no response from the login server ' +
						'(' + res.statusCode + ' ' + res.statusMessage + ').'));
				}

				// assertion.split('|')[2] (user type)
				// 1: unregistered
				// 2: registered
				// 3: sysop
				// 4: autoconfirmed
				// 5: permalocked
				// 6: permabanned

				console.log(assertion);
				resolve(assertion);
			});
		});

		req.on('error', (err) => {
			reject(new Error('Failed to get assertion: could not connect to the login server (' +
				err.message + ').'));
		});

		req.end();
	});
}

function logIn(username, password, challstr) {
	let query = 'act=login&name=' + username + '&pass=' + password + '&challstr=' + challstr;
	let reqOpts = {
		hostname: 'play.pokemonshowdown.com',
		port: ssl ? 443 : 80,
		path: '/~~' + server.id + '/action.php',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': query.length
		},
		agent: false
	};

	return new Promise((resolve, reject) => {
		let req = _http.request(reqOpts, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk.toString();
			});

			res.on('end', () => {
				if (!data) {
					reject(new Error('Failed to log in: missing query values or invalid request method.'));
				}

				// Cloudflare spits out the HTML for an error page occasionally
				// when there are connection problems.
				if (res.statusCode !== 200) {
					reject(new Error('Failed to log in: no response from the login server ' +
						'(' + res.statusCode + ' ' + res.statusMessage + ').'));
				}

				// Now that we've sent a query the login server can understand,
				// it will respond with an object including a curuser object,
				// which includes some extra information useful to us.
				let response;
				try {
					response = JSON.parse(data.substr(1));
				} catch (e) {}

				// Unlike the getassertion act, we get a curuser obect here that
				// gives us some extra information of use to us.
				let {curuser: {group, banstate, loggedin}, assertion} = response;
				if (!loggedin) {
					reject(new Error('Failed to log in: invalid username, password, or challenge string.'));
				}

				if (assertion.startsWith(';;')) {
					reject(new Error('Failed to log in: ' + response.assertion.substr(2)));
				}

				// banstate:
				// >-10: other trusted users (not important to us)
				// -10: autoconfirmed
				// 0: regular user
				// >0: permalock/permaban

				// group:
				// 0: guest
				// 1: regular user
				// 2: admin (not sysop)
				// 3: voice (unused)
				// 4: driver (unused)
				// 5: mod (unused)
				// 6: leader

				// assertion.split('|')[2] (user type)
				// 1: unregistered
				// 2: registered
				// 3: sysop
				// 4: autoconfirmed
				// 5: permalocked
				// 6: permabanned

				resolve(response);
			});
		});

		req.on('error', (err) => {
			reject(new Error('Failed to log in: could not connect to the login server (' +
				err.message + ').'));
		});

		req.write(query);
		req.end();
	});
}

export default async function rename(username, password, challstr) {
	if (password) return logIn(username, password, challstr);
	return getAssertion(username, challstr);
}
