'use strict';

import {Map, Set} from 'immutable';

// The three types of rooms (for the most part) send messages unique to that
// type of room.
const messageTypes = Map({
	global: Set([
		'updateuser', 'formats', 'queryresponse', 'challstr', 'pm', 'popup',
		'usercount', 'nametaken', 'updatechallenges', 'updatesearch', 'refresh',
		'disconnect'
	]),
	chat: Set([
		'init', 'title', 'users', ':', 'raw', 'html', 'uhtml', 'uhtmlchange',
		'deinit', 'noinit', 'unlink', 'expire', 'userstats', 'tournament', 'tournaments',
		'j', 'J', 'l', 'L', 'n', 'N', 'b', 'B', 'c', 'c:', 'm:', '', 'tc',
		'chat', 'join', 'leave', 'name'
	]),
	battle: Set([
		'init', 'title', 'inactiveoff', 'askreg', 'inactive', 'inactiveoff', 'eval',
		'request', 'dealloc', 'choose', 'undo', 'rename', 'join', 'leave', 'win', 'tie',
		'sideupdate', 'callback', 'choice', 'teampreview', 'message', 'move', 'shift',
		'inactiveside', 'swap', 'gametype', 'gen', 'tier', 'seed', 'rated', 'team',
		'pass', 'default', 'skip', 'switch', 'instaswitch', 'split', 'debug', 'player',
		'score', 'winupdate', 'update', 'log', 'start', 'turn', 'variation', 'rule',
		'chatmessage', 'chatmessage-raw', 'raw', 'html', 'spectator', 'spectatorleave',
		'prematureend', 'clearpoke', 'poke', 'detailschange', 'drag', 'replace',
		'faint', 'cant', 'done', '', 'error', 'warning', 'unlink',
		'chat', 'join', 'leave', 'name', 'j', 'J', 'l', 'L', 'n', 'N', 'c', 'c:', 'm:',
		'-message', '-transform', '-formechange', '-curestatus', '-fail', '-immune',
		'-enditem', '-activate', '-ability', '-center', '-boost', '-unboost',
		'-setboost', '-hint', '-damage', '-heal', '-supereffective', '-resisted',
		'-crit', '-sethp', '-swapboost', '-restoreboost', '-copyboost', '-clearboost',
		'-invertboost', '-clearallboost', '-miss', '-notarget', '-ohko', '-hitcount',
		'-nothing', '-waiting', '-combine', '-prepare', '-mustrecharge', '-status',
		'-cureteam', '-item', '-endability', '-mega', '-primal', '-end', '-singleturn',
		'-singlemove', '-activate', '-weather', '-fieldstart', '-fieldend', '-anim',
		'-fieldactivate'
	])
});

export default messageTypes;
