import { mkdir, writeFile, cp, rm } from "node:fs/promises";
import {
  sprintFee,
  weeklyPlan,
  method,
  phases,
  faqs,
  approved,
  categories,
  testimonials,
} from "../src/content.js";
import { projectBriefs } from "../src/project-briefs.js";
import { fields } from "../lib/fields.js";
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const cta = (place = "section") =>
  `<a class="button" href="/apply" data-place="${place}">Apply for a Growth Audit</a>`;
const mark =
  '<span class="mark" aria-hidden="true"><i></i><i></i><i></i></span>';
const brand = `<a class="brand" aria-label="Samir Liaquat home" href="/">${mark}Samir Liaquat<span>.</span></a>`;
const nav = `<header id="nav"><div class="wrap nav">${brand}<button class="toggle" aria-expanded="false" aria-controls="links">Menu</button><nav id="links" aria-label="Main navigation"><a href="/about">About Samir</a><a href="/#sprint">Plan</a><a href="/#work">Results</a><a href="/#offer">Pricing</a></nav><a class="button sticky-apply" href="/apply" data-place="sticky-header">${process.env.INTAKE_ENABLED === "true" ? "Apply now" : "Audit status"}</a></div></header>`;
const footer = `<footer><div class="wrap foot">${brand}<span>© ${new Date().getUTCFullYear()} Samir Liaquat</span><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/apply">Contact</a></div></footer>`;
const label = (s) => `<div class="label"><b></b>${s}</div>`;
const lead = (tag, title, desc = "") =>
  `${label(tag)}<h2>${title}</h2>${desc ? `<p class="intro">${desc}</p>` : ""}`;
const section = (id, cls, content) =>
  `<section class="block ${cls}" id="${id}"><div class="wrap">${content}</div></section>`;
const portrait = `<figure class="founder-portrait"><img src="/assets/saamir-liaquat.webp" srcset="/assets/saamir-liaquat-560.webp 560w, /assets/saamir-liaquat.webp 1254w" sizes="(max-width: 639px) min(72vw, 320px), 390px" width="1254" height="1254" alt="Samir Liaquat, independent ecommerce growth strategist" fetchpriority="high"></figure>`;
const funnelCard = (id, content) =>
  `<section id="${id}" class="funnel-card">${content}</section>`;
