import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {makeHandler} from '../api/leads.js';
const origin='https://example.test';
const env={INTAKE_ENABLED:'true',SITE_ORIGIN:origin,SUPABASE_URL:'https://db.example.test',SUPABASE_SERVICE_ROLE_KEY:'test',RATE_SECRET:'test',EMAIL_FROM:'test@example.test',REVIEW_EMAIL:'review@example.test',RESEND_API_KEY:'test'};
const sample={full_name:'Example Founder',email:'hello@example.test',store_url:origin,brand:'Demo',market:'UK',platform:'Shopify',category:'Home',stage:'Operating store',bottleneck:'Conversion',goal:'Learn where buyers leave the store.',privacy_consent:true,idempotency_key:randomUUID()};
async function call(body,request,custom=env,headers={}){
 const res={setHeader(){},status(s){this.code=s;return this},json(data){this.body=data}};
 await makeHandler(custom,request)({body,headers:{'content-type':'application/json',origin,...headers},method:'POST'},res);return res;
}
test('required fields, stage, consent and URL validation',async()=>{
 const res=await call({...sample,full_name:'x',email:'invalid',store_url:'javascript:void(0)',stage:'any',goal:'x',privacy_consent:false});
 assert.equal(res.code,422);assert.deepEqual(Object.keys(res.body.field_errors).sort(),['email','full_name','goal','privacy_consent','stage','store_url']);
});
test('honeypot, origin and closed intake',async()=>{
 assert.equal((await call({...sample,company_fax:'bot'})).code,400);
 assert.equal((await call(sample,null,env,{origin:'https://wrong.test'})).code,403);
 assert.equal((await call(sample,null,{} ,{origin:undefined})).code,503);
});
test('storage failure, rate limit and conflicting replay are visible',async()=>{
 for(const [status,expected] of [['limited',429],['conflict',409],['fail',503]]){
  const res=await call(sample,()=>status==='fail'?Promise.reject(Error()):Response.json({status}));assert.equal(res.code,expected);
 }
});
test('notification failure retains record and retry sends only pending email',async()=>{
 const lead={lead_id:randomUUID(),created_at:new Date().toISOString(),admin_sent:false,applicant_sent:false};
 let fail=true,mailCount=0;
 const transport=async(url,opts)=>{
  const body=JSON.parse(opts.body),path=String(url);
  if(path.endsWith('accept_growth_lead'))return Response.json(lead);
  if(path.endsWith('growth_delivery_done')){lead[body.p_kind+'_sent']=true;return new Response(null,{status:204})}
  mailCount++;return new Response(null,{status:fail&&body.to[0]===sample.email?400:200});
 };
 assert.equal((await call(sample,transport)).code,503);assert.equal(lead.admin_sent,true);
 fail=false;const ok=await call(sample,transport);assert.equal(ok.code,201);assert.equal(ok.body.lead_id,lead.lead_id);
 assert.equal((await call(sample,transport)).code,201);assert.equal(mailCount,3);
});
