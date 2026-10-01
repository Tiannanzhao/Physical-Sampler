import {createStore,filename} from './store.js';
export function physicalSampler(){return {name:'physical-sampler',apply:'serve',handleHotUpdate(ctx){if(ctx.file.endsWith('/'+filename))return [];},configureServer(server){
 const store=createStore(server.config.root);
 server.middlewares.use('/__physical_sampler',async(req,res)=>{
  const send=(code,data)=>{res.statusCode=code;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));};
  try{
   const host=req.headers.host||'';if(!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host))return send(403,{error:'Local connections only'});
   if(req.headers.origin&&req.headers.origin!==`http://${host}`&&req.headers.origin!==`https://${host}`)return send(403,{error:'Origin rejected'});
   if(req.method==='GET')return send(200,store.read());
   if(req.method!=='POST')return send(405,{error:'Method not allowed'});
   if(req.headers['x-physical-sampler']!=='1'||!req.headers['content-type']?.startsWith('application/json'))return send(403,{error:'Expected sampler request'});
   let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>65536)return send(413,{error:'Request too large'});}
   const {id,values,revision}=JSON.parse(raw);send(200,store.update(id,values,revision));
  }catch(e){send(400,{error:e.message});}
 });
 server.watcher.add(`${server.config.root}/${filename}`);
}};}
