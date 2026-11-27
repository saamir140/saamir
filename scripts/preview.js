import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import api from '../api/leads.js';
import './build.js';
const opt=(name,defaultValue)=>{const i=process.argv.indexOf(name);return i<0?defaultValue:process.argv[i+1]};
const folder=path.resolve('dist'),types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.xml':'application/xml'};
http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/api/leads'){
   let body='';for await(const chunk of req){body+=chunk;if(body.length>16000){res.writeHead(413);res.end();return}}
   req.body=body;res.status=n=>{res.statusCode=n;return res};res.json=x=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(x))};return await api(req,res);
  }
  let file=path.resolve(folder,'.'+pathname);if(!file.startsWith(folder+'/')&&file!==folder)throw Error();
  if(pathname==='/')file=path.join(folder,'index.html');else if(!path.extname(file))file+='.html';
  try{await stat(file)}catch{file=path.join(folder,'404.html');res.statusCode=404}
  res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(await readFile(file));
 }catch{res.statusCode=400;res.end()}
}).listen(Number(opt('--port',process.env.PORT||5173)),opt('--host','127.0.0.1'));