const hero = funnelCard(
  "home",
  `<div class="funnel-opening"><div>${label("45-Day Ecommerce Growth Sprint")}<h1>Find where your store loses buyers.</h1><p>I’m Samir Liaquat. I audit the journey from ad to checkout, fix the priority friction points with you, and test what changes.</p><div class="actions"><a class="button" href="#offer" data-place="hero">See the $500 sprint</a><a class="textlink" href="#work">Client results</a></div></div>${portrait}</div>`,
);
const pain = funnelCard(
  "problems",
  `<h2>What I’ll work on with you</h2><ul class="funnel-inclusions">
<li><strong>Shoppers abandon checkout</strong><span>I trace shipping, payment and trust issues. You get a friction map and a first fix to test.</span></li>
<li><strong>Clicks don’t turn into orders</strong><span>I check ad-to-page fit and reconcile purchase events. You get a tracking check and test brief.</span></li>
<li><strong>Every change feels urgent</strong><span>I weigh impact, margins and effort. You get a ranked roadmap and agreed implementation priorities.</span></li></ul>`,
);
const system = section(
  "method",
  "cloud",
  lead(
    "The method",
    "One connected growth system.",
    "Each step produces something you can use to make a decision.",
  ) +
    `<div class="grid three method">${method.map(([step, title, desc, out], i) => `<article class="step-card"><img class="step-image" src="/assets/method/${step.toLowerCase()}.webp" alt="" width="640" height="208" loading="lazy"><div class="step-body"><small>0${i + 1} / ${step}</small><h3>${title}</h3><p>${desc}</p><strong>${out}</strong></div></article>`).join("")}</div>`,
);
function workCards(filter = false) {
  const records = [
    ...approved,
    ...projectBriefs.filter(
      (brief) => !approved.some((item) => item.slug === brief.slug),
    ),
  ];
  const cards = (filter ? records : records.slice(0, 6))
    .map((x) => {
      const brief = projectBriefs.includes(x),
        title = brief ? x.title : x.clientDisplayName;
      const metric =
        !brief &&
        x.evidenceVerified &&
        x.evidenceType !== "projection" &&
        x.metricPeriod &&
        x.metricDefinition &&
        x.metricValue != null;
      const detail = brief
        ? `<dl class="brief-detail"><dt>Approach</dt><dd>${esc(x.work)}</dd><dt>Source</dt><dd>${esc(x.evidence)}</dd>${x.readings ? `<dt>Source details</dt><dd><ul>${x.readings.map(([label, value]) => `<li>${esc(label)} · ${esc(value)}</li>`).join("")}</ul></dd>` : ""}<dt>What the record supports</dt><dd>${esc(x.status)}</dd></dl>`
        : `<p>${esc(x.diagnosis)}</p><ul>${x.scope
            .slice(0, 3)
            .map((s) => "<li>" + esc(s) + "</li>")
            .join(
              "",
            )}</ul><p>${esc(x.approach.join(" "))}</p><p>${esc(x.outcomeText)}</p><p>${esc(x.evidenceType)} · ${esc(x.disclaimer)}</p>${metric ? `<strong>${esc(x.metricValue)} ${esc(x.metricLabel)} · ${esc(x.metricPeriod)}</strong><p>${esc(x.metricDefinition)}</p>` : ""}`;
      return `<article id="${filter ? "work" : "featured"}-${esc(x.slug)}" class="card workcard" data-cat="${esc(x.category)}">${brief ? `<img class="project-image" src="/assets/projects/${esc(x.image)}.webp" alt="" width="600" height="360" loading="lazy">` : ""}<div class="project-copy"><small>${esc(brief ? x.attribution : x.category)}</small>${brief ? `<strong class="result-value">${esc(x.headline)}</strong>` : ""}<h3>${esc(title)}</h3>${brief && x.slug === "messaging-acquisition" ? '<p class="result-note">PKR 25,000 sales · reported by Samir</p>' : ""}${filter ? `<p>${esc(x.challenge)}</p>` : ""}${filter ? `<details><summary>Read project notes</summary>${detail}</details>` : `<a class="textlink" href="/case-studies#work-${esc(x.slug)}">Explore project</a>`}</div></article>`;
    })
    .join("");
  return `${filter ? `<div class="filters" aria-label="Filter work">${["All", ...categories].map((x, i) => `<button data-filter="${x}" aria-pressed="${!i}">${x}</button>`).join("")}</div>` : ""}<div class="grid ${filter ? "two" : "three"}">${cards}</div><p class="empty" hidden>No work examples in this category.</p>`;
}
const featuredCampaign = projectBriefs.find(
  (x) => x.slug === "messaging-acquisition",
);
const campaignMetrics = featuredCampaign.readings
  .slice(0, 3)
  .map(
    ([name, value]) => `<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`,
  )
  .join("");
