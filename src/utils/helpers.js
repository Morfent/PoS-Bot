export const toId = (str) => str.toLowerCase().replace(/[^a-z0-9-]+/g, '');
export const toRoomid = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '');

export const ok = (...args) => console.log('[OK]   ', ...args);
export const log = (...args) => console.log('[LOG]  ', ...args);
export const info = (...args) => console.info('[INFO] ', ...args);
export const error = (...args) => console.error('[ERR]  ', ...args);
export const fatal = (...args) => {
	console.error('[FATAL]', ...args);
	process.exit(-1);
};
