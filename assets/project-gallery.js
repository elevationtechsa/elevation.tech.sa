(() => {
let dialog,photos=[],index=0,trigger,overflow="";
function initialize(){
 if(dialog)return;
 dialog=document.createElement("dialog");dialog.className="project-gallery-dialog";dialog.setAttribute("aria-labelledby","project-gallery-title");
 dialog.innerHTML='<div class="project-gallery-head"><h2 id="project-gallery-title"></h2><button type="button" data-gallery-close aria-label="إغلاق الصور">×</button></div><figure><img id="project-gallery-image" alt=""><figcaption id="project-gallery-caption"></figcaption></figure><p id="project-gallery-error" role="status"></p><div class="project-gallery-controls"><button type="button" data-gallery-prev aria-label="الصورة السابقة">→</button><span id="project-gallery-count" aria-live="polite"></span><button type="button" data-gallery-next aria-label="الصورة التالية">←</button></div><div id="project-gallery-thumbnails" class="project-gallery-thumbnails"></div>';document.body.append(dialog);
 dialog.querySelector("[data-gallery-close]").onclick=()=>dialog.close();
 dialog.querySelector("[data-gallery-prev]").onclick=()=>show(index-1);
 dialog.querySelector("[data-gallery-next]").onclick=()=>show(index+1);
 dialog.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();show(index+(e.key==="ArrowLeft"?1:-1));}});
 dialog.addEventListener("click",e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener("close",()=>{document.body.style.overflow=overflow;trigger?.focus({preventScroll:true});});
 dialog.querySelector("#project-gallery-image").addEventListener("error",()=>{dialog.querySelector("#project-gallery-error").textContent="تعذر تحميل هذه الصورة. يمكنك الانتقال إلى الصورة التالية.";});
}
function show(next){
 index=(next+photos.length)%photos.length;const photo=photos[index],image=dialog.querySelector("#project-gallery-image");
 dialog.querySelector("#project-gallery-error").textContent="";image.src=photo.src;image.alt=photo.alt||photo.caption||dialog.querySelector("h2").textContent;
 dialog.querySelector("#project-gallery-caption").textContent=photo.caption||"";
 dialog.querySelector("#project-gallery-count").textContent=(index+1)+" / "+photos.length;
 dialog.querySelectorAll("[data-gallery-prev],[data-gallery-next]").forEach(button=>button.hidden=photos.length<2);
 dialog.querySelectorAll("[data-gallery-thumbnail]").forEach(button=>button.setAttribute("aria-current",String(Number(button.dataset.galleryThumbnail)===index)));
}
document.addEventListener("click",event=>{
 const button=event.target.closest("[data-cms-project]");if(!button)return;
 const project=window.ELEVATION_CONTENT?.projects.find(p=>p.id===button.dataset.cmsProject);if(!project)return;
 photos=Array.isArray(project.images)?project.images:project.image?[{src:project.image,alt:project.title,caption:""}]:[];photos=photos.filter(p=>p?.src);if(!photos.length)return;
 event.preventDefault();initialize();trigger=button;dialog.querySelector("h2").textContent=project.title;
 const thumbs=dialog.querySelector("#project-gallery-thumbnails");thumbs.replaceChildren();
 photos.forEach((photo,i)=>{const thumb=document.createElement("button");thumb.type="button";thumb.dataset.galleryThumbnail=String(i);thumb.setAttribute("aria-label","عرض الصورة "+(i+1));const image=document.createElement("img");image.src=photo.src;image.alt="";image.loading="lazy";thumb.append(image);thumb.onclick=()=>show(i);thumbs.append(thumb);});
 show(0);overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow="hidden";
});
})();