const selected = funnelCard(
  "work",
  `${label("Client results")}<h2>Turning ad spend into conversations</h2><p>A lead-generation project with a tightly controlled budget. These figures come from the campaign dashboard.</p><dl class="funnel-metrics">${campaignMetrics}</dl><p class="evidence-note">Samir separately reports PKR 25,000 in sales. The dashboard records messaging activity.</p><details class="additional-results"><summary>More results &amp; brand launches</summary>${workCards()}</details><a class="textlink" href="/case-studies">Read all seven project briefs</a>${testimonials
    .filter((x) => x.publicationApproved && x.consentApproved)
    .map(
      (x) =>
        `<blockquote><p>${esc(x.quote)}</p><cite>${esc(x.attribution)}</cite></blockquote>`,
    )
    .join("")}`,
);
const sprint = section(
  "sprint",
  "dark",
  lead(
    "45-Day Ecommerce Growth Sprint",
    "Four phases. One accountable strategist.",
    "A defined engagement for operating stores and brands preparing to launch.",
  ) +
    `<div class="grid four">${phases.map(([days, t, h, d, o], i) => `<article class="phase-card"><div class="phase-track" aria-hidden="true">${phases.map((_, j) => `<i class="${i === j ? "active" : ""}"></i>`).join("")}</div><small>DAYS ${days}</small><h3>${t}</h3><p>${d}</p><strong>${o}</strong></article>`).join("")}</div><div class="scope"><div><h3>What’s included</h3><p>Research, funnel and offer review, a prioritized roadmap, agreed CRO, creative, tracking or campaign changes, and a documented handoff.</p></div><div><h3>What you bring</h3><p>A real product, decision-maker access, business context and the ability to act on tests. Pre-launch work focuses on foundations.</p></div><div><h3>Investment & boundaries</h3><p>The full sprint costs ${sprintFee}. Media spend, paid tools and production are separate unless agreed in writing.</p></div></div><div class="actions">${cta("offer")}<a href="/process#deliverables">Explore the full scope</a><a href="/#sprint">Week-by-week roadmap</a></div>`,
);
const deliverables = section(
  "deliverables",
  "",
  lead(
    "Scope of work",
    "What gets reviewed.",
    "These are possible workstreams. Your signed scope identifies what can be delivered during the sprint.",
  ) +
    `<div class="grid three">${[
      [
        "Store & conversion",
        "Messaging, product detail pages, the cart and checkout friction.",
      ],
      [
        "Paid acquisition",
        "Campaign structure, intent, creative angles and landing-page fit.",
      ],
      [
        "Offer & customer psychology",
        "Positioning, objections, trust and purchase motivation.",
      ],
      [
        "Content & funnel",
        "Awareness, consideration and decision-stage content hypotheses.",
      ],
      [
        "Brand & market",
        "Competitive analysis, differentiation and message consistency.",
      ],
      [
        "Measurement & iteration",
        "Event quality, funnel reporting, test documentation and updates.",
      ],
    ]
      .map(
        ([a, b]) => `<article class="card"><h3>${a}</h3><p>${b}</p></article>`,
      )
      .join("")}</div>`,
);
const homeSprint = funnelCard(
  "sprint",
  `<h2>Your 45-day plan</h2><div class="weekly-list">${weeklyPlan.map(([week, days, title, action, output]) => `<details class="week"><summary><span class="week-date">${week}<small>Days ${days}</small></span><span>${title}</span></summary><div class="week-notes"><p>${action}</p><p class="pain-output"><b>You get</b> ${output}</p></div></details>`).join("")}</div><a class="textlink" href="/process">Explore my method</a>`,
);
const intakeOpen = process.env.INTAKE_ENABLED === "true";
const packageCard = funnelCard(
  "offer",
  `<h2>45-Day Implementation Offer</h2>
  <ul class="implementation-deliverables">
    <li><strong>Audit your store.</strong> I review product pages, checkout, ads and tracking.</li>
    <li><strong>Diagnose the bottleneck.</strong> I trace where buyers drop off and identify the first fix worth testing.</li>
    <li><strong>Set priorities.</strong> I rank opportunities by impact, effort and your margins.</li>
    <li><strong>Build your marketing strategy.</strong> I map the audience, offer and creative angles into a test plan.</li>
    <li><strong>Implement the plan.</strong> I ship the agreed page, campaign or tracking changes and check they work.</li>
    <li><strong>Measure the results.</strong> I compare test data with your baseline and hand over findings and next steps.</li>
  </ul>
  <div class="implementation-price"><span>Full 45-day fee</span><strong>${sprintFee}</strong></div>
  <p class="fee-note">Ad spend, paid tools and outside production are separate.</p>
  <div class="offer-action"${intakeOpen ? "" : ' id="application"'}>
  ${intakeOpen ? "" : "<p>Applications are currently closed.</p>"}
  <a class="button" href="/apply" data-place="offer">${intakeOpen ? "Apply for the sprint" : "View application status"}</a></div>`,
);
const faq = section(
  "faq",
  "cloud",
  `<div class="faqgrid"><div>${lead("FAQs", "Before you apply.")}</div><div>${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div>`,
);
const final = section(
  "offer",
  "offer-band",
  `<div class="engagement"><div>${label("Work with Samir")}<h2>45-Day Ecommerce <br>Growth Sprint</h2><p>One consultant from diagnosis through handoff.</p><ul><li>Store and acquisition audit</li><li>Prioritized roadmap and agreed implementation</li><li>Test findings and a next-step plan</li></ul></div><div class="terms-card"><span>Full sprint fee</span><strong>${sprintFee}</strong><p>Ad spend, paid tools and outside production are separate.</p>${cta("offer")}<a href="/process#faq" class="textlink">Pricing & engagement FAQs</a></div></div>`,
);
function field([key, name, rule], i) {
  const attr = `name="${key}" id="${key}" aria-describedby="err-${key}" ${i < 10 ? "required" : ""}`;
  const control = Array.isArray(rule)
    ? `<select ${attr}><option value="">Select an option</option>${rule.map((x) => `<option>${x}</option>`).join("")}</select>`
    : key === "goal"
      ? `<textarea ${attr} minlength="20" maxlength="1000" rows="4"></textarea>`
      : `<input ${attr} type="${key === "email" ? "email" : key === "store_url" ? "url" : "text"}" maxlength="${rule}" ${key === "full_name" ? 'minlength="2" autocomplete="name"' : key === "email" ? 'autocomplete="email"' : key === "store_url" ? 'placeholder="https://"' : ""}>`;
  return `<div class="field ${key === "goal" ? "wide" : ""}"><label for="${key}">${name}</label>${control}<small id="err-${key}"></small></div>`;
}
const form = `${process.env.INTAKE_ENABLED === "true" ? "" : '<p class="preview-note">Growth Audit applications are currently closed.</p>'}<form id="lead" action="/api/leads" method="post"><p id="status" role="alert" tabindex="-1"></p><fieldset><legend>Your store</legend><div class="fields">${fields.slice(0, 10).map(field).join("")}</div></fieldset><details><summary>Commercial context (optional)</summary><div class="fields">${fields
  .slice(10)
  .map((x, i) => field(x, i + 10))
  .join(
    "",
  )}</div></details><div hidden><input name="company_fax" tabindex="-1" autocomplete="off"></div><label class="check"><input type="checkbox" name="privacy_consent" required aria-describedby="err-privacy_consent"> <span>I have read the <a href="/privacy" target="_blank" rel="noopener">privacy notice</a> and agree to the use of these details to review my application.</span></label><small id="err-privacy_consent"></small><button class="button" type="submit">Submit application</button><noscript><p>Enable JavaScript to submit securely.</p></noscript></form>`;
