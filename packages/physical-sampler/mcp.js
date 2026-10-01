import readline from 'node:readline';
import {createStore} from './store.js';
const object=(properties,required=[])=>({type:'object',properties,required,additionalProperties:false});
const tools=[
 {name:'sampler_inspect',description:'Read registered components, their motion-specific controls, current values and revision. Components must bind these values in their implementation.',inputSchema:object({})},
 {name:'sampler_set_parameters',description:'Persist validated values to the project config consumed by components. Live panel notices the update. Pass the revision from inspect to avoid overwriting changes.',inputSchema:object({id:{type:'string'},values:{type:'object'},revision:{type:'string'}},['id','values','revision'])},
 {name:'sampler_register_component',description:'Register or replace a component control schema after implementing its useSampler binding in source. This does not implement animation code. Types: number (min,max,step), boolean, color (#rrggbb), select (options). Each parameter needs id,label,type,value.',inputSchema:object({component:{type:'object'},revision:{type:'string'}},['component','revision'])}
];
export function startMcp(root){
 const store=createStore(root);let initialized=false;
 const reply=x=>process.stdout.write(JSON.stringify(x)+'\n');
 const lines=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
 lines.on('line',line=>{
  let m;try{m=JSON.parse(line);}catch{reply({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}});return;}
  if(m.id===undefined)return;
  try{
   if(m.jsonrpc!=='2.0'||typeof m.method!=='string')throw {code:-32600,message:'Invalid request'};
   let result;
   if(m.method==='initialize'){initialized=true;result={protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'physical-sampler',version:'0.1.0'},instructions:'Inspect controls first. Edit component source to add behavior, then register corresponding controls. Config values are design choices, not measurements from video. Only registered bindings affect the UI.'};}
   else if(m.method==='ping')result={};
   else if(!initialized)throw {code:-32002,message:'Initialize first'};
   else if(m.method==='tools/list')result={tools};
   else if(m.method==='tools/call'){
    try{const a=m.params?.arguments||{};let data;
     switch(m.params?.name){
      case 'sampler_inspect':data=store.read();break;
      case 'sampler_set_parameters':data=store.update(a.id,a.values,a.revision);break;
      case 'sampler_register_component':{const {config}=store.read();const i=config.components.findIndex(c=>c.id===a.component?.id);if(i<0)config.components.push(a.component);else config.components[i]=a.component;data=store.commit(config,a.revision);break;}
      default:throw Error('Unknown tool');
     }result={content:[{type:'text',text:JSON.stringify(data)}]};
    }catch(e){result={isError:true,content:[{type:'text',text:e.message}]};}
   }else throw {code:-32601,message:'Method not found'};
   reply({jsonrpc:'2.0',id:m.id,result});
  }catch(e){reply({jsonrpc:'2.0',id:m.id,error:{code:e.code||-32603,message:e.message}});}
 });
}
