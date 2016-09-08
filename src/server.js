'use strict';

import SockJS from 'sockjs-client';

import {server} from '../config';

let {protocol, hostname, port, id} = server.toObject();
let url = protocol + '://' + hostname + ':' + port + '/' + id;

let name = '';

let sock = new SockJS(url);
sock.onopen = () => {};
sock.onmessage = (e) => {
	let message = e.data;
	if (message.startsWith('|updateuser|')) {
		name = message.split('|')[2];
		console.log('\n\e[1m' + name + ' is your guest nick!\e[m\n');
	} else {
		console.log(message);
	}
};
sock.onclose = () => process.exit(0);

export function open() {
	if (sock.readyState === SockJS.OPEN) return false;
	sock = new SockJS(url);
}
export function send(msg) {
	if (sock.readyState !== SockJS.OPEN) return false;
	sock.send(msg);
}
export function close() {
	if (sock.readyState !== SockJS.OPEN) return false;
	sock.close();
}
export {name};