const inner = (tag, h, body) =>
  `<div class="wrap inner">${label(tag)}<h1>${h}</h1>${body}</div>`;
const applicationCard = intakeOpen
  ? funnelCard(
      "application",
      `<h2>Apply for a Growth Audit</h2><p>Tell me about your store so I can review fit.</p>${form}`,
    )
  : "";
const pages = {
  "": [
    "Ecommerce Growth Strategist | 45-Day Growth Sprint – Samir Liaquat",
    hero + pain + homeSprint + selected + applicationCard + packageCard,
  ],
  process: [
    "The growth method",
    inner(
      "The growth method",
      "From research to execution.",
      "<p>Follow the decisions and outputs in a sprint.</p>",
    ) +
      system +
      deliverables +
      sprint +
      faq,
  ],
  about: [
    "About Samir Liaquat",
    `<section class="wrap inner about-founder"><div>${label("Independent ecommerce growth strategist")}<h1>Meet Samir Liaquat.</h1><p>I work directly with founders who want to understand why their store is underperforming and decide what to change first.</p><h2>How we work together</h2><p>We begin with customers, economics and the buying journey. I turn those findings into a short list of decisions, agree the scope with you and document what changes. You retain control of business accounts and approvals.</p><h2>Who the sprint suits</h2><p>Operating stores with traffic or sales signals, and pre-launch founders with a defined product and market. If you need guaranteed returns, instant results or an unscoped full rebuild, this engagement is unlikely to fit.</p></div>${portrait}</section>` +
      final,
  ],
  "case-studies": [
    "Work library",
    inner(
      "Work library",
      "Growth work by discipline.",
      `<p>Seven project briefs with campaign metrics, reported sales and launch status. Source details are included in each brief. Cover photos are editorial illustrations.</p>${workCards(true)}`,
    ) + final,
  ],
  apply: [
    "Apply for a Growth Audit",
    inner(
      "Work with Samir",
      "Apply for a Growth Audit.",
      process.env.VERCEL_ENV === "production" &&
        process.env.INTAKE_ENABLED !== "true"
        ? '<p>Growth Audit applications are currently closed.</p><a class="textlink" href="/#sprint">Explore the 45-Day Plan</a>'
        : "<p>The application is free. Share your business context so I can review fit and suggest a next step. Please leave out passwords and customer information.</p>" +
            form,
    ),
  ],
  "thank-you": [
    "Application status",
    inner(
      "Growth audit",
      "Application status",
      '<p id="confirmation">Your submission reference appears after a successful application.</p><a class="textlink" href="/">Back to home</a>',
    ),
  ],
  privacy: [
    "Application privacy notice",
    inner(
      "Website information",
      "Application privacy notice.",
      "<p>This form asks for contact details, store information, business goals and optional commercial ranges so Samir can assess fit and respond.</p><h2>Processing and access</h2><p>When intake is enabled, Vercel processes the request, a restricted Supabase database stores the application and Resend delivers the acknowledgment and review notification. A short-lived hashed network identifier is used to limit spam. No advertising pixels or marketing subscriptions are enabled.</p><h2>Your application</h2><p>Reply to the acknowledgment email to request access, correction or deletion. Include your application reference. Please do not include customer records or account credentials.</p>",
    ),
  ],
  terms: [
    "Website terms",
    inner(
      "Website information",
      "Website terms.",
      "<p>The information here describes a potential engagement. Submitting an application requests a fit review. It does not create a service agreement or reserve a start date.</p><h2>Engagement scope</h2><p>Deliverables, responsibilities, pricing, IP, confidentiality, cancellation and payment terms are agreed in writing before work begins. Examples illustrate the approach. Outcomes depend on the business and are not guaranteed.</p>",
    ),
  ],
  404: [
    "Page not found",
    inner(
      "404",
      "Page not found.",
      '<p>The page may have moved.</p><div class="actions"><a class="textlink" href="/">Back to home</a>' +
        cta() +
        "</div>",
    ),
  ],
};
const live = process.env.PUBLIC_LAUNCH === "approved",
  origin = process.env.SITE_ORIGIN || "https://saamir.vercel.app";
