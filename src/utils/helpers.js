'use strict';

/* eslint-disable */
export const toId = (str) => str.toLowerCase().replace(/[^a-z0-9-]+/g, '');
export const toRoomid = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '');
export const splitUserInfo = (userinfo) => [userinfo.charAt(0), userinfo.slice(1)];
