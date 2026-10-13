// Mask the password, hash locally, send the hash to Wrangler through stdin only.
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {passwordHash} from '../worker/index.js';
if(!process.stdin.isTTY)throw new Error('Ejecuta este archivo en una terminal interactiva.');
process.stdout.write('Nueva contraseña del panel (mínimo 6 caracteres): ');
process.stdin.setRawMode(true);process.stdin.resume();let password='';
process.stdin.on('data',async chunk=>{
 const chars=chunk.toString();if(chars==='\u0003')process.exit(1);
 if(chars==='\r'||chars==='\n'){
  process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');
  if(password.length<6){process.stderr.write('Usa al menos 6 caracteres.\n');process.exit(1);}
  const salt=randomBytes(16).toString('hex'),encoded='pbkdf2:'+salt+':'+await passwordHash(password,salt);password='';
  const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','put','ADMIN_PASSWORD_HASH'],{stdio:['pipe','inherit','inherit']});child.stdin.end(encoded+'\n');child.on('exit',code=>process.exit(code||0));return;
 }
 if(chars==='\u007f'||chars==='\b'){password=password.slice(0,-1);process.stdout.write('\b \b');}else{password+=chars;process.stdout.write('*'.repeat(chars.length));}
});
