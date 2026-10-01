#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {startMcp} from './mcp.js';
const [command,...args]=process.argv.slice(2);
const root=path.resolve(args[0]||process.cwd());
if(command==='mcp')startMcp(root);
else if(command==='init'){
 const config=path.join(root,'physical-sampler.config.json');
 if(!fs.existsSync(config))fs.writeFileSync(config,JSON.stringify({version:1,components:[]},null,2)+'\n');
 const server={command:process.execPath,args:[fileURLToPath(import.meta.url),'mcp',root]};
 for(const [file,key] of [['.cursor/mcp.json','mcpServers'],['.mcp.json','mcpServers'],['.vscode/mcp.json','servers']]){
  const dest=path.join(root,file);const data=fs.existsSync(dest)?JSON.parse(fs.readFileSync(dest,'utf8')):{};
  data[key]??={};if(data[key]['physical-sampler']){console.log(`Keeping existing ${file}`);continue;}
  data[key]['physical-sampler']=file.startsWith('.vscode')?{type:'stdio',...server}:server;
  fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(data,null,2)+'\n');
 }
 console.log('MCP settings prepared for Cursor, Claude Code and VS Code. Enable the server in your editor.');
 console.log('React/Vite setup is still required. See node_modules/physical-sampler/README.md for manual setup and the coding-agent brief.');
}else{console.log('physical-sampler init [project-folder]\nphysical-sampler mcp [project-folder]');process.exitCode=command?1:0;}
