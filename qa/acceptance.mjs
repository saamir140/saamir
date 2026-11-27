import {chromium} from "playwright";
import {createRequire} from "node:module";
import {mkdir,writeFile} from "node:fs/promises";
import assert from "node:assert/strict";
import lighthouse from "lighthouse";
import {launch} from "chrome-launcher";
const require=createRequire(import.meta.url);
const origin="http://127.0.0.1:5173";
const out=new URL("./results/",import.meta.url);
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage();
const routes=["/","/about","/process","/case-studies","/apply","/privacy","/terms","/thank-you","/missing-page"];
const issues=[];
try{
 for(const width of [320,360,390,768,1024,1280,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of routes){
   const response=await page.goto(origin+route);
   assert.equal(response.status(),route==="/missing-page"?404:200);
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),"rgb(9, 10, 11)");
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+"px "+route+" overflows");
   if(width===390||width===1440){
    await page.addScriptTag({path:require.resolve("axe-core/axe.min.js")});
    const failures=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>({id:v.id,impact:v.impact,selector:v.nodes[0].target})));
    if(failures.length)issues.push({width,route,failures});
    if(route==="/"||route==="/apply")await page.screenshot({path:new URL((route==="/"?"home":"apply")+"-"+width+".png",out).pathname,fullPage:true});
   }
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(origin);
 await page.keyboard.press("Tab");
 assert.equal(await page.locator(":focus").innerText(),"Skip to content");
 const sticky=page.locator("header .sticky-apply");
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:844});await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
  const box=await sticky.boundingBox();assert.ok(box&&box.y>=0&&box.y+box.height<=90&&box.x>=0&&box.x+box.width<=width);
 }
 assert.equal(await sticky.innerText(),"Audit status");
 await sticky.click();assert.equal(new URL(page.url()).pathname,"/apply");
 await page.setViewportSize({width:390,height:844});await page.goto(origin);
 assert.equal(await page.locator(".funnel-card").evaluateAll(cards=>new Set(cards.map(c=>getComputedStyle(c).backgroundColor)).size),6);
 const menu=page.getByRole("button",{name:"Menu"});await menu.focus();await page.keyboard.press("Enter");
 assert.equal(await menu.getAttribute("aria-expanded"),"true");await page.keyboard.press("Escape");assert.equal(await menu.getAttribute("aria-expanded"),"false");assert.ok(await menu.evaluate(el=>el===document.activeElement));
 assert.deepEqual(await page.locator("main > section").evaluateAll(nodes=>nodes.map(n=>n.id)),["home","problems","sprint","work","offer","application"]);
 assert.equal(await page.locator("#problems .funnel-inclusions li").count(),3);
 assert.equal(await page.locator("#sprint details.week").count(),7);
 const handoff=page.locator("#sprint details.week").last();
 await handoff.locator("summary").focus();await page.keyboard.press("Enter");
 assert.ok(await handoff.evaluate(el=>el.open));
 assert.match(await handoff.innerText(),/Days 43–45/);
 assert.equal(await page.locator("#offer .funnel-price strong").innerText(),"$500 USD");
 assert.equal(await page.locator("#work .result-value").count(),6);
 await page.locator("#work .additional-results summary").click();
 assert.match(await page.locator("#work").innerText(),/8.79% CTR \(all\)/);
 await page.locator('[data-place="hero"]').click();assert.equal(new URL(page.url()).hash,"#offer");
 await page.goto(origin+"/process");
 const firstFAQ=page.locator("#faq summary").first();await firstFAQ.focus();await page.keyboard.press("Enter");assert.ok(await firstFAQ.evaluate(el=>el.parentElement.open));
 assert.equal(await page.locator("#method .step-image").count(),6);
 await page.goto(origin+"/case-studies");
 await page.getByRole("button",{name:"Acquisition",exact:true}).click();assert.equal(await page.locator("main [data-cat]:visible").count(),3);
 assert.equal(await page.locator("main .project-image").count(),7);
 await page.goto(origin);
 await page.locator('[data-place="offer"]').click();assert.equal(new URL(page.url()).pathname,"/apply");
 for(const [key,value] of Object.entries({full_name:"Test Founder",email:"qa@example.test",brand:"Example",store_url:"https://example.test",market:"Test market",category:"Home",goal:"Identify where the buying journey breaks down."}))await page.locator('[name="'+key+'"]').fill(value);
 for(const key of ["platform","stage","bottleneck"])await page.locator('[name="'+key+'"]').selectOption({index:1});
 await page.locator('[name="privacy_consent"]').check();
 // Real local API is closed. Synthetic test data stays inside the isolated runner.
 await page.getByRole("button",{name:"Submit application"}).click();await page.locator("#status:not(:empty)").waitFor();assert.match(await page.locator("#status").innerText(),/closed|application form/);
 assert.equal(await page.locator('[name="brand"]').inputValue(),"Example");
 // The success-path UI uses a controlled API acknowledgment; provider delivery is tested separately.
 await page.route("**/api/leads",r=>r.fulfill({status:201,json:{success:true,lead_id:"704604f6-5167-4222-b774-1926fdfdc870"}}));
 await page.getByRole("button",{name:"Submit application"}).click();
 await page.waitForURL("**/thank-you?ref=*");assert.equal(await page.locator("h1").innerText(),"Application received.");
}finally{
 await browser.close();await writeFile(new URL("accessibility.json",out),JSON.stringify(issues,null,2));
}
const chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:["--headless","--no-sandbox"]});
try{
 const report=await lighthouse(origin,{port:chrome.port,output:"html",logLevel:"error",onlyCategories:["performance","accessibility","best-practices","seo"]});
 await writeFile(new URL("lighthouse.html",out),report.report);
 console.log(Object.fromEntries(Object.entries(report.lhr.categories).map(([k,v])=>[k,v.score])));
}finally{await chrome.kill()}
assert.deepEqual(issues,[]);
console.log("Nine routes checked at seven widths. Keyboard, filters, application retry and confirmation passed.");
