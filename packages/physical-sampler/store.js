import fs from 'node:fs';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
export const filename='physical-sampler.config.json';
const safeKey=s=>typeof s==='string'&&/^[a-zA-Z][\w-]{0,63}$/.test(s)&&!['constructor','prototype','__proto__'].includes(s);
export function validate(config){
 if(config.version!==1||!Array.isArray(config.components))throw Error('Expected version 1 and components array');
 const ids=new Set();
 for(const c of config.components){
  if(!safeKey(c.id)||ids.has(c.id)||typeof c.label!=='string'||!Array.isArray(c.parameters))throw Error('Invalid or duplicate component');ids.add(c.id);
  const keys=new Set();
  for(const p of c.parameters){
   if(!safeKey(p.id)||keys.has(p.id)||typeof p.label!=='string')throw Error('Invalid or duplicate parameter');keys.add(p.id);
   if(!['number','boolean','select','color'].includes(p.type))throw Error('Unsupported parameter type');
   if(p.type==='number'&&(!Number.isFinite(p.min)||!Number.isFinite(p.max)||p.max<p.min||!Number.isFinite(p.step)||p.step<=0))throw Error('Invalid numeric range');
   if(p.type==='select'&&(!Array.isArray(p.options)||!p.options.length||!p.options.every(x=>typeof x==='string')))throw Error('Invalid options');
   checkValue(p,p.value);
  }
 }
 return config;
}
function checkValue(p,v){
 if(p.type==='number'&&(!Number.isFinite(v)||v<p.min||v>p.max))throw Error(`${p.id}: value outside range`);
 if(p.type==='boolean'&&typeof v!=='boolean')throw Error(`${p.id}: expected boolean`);
 if(p.type==='color'&&(typeof v!=='string'||!/^#[0-9a-f]{6}$/i.test(v)))throw Error(`${p.id}: expected hex color`);
 if(p.type==='select'&&!p.options.includes(v))throw Error(`${p.id}: unknown option`);
}
export function createStore(root){
 root=fs.realpathSync(root);const file=path.join(root,filename);
 function read(){if(fs.lstatSync(file).isSymbolicLink())throw Error('Config must not be a symlink');const raw=fs.readFileSync(file,'utf8');return {config:validate(JSON.parse(raw)),revision:createHash('sha256').update(raw).digest('hex')};}
 function commit(config,expected){const current=read();if(!expected||current.revision!==expected)throw Error('Config changed. Reload before applying.');validate(config);const tmp=path.join(root,`.physical-sampler-${randomUUID()}.tmp`);fs.writeFileSync(tmp,JSON.stringify(config,null,2)+'\n',{flag:'wx'});fs.renameSync(tmp,file);return read();}
 function update(id,values,revision){const {config}=read();const c=config.components.find(x=>x.id===id);if(!c)throw Error('Unknown component');if(!values||Array.isArray(values)||typeof values!=='object')throw Error('Expected values object');for(const [key,v] of Object.entries(values)){const p=c.parameters.find(x=>x.id===key);if(!p)throw Error(`Unknown parameter: ${key}`);checkValue(p,v);p.value=v;}return commit(config,revision);}
 return {read,commit,update};
}