await rm("dist", { recursive: true, force: true });
await mkdir("dist");
await cp("public", "dist", { recursive: true });
await cp("assets", "dist/assets", { recursive: true });
for (const [slug, [title, body]] of Object.entries(pages)) {
  const path = "/" + slug,
    desc = slug
      ? title + " | Samir Liaquat."
      : "Ecommerce audits, CRO, acquisition strategy and focused 45-day implementation. Work directly with Samir to identify growth bottlenecks.";
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": slug === "about" ? "ProfilePage" : "WebPage",
    name: title,
    url: origin + path,
    ...(slug === "about"
      ? {
          mainEntity: {
            "@type": "Person",
            name: "Samir Liaquat",
            jobTitle: "Ecommerce Growth Strategist",
          },
        }
      : {}),
  });
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="theme-color" content="#090a0b"><meta name="color-scheme" content="dark"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="${live && !["404", "apply", "thank-you", "case-studies"].includes(slug) ? "index,follow" : "noindex,follow"}"><link rel="canonical" href="${origin + path}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${origin}/assets/share.png"><script type="application/ld+json">${schema}</script><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/style.css"><script defer src="/script.js"></script></head><body><a href="#main" class="skip">Skip to content</a>${nav}<main id="main"${slug === "" ? ' class="consulting-funnel"' : ""}>${body}</main>${footer}</body></html>`;
  await writeFile("dist/" + (slug || "index") + ".html", html);
}
await writeFile(
  "dist/sitemap.xml",
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    ["", "process", "about", "privacy", "terms"]
      .map((x) => "<url><loc>" + origin + "/" + x + "</loc></url>")
      .join("") +
    "</urlset>",
);
await writeFile(
  "dist/robots.txt",
  "User-agent: *\nDisallow: " +
    (live ? "/api/" : "/") +
    "\nSitemap: " +
    origin +
    "/sitemap.xml\n",
);
