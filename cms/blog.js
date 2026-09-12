import {renderHeader} from "./header.js";
import {renderFooter} from "./footer.js";
const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const published = data => data.posts.filter(p=>p.status==="published").sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.title.localeCompare(b.title));
const absolute = (v,origin) => new URL(v || "/assets/hero-img.jpeg",origin).href;
const css = `
:root{--green:#004d40;--gold:#b8952b;--ink:#172b27;--muted:#526960;--paper:#f5f8f5}
*{box-sizing:border-box}body{margin:0;font-family:Tajawal,system-ui,sans-serif;color:var(--ink);background:var(--paper);line-height:1.8}
a{color:var(--green);text-underline-offset:4px}img{max-width:100%;display:block}button,input,select{font:inherit}
main{max-width:1120px;padding:36px 24px 72px;margin:64px auto 0}h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.4;margin:12px 0 18px}h2{line-height:1.5}p{margin:0 0 20px}.muted{color:var(--muted)}.eyebrow{color:var(--green);font-weight:700}.hero{padding:24px 0 36px;max-width:760px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:24px}.card{background:white;border:1px solid #dce5de;border-radius:18px;overflow:hidden}.card img{width:100%;height:210px;object-fit:cover}.card-body{padding:24px}.card h2{font-size:1.4rem}.card h2 a{text-decoration:none}.tag{display:inline-block;padding:3px 12px;background:#e6eee7;color:var(--green);border-radius:30px;font-size:.9rem}
.search{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px}.search input,.search select{padding:12px;border:1px solid #a9bcb0;border-radius:8px;background:white}.search input{flex:1;min-width:180px}.button,button{display:inline-block;padding:12px 22px;border:0;border-radius:8px;background:var(--green);color:white;font-weight:700;text-decoration:none;cursor:pointer}.article{max-width:800px;background:white;margin:0 auto;padding:clamp(24px,5vw,48px);border-radius:20px;border:1px solid #dce5de}.article-cover{width:100%;max-height:420px;object-fit:cover;border-radius:12px;margin:24px 0}.article-body{font-size:1.15rem;line-height:2}.article-body h2{font-size:1.5rem;margin-top:36px}.article-body p{white-space:pre-line}.cta{background:#e9f0e9;border-radius:12px;padding:24px;margin-top:32px}.breadcrumbs{margin-bottom:20px;font-size:.9rem}.meta{display:flex;gap:16px;flex-wrap:wrap;color:var(--muted);font-size:.95rem}.pagination{display:flex;gap:12px;justify-content:center;margin:32px 0}.empty{padding:50px 24px;background:white;border:1px solid #dce5de;border-radius:16px}.related{margin-top:48px}a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid var(--gold);outline-offset:4px}.skip{position:absolute;top:-100px}.skip:focus{top:0;background:white;padding:12px;z-index:110}@media(max-width:600px){main{padding:24px 16px 48px}.search button{width:100%}}
`;
function layout(data, {title,description,canonical,image,body,schema,status=200,noindex=false}, origin) {
  const jsonld=schema?'<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,"\\u003c")+'</script>':"";
  return new Response(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${noindex?"noindex, follow":"index, follow, max-image-preview:large"}"><link rel="canonical" href="${esc(canonical)}"><link rel="alternate" type="application/rss+xml" title="مدونة تقنية الارتفاع" href="${origin}/blog/rss.xml"><meta property="og:type" content="${schema?"article":"website"}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(absolute(image,origin))}"><meta property="og:locale" content="ar_SA"><meta property="og:site_name" content="${esc(data.settings.companyName)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(absolute(image,origin))}"><link rel="icon" href="${origin}/assets/logo.png"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap"><link rel="stylesheet" href="/assets/site-footer.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"><link rel="stylesheet" href="/assets/site-header.css"><script defer src="/assets/site-header.js"></script><style>${css}</style>${jsonld}</head><body><a class="skip" href="#main">انتقل إلى المحتوى</a>${renderHeader(data.settings,"blog")}<main id="main">${body}</main>${renderFooter(data.settings)}</body></html>`, {status,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"strict-origin-when-cross-origin","Content-Security-Policy":"default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src https://fonts.gstatic.com https://cdnjs.cloudflare.com; script-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"}});
}
function card(p,origin) { return `<article class="card"><a href="/blog/${esc(p.slug)}/" tabindex="-1" aria-hidden="true"><img src="${esc(absolute(p.image,origin))}" alt="${esc(p.imageAlt)}" width="600" height="400" loading="lazy"></a><div class="card-body"><span class="tag">${esc(p.category)}</span><h2><a href="/blog/${esc(p.slug)}/">${esc(p.title)}</a></h2><p class="muted">${esc(p.excerpt)}</p><div class="meta"><span>${esc(p.author)}</span><time datetime="${esc(p.publishedAt)}">${esc(p.publishedAt)}</time></div></div></article>`; }
export function inlineMarkdown(value) {
  let result="",offset=0;
  const pattern=/\[([^\]\n]+)\]\(([^\s)]+)\)/g;
  for(const match of value.matchAll(pattern)){
    result+=esc(value.slice(offset,match.index));
    const href=match[2];let safe=false;
    try{const url=new URL(href,"https://elevation-tech.sa");safe=(/^\/(?!\/)/.test(href)&&!/[\\\u0000-\u0020]/.test(href))||(/^https:\/\//.test(href)&&url.protocol==="https:"&&!url.username&&!url.password);}catch{}
    result+=safe?'<a href="'+esc(href)+'">'+esc(match[1])+'</a>':esc(match[0]);offset=match.index+match[0].length;
  }
  return result+esc(value.slice(offset));
}
export function markdown(body) {
  return body.replace(/\r\n/g,"\n").split(/\n\s*\n/).map(block=>{
    if(/^## /.test(block)) return block.split("\n").map(line=>line.startsWith("## ")?"<h2>"+inlineMarkdown(line.slice(3))+"</h2>":"<p>"+inlineMarkdown(line)+"</p>").join("");
    if(block.split("\n").every(l=>l.startsWith("- ")))return "<ul>"+block.split("\n").map(l=>"<li>"+inlineMarkdown(l.slice(2))+"</li>").join("")+"</ul>";
    return "<p>"+inlineMarkdown(block)+"</p>";
  }).join("\n");
}
export function renderBlog(data,url,origin) {
  const posts=published(data);
  if(url.pathname==="/blog") return Response.redirect(origin+"/blog/"+url.search,301);
  if(url.pathname!=="/blog/") {
    const slug=url.pathname.replace(/^\/blog\//,"").replace(/\/$/,"");
    const p=posts.find(p=>p.slug===slug);
    if(!p)return layout(data,{title:"المقال غير موجود | تقنية الارتفاع",description:"لم نعثر على هذا المقال",canonical:origin+url.pathname,body:'<div class="empty"><h1>المقال غير موجود</h1><p>قد يكون الرابط غير صحيح أو المقال غير منشور.</p><a class="button" href="/blog/">العودة إلى المدونة</a></div>',status:404,noindex:true},origin);
    if(!url.pathname.endsWith("/"))return Response.redirect(origin+"/blog/"+p.slug+"/"+url.search,301);
    const canonical=origin+"/blog/"+p.slug+"/";
    const articleSchema={"@context":"https://schema.org","@type":"BlogPosting",headline:p.title,description:p.excerpt,image:absolute(p.image,origin),datePublished:p.publishedAt,dateModified:p.updatedAt,author:{"@type":"Organization",name:p.author},publisher:{"@type":"Organization",name:data.settings.companyName,logo:{"@type":"ImageObject",url:origin+"/assets/logo.png"}},mainEntityOfPage:canonical,inLanguage:"ar",articleSection:p.category,wordCount:p.body.split(/\s+/).length,url:canonical};
    const schema={"@context":"https://schema.org","@graph":[articleSchema,{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"الرئيسية",item:origin+"/"},{"@type":"ListItem",position:2,name:"المدونة",item:origin+"/blog/"},{"@type":"ListItem",position:3,name:p.title,item:canonical}]}]};
    const related=posts.filter(x=>x.id!==p.id).slice(0,3);
    return layout(data,{title:p.title+" | "+data.settings.companyName,description:p.excerpt,canonical,image:p.image,schema,body:`<article class="article"><div class="breadcrumbs"><a href="/">الرئيسية</a> / <a href="/blog/">المدونة</a></div><span class="tag">${esc(p.category)}</span><h1>${esc(p.title)}</h1><p class="muted">${esc(p.excerpt)}</p><div class="meta"><span>${esc(p.author)}</span><time datetime="${esc(p.publishedAt)}">${esc(p.publishedAt)}</time><span>${Math.max(1,Math.ceil(p.body.split(/\s+/).length/180))} دقائق للقراءة</span></div><img class="article-cover" src="${esc(absolute(p.image,origin))}" alt="${esc(p.imageAlt)}" width="800" height="500"><div class="article-body">${markdown(p.body)}</div><aside class="cta"><h2>لديك مشروع أو استفسار؟</h2><p>تواصل مع فريق تقنية الارتفاع لمناقشة احتياجك.</p><a class="button" href="/pages/contact.html">اطلب استشارة</a></aside></article>${related.length?'<section class="related"><h2>مقالات أخرى</h2><div class="grid">'+related.map(x=>card(x,origin)).join("")+"</div></section>":""}`},origin);
  }
  const category=(url.searchParams.get("category")||"").slice(0,100), q=(url.searchParams.get("q")||"").slice(0,150);
  const filtered=posts.filter(p=>(!category||p.category===category)&&(!q||(p.title+" "+p.excerpt).includes(q)));
  const pages=Math.max(1,Math.ceil(filtered.length/9)), page=Math.min(pages,Math.max(1,parseInt(url.searchParams.get("page"),10)||1));
  const categories=[...new Set(posts.map(p=>p.category).filter(Boolean))];
  const pager=n=>{const s=new URLSearchParams();if(category)s.set("category",category);if(q)s.set("q",q);if(n>1)s.set("page",String(n));return "/blog/"+(s.size?"?"+s:"");};
  return layout(data,{title:"مدونة تقنية الارتفاع | المصاعد وخدمات المشاريع",description:"مقالات وأخبار تقنية الارتفاع للمصاعد والسلالم المتحركة، ومعلومات تساعدك على تجهيز مشروعك والتواصل مع فريقنا.",canonical:origin+"/blog/"+(page>1?"?page="+page:""),noindex:!!(q||category),body:`<div class="hero"><span class="eyebrow">المعرفة تبدأ بسؤال</span><h1>مدونة تقنية الارتفاع</h1><p class="muted">أخبارنا ومقالات تساعدك على التعرف على خدمات المصاعد والتخطيط لمشروعك.</p></div><form class="search" action="/blog/" method="get" role="search"><input type="search" name="q" value="${esc(q)}" placeholder="ابحث عن مقال" aria-label="البحث في المقالات"><select name="category" aria-label="التصنيف"><option value="">كل التصنيفات</option>${categories.map(c=>'<option value="'+esc(c)+'"'+(c===category?" selected":"")+'>'+esc(c)+'</option>').join("")}</select><button type="submit">بحث</button></form>${filtered.length?'<div class="grid">'+filtered.slice((page-1)*9,page*9).map(p=>card(p,origin)).join("")+"</div>":'<div class="empty">لا توجد مقالات مطابقة. <a href="/blog/">عرض جميع المقالات</a></div>'}<nav class="pagination" aria-label="صفحات المدونة">${page>1?'<a href="'+esc(pager(page-1))+'">السابق</a>':""}<span>صفحة ${page} من ${pages}</span>${page<pages?'<a href="'+esc(pager(page+1))+'">التالي</a>':""}</nav>`},origin);
}
export function renderSitemap(data,origin) {
  const posts=published(data);
  const projectImages=items=>items.flatMap(item=>Array.isArray(item.images)?item.images.map(image=>image.src):[item.image]);
  function imageTags(sources) {
    const urls=new Set();
    for(const source of sources) {
      if(!source)continue;
      try {const url=new URL(source,origin);if(url.protocol==="https:"&&!url.username&&!url.password)urls.add(url.href);} catch {}
    }
    return [...urls].slice(0,1000).map(url=>"<image:image><image:loc>"+esc(url)+"</image:loc></image:image>").join("");
  }
  const entry=(path,images=[],modified="")=>"<url><loc>"+esc(origin+path)+"</loc>"+(modified?"<lastmod>"+esc(modified)+"</lastmod>":"")+imageTags(images)+"</url>";
  const entries=[
    entry("/",[...data.heroSlides.map(item=>item.image),...data.services.slice(0,6).map(item=>item.image),...data.products.slice(0,6).map(item=>item.image),...projectImages(data.projects.slice(0,4)),...posts.slice(0,3).map(post=>post.image)]),
    entry("/pages/about.html"),
    entry("/pages/services.html",data.services.map(item=>item.image)),
    entry("/pages/products.html",data.products.map(item=>item.image)),
    entry("/pages/projects.html",projectImages(data.projects)),
    entry("/pages/contact.html"),
    entry("/blog/",posts.slice(0,9).map(post=>post.image))
  ];
  for(let page=2;page<=Math.ceil(posts.length/9);page++)entries.push(entry("/blog/?page="+page,posts.slice((page-1)*9,page*9).map(post=>post.image)));
  for(const post of posts)entries.push(entry("/blog/"+post.slug+"/",[post.image],post.updatedAt||post.publishedAt));
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+entries.join("")+"</urlset>",{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"no-store"}});
}
export function renderRSS(data,origin) {
  const items=published(data).slice(0,30).map(p=>"<item><title>"+esc(p.title)+"</title><link>"+esc(origin+"/blog/"+p.slug+"/")+"</link><guid>"+esc(origin+"/blog/"+p.slug+"/")+"</guid><description>"+esc(p.excerpt)+"</description><pubDate>"+new Date(p.publishedAt).toUTCString()+"</pubDate></item>");
  return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>مدونة تقنية الارتفاع</title><link>'+origin+'/blog/</link><description>أخبار ومقالات تقنية الارتفاع</description><language>ar</language>'+items.join("")+"</channel></rss>",{headers:{"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"no-store"}});
}
