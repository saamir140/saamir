import {createHmac} from 'node:crypto';
import {validate} from '../lib/fields.js';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export function makeHandler(env=process.env,request=fetch){
 async function rpc(name,body){
  const res=await request(new URL('/rest/v1/rpc/'+name,env.SUPABASE_URL),{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
  if(!res.ok)throw Error('storage');return res.status===204?null:res.json();
 }
 async function notify(kind,lead,data){
  if(lead[kind+'_sent'])return;
  const admin=kind==='admin';
  const body={from:env.EMAIL_FROM,to:[admin?env.REVIEW_EMAIL:data.email],reply_to:env.REVIEW_EMAIL,subject:admin?'New growth audit application':'Your growth audit application',text:admin?
   'Application '+lead.lead_id+' received at '+lead.created_at+'. Review the restricted growth_private.leads record in your Supabase dashboard.':
   'Thank you for applying. Your reference is '+lead.lead_id+'. Samir will review your application and follow up about fit and next steps. Privacy notice: '+env.SITE_ORIGIN+'/privacy'};
  for(let attempt=0;attempt<2;attempt++){
   const res=await request('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':lead.lead_id+'-'+kind},body:JSON.stringify(body),signal:AbortSignal.timeout(6000)});
   if(res.ok){await rpc('growth_delivery_done',{p_id:lead.lead_id,p_kind:kind});return}
   if(res.status<500&&res.status!==429)break;
  }
  throw Error('delivery');
 }
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const fail=(s,message,extra={})=>res.status(s).json({success:false,message,...extra});
  if(req.method!=='POST'){res.setHeader('Allow','POST');return fail(405,'Use the application form.')}
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return fail(415,'Use the application form.');
  if(req.headers.origin && req.headers.origin!==env.SITE_ORIGIN && (!env.VERCEL_URL||req.headers.origin!=='https://'+env.VERCEL_URL))return fail(403,'Use the application form on this website.');
  let input=req.body;
  try{if(typeof input==='string')input=JSON.parse(input)}catch{return fail(400,'Invalid application.')}
  if(!input||typeof input!=='object'||Array.isArray(input)||Buffer.byteLength(JSON.stringify(input))>16000)return fail(400,'Invalid application.');
  if(input.company_fax||!uuid.test(input.idempotency_key||''))return fail(400,'Please retry using the application form.');
  const {data,errors}=validate(input);
  if(Object.keys(errors).length)return fail(422,'Please review the marked fields.',{field_errors:errors});
  if(input.attribution){data.attribution={};for(const k of ['utm_source','utm_medium','utm_campaign'])if(/^[a-z0-9_-]{1,64}$/i.test(input.attribution[k]||''))data.attribution[k]=input.attribution[k];if(['/','/apply','/about','/process','/case-studies'].includes(input.attribution.landing_path))data.attribution.landing_path=input.attribution.landing_path}
  if(env.INTAKE_ENABLED!=='true'||!['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','RATE_SECRET','EMAIL_FROM','REVIEW_EMAIL','RESEND_API_KEY','SITE_ORIGIN'].every(k=>env[k]))return fail(503,'Applications are currently closed. Please check back soon.');
  try{
   const network=String(req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
   const hash=createHmac('sha256',env.RATE_SECRET).update(network).digest('hex');
   const lead=await rpc('accept_growth_lead',{p_key:input.idempotency_key,p_network:hash,p_data:data});
   if(lead.status==='limited')return fail(429,'Too many attempts. Please try again later.');
   if(lead.status==='conflict')return fail(409,'Your earlier application was recorded with different details. Submit again to send these changes.');
   if(!lead.lead_id)throw Error('storage');
   await Promise.all([notify('admin',lead,data),notify('applicant',lead,data)]);
   return res.status(201).json({success:true,lead_id:lead.lead_id});
  }catch{return fail(503,'We could not confirm delivery. Keep this page open and retry with the same details.')}
 };
}
export default makeHandler();
