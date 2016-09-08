'use strict';

import {login} from '../config';
import * as sock from './server';

sock.send('|/trn ' + sock.name + ',1,' + login.get('avatar'));
