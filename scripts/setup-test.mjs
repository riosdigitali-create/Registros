import fs from 'node:fs';
import {randomBytes} from 'node:crypto';
import {passwordHash} from '../worker/index.js';
fs.mkdirSync('.wrangler',{recursive:true});
const password='SoloPruebasLocales2026',salt=randomBytes(16).toString('hex');
fs.writeFileSync('.dev.vars','ADMIN_PASSWORD_HASH="pbkdf2:'+salt+':'+await passwordHash(password,salt)+'"\n');
fs.writeFileSync('.wrangler/test-secrets.json',JSON.stringify({password}));
console.log('Local test authentication configured.');
