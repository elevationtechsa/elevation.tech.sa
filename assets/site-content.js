/* Shared published content. Browser storage is never used as the public source. */
(async function () {
  if (document.readyState === "loading") await new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve, {once:true}));
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  try {
    const response = await fetch("/api/content", {cache:"no-store"});
    if (!response.ok) throw new Error("Content unavailable");
    const {data} = await response.json();
    window.ELEVATION_CONTENT = data;
    const isHome = location.pathname === "/" || location.pathname === "/index.html";
    const pageKey = isHome ? "home" : location.pathname.split("/").pop().replace(/\.html$/, "");
    const page = data.pages[pageKey];
    if (page) {
      document.title = page.title;
      for (const [selector,value] of [['meta[name="description"]',page.description],['meta[property="og:title"]',page.title],['meta[property="og:description"]',page.description],['meta[name="twitter:title"]',page.title],['meta[name="twitter:description"]',page.description]]) {
        const node=document.querySelector(selector);if(node)node.content=value;
      }
      const heading=document.querySelector(isHome?"#home .hero-copy h1, #home .hero-copy h2":"section h1");
      if(heading){heading.textContent=page.heading;const subtitle=heading.nextElementSibling;if(subtitle?.tagName==="P")subtitle.textContent=page.subtitle;}
    }
    for(const name of isHome?["renderSavedServices","renderSavedProducts","renderSavedProjects","renderSavedPartners","renderSavedTestimonials"]:["renderAllSavedServices","renderAllSavedProducts","renderAllSavedProjects"]) {
      if(typeof window[name]==="function")window[name]();
    }
    if(isHome){
      document.querySelectorAll("#products .gallery-btn").forEach(button=>button.addEventListener("click",()=>window.openGallery(button.dataset.product,document.getElementById("galleryModal"),document.getElementById("galleryTitle"),document.getElementById("galleryGrid"))));
      document.querySelectorAll("#projects .project-details-btn").forEach(button=>button.addEventListener("click",()=>window.openProjectDetails(button.dataset.project)));
      // A selectable hero avoids automatic motion and remains keyboard accessible.
      const slides=data.heroSlides, host=document.querySelector("#home .hero-copy");
      function showSlide(slide){const title=host?.querySelector("h1,h2"),description=host?.querySelector("h1 + p,h2 + p"),image=document.querySelector("#home .hero-image-wrap img");if(title)title.textContent=slide.title;if(description)description.textContent=slide.description;if(image){image.src=slide.image||"/assets/hero-img.jpeg";image.alt=slide.title;}}
      if(slides.length){showSlide(slides[0]);if(slides.length>1 && host){const controls=document.createElement("div");controls.className="cms-hero-controls";slides.forEach((slide,index)=>{const button=document.createElement("button");button.type="button";button.textContent=String(index+1);button.setAttribute("aria-label",slide.title);button.addEventListener("click",()=>showSlide(slide));controls.append(button);});host.append(controls);}}
      window.dispatchEvent(new Event("resize"));
    }
    const settings=data.settings;
    document.querySelectorAll("a[href^='tel:']").forEach(link=>{const old=link.getAttribute("href");const phone=old.includes("544925287")?settings.emergencyPhone:settings.companyPhone;link.href="tel:"+phone;const text=Array.from(link.childNodes).find(node=>node.nodeType===3&&/[0-9]{3}/.test(node.textContent));if(text)text.textContent=" "+phone+" ";});
    document.querySelectorAll("a[href^='mailto:']").forEach(link=>{link.href="mailto:"+settings.companyEmail;for(const node of link.childNodes)if(node.nodeType===3&&node.textContent.includes("@"))node.textContent=settings.companyEmail;});
    document.querySelectorAll("a[href*='wa.me/']").forEach(link=>{const url=new URL(link.href);url.pathname="/"+settings.companyPhone.replace("+","");link.href=url.href;});
    document.querySelectorAll("[data-company-name]").forEach(node=>node.textContent=settings.companyName);
    document.querySelectorAll("[data-company-address]").forEach(node=>node.textContent=settings.companyAddress);
    document.querySelectorAll("[data-footer-text]").forEach(node=>node.textContent=settings.footerText);
    const posts=document.querySelector("#cms-recent-posts");
    if(posts){const published=data.posts.filter(p=>p.status==="published").sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).slice(0,3);posts.innerHTML=published.length?published.map(p=>`<article class="cms-post-card"><a href="/blog/${esc(p.slug)}/">${p.image?`<img loading="lazy" width="640" height="360" src="${esc(p.image)}" alt="${esc(p.imageAlt||p.title)}">`:""}<div><small>${esc(p.category)} · ${esc(p.publishedAt)}</small><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span>اقرأ المقال ←</span></div></a></article>`).join(""):"<p>تابعنا للمقالات القادمة.</p>";}
    document.querySelectorAll("#services img,#products img,#projects img,#partners img,#testimonialsTrack img").forEach(img=>img.loading="lazy");
  } catch (error) {
    console.warn("Published content could not be loaded; showing the original page.",error.message);
  }
})();
