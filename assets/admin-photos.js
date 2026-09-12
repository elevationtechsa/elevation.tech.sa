(() => {
"use strict";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let images=[],busy=false,controller=null,generation=0,options;
const el=id=>document.getElementById(id);
function safeURL(value){try{const u=new URL(value,location.origin);return (/^\/(?!\/)/.test(value)&&!/[\\\u0000-\u0020]/.test(value))||(/^https:\/\//.test(value)&&u.protocol==="https:"&&!u.username&&!u.password);}catch{return false;}}
function normalize(item){return Array.isArray(item.images)?item.images.map(x=>typeof x==="string"?{src:x,alt:"",caption:""}:{src:x.src||x.url||"",alt:x.alt||"",caption:x.caption||""}):item.image?[{src:item.image,alt:item.title||"",caption:""}]:[];}
function setBusy(value){busy=value;options.setBusy(value);document.querySelectorAll("[data-photo-upload],[data-photo-action],[data-photo-url-add]").forEach(x=>x.disabled=value);if(el("photo-cancel-upload"))el("photo-cancel-upload").hidden=!value;}
function cancel(){generation++;controller?.abort();setBusy(false);}
function single(value){return '<div class="field wide"><label for="field-image">صورة العرض</label><input id="field-image" name="image" type="text" dir="ltr" maxlength="2000" value="'+esc(value)+'"><label class="photo-upload-label">رفع صورة من الجهاز<input type="file" data-photo-upload="single" accept="image/jpeg,image/png,image/webp"></label><img id="photo-preview" class="photo-preview" alt="معاينة الصورة" hidden><p class="hint">اختر صورة JPG أو PNG أو WebP حتى 15 ميغابايت. تُجهز الصورة تلقائياً للعرض على الموقع، ثم احفظ التغييرات.</p><p id="photo-progress" role="status"></p><button type="button" id="photo-cancel-upload" class="quiet" hidden>إيقاف الرفع</button></div>';}
function gallery(){return '<div class="field wide"><h3>صور المشروع</h3><p class="hint">يمكن اختيار عدة صور معاً، حتى 20 صورة. JPG أو PNG أو WebP حتى 15 ميغابايت للصورة. الصورة الأولى هي الغلاف. احفظ التغييرات لنشر الصور.</p><label class="photo-upload-label">رفع صور من الجهاز<input type="file" data-photo-upload="gallery" multiple accept="image/jpeg,image/png,image/webp"></label><div class="photo-url-row"><input id="project-photo-url" type="text" dir="ltr" maxlength="2000" placeholder="/assets/photo.jpg" aria-label="رابط صورة موجودة"><button type="button" class="quiet" data-photo-url-add>إضافة رابط صورة</button></div><p id="photo-progress" role="status"></p><button type="button" id="photo-cancel-upload" class="quiet" hidden>إيقاف الرفع</button><div id="project-photo-list" class="project-photo-list"></div></div>';}
function render(){
 const preview=el("photo-preview");if(preview){const src=el("field-image").value.trim();preview.hidden=!safeURL(src);if(!preview.hidden)preview.src=src;else preview.removeAttribute("src");}
 const list=el("project-photo-list");if(!list)return;
 list.innerHTML=images.length?images.map((image,i)=>'<article class="project-photo-item"><img src="'+esc(image.src)+'" alt="" loading="lazy"><div class="project-photo-fields"><strong>'+(i===0?"صورة الغلاف":("صورة "+(i+1)))+'</strong><label>وصف الصورة<input data-photo-alt="'+i+'" value="'+esc(image.alt)+'" maxlength="1000"></label><label>تعليق الصورة<input data-photo-caption="'+i+'" value="'+esc(image.caption)+'" maxlength="1000"></label><div class="photo-actions"><button type="button" class="quiet" data-photo-action="cover" data-index="'+i+'"'+(i===0?' disabled':"")+'>اجعلها الغلاف</button><button type="button" class="quiet" data-photo-action="up" data-index="'+i+'"'+(i===0?' disabled':"")+' aria-label="تقديم الصورة">↑</button><button type="button" class="quiet" data-photo-action="down" data-index="'+i+'"'+(i===images.length-1?' disabled':"")+' aria-label="تأخير الصورة">↓</button><button type="button" class="danger" data-photo-action="remove" data-index="'+i+'">إزالة</button></div></div></article>').join(""):'<p class="muted">لم تتم إضافة صور بعد.</p>';
}
async function prepare(file){
 if(file.size>15*1024*1024)throw Error("حجم الصورة يتجاوز 15 ميغابايت");
 if(!/^(image\/(jpeg|png|webp))$/.test(file.type)&&!(/\.(jpe?g|png|webp)$/i.test(file.name)&&!file.type))throw Error("الصيغ المسموحة: JPG وPNG وWebP");
 const url=URL.createObjectURL(file),img=new Image();
 try{
  img.src=url;await img.decode();
  if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>40000000)throw Error("أبعاد الصورة كبيرة جداً");
  if(file.size<=524288&&Math.max(img.naturalWidth,img.naturalHeight)<=1800)return file;
  const canvas=document.createElement("canvas");let size=1800;
  for(let pass=0;pass<5;pass++){
   const scale=Math.min(1,size/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
   canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
   for(const quality of [.86,.72,.56]){const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/webp",quality));if(blob&&blob.size<=524288)return blob;}
   size=Math.round(size*.75);
  }
  throw Error("تعذر تجهيز الصورة؛ جرّب صورة أصغر");
 }finally{URL.revokeObjectURL(url);}
}
async function upload(files,kind){
 if(busy||!files.length)return;
 if(kind==="gallery"&&images.length+files.length>20){options.error("يمكن إضافة 20 صورة كحد أقصى للمشروع");return;}
 const run=++generation;controller=new AbortController();setBusy(true);options.error("");let completed=0;const errors=[];
 for(let index=0;index<files.length;index++){
  if(run!==generation)break;
  const file=files[index];el("photo-progress").textContent="جاري تجهيز ورفع الصورة "+(index+1)+" من "+files.length;
  try{
   const body=await prepare(file);if(run!==generation)break;
   const result=await options.api("media",{method:"POST",body,signal:controller.signal,headers:{"Content-Type":body.type||"application/octet-stream"}});
   if(run!==generation)break;
   if(kind==="gallery")images.push({src:result.url,alt:"",caption:""});else el("field-image").value=result.url;
   completed++;render();setBusy(true);
  }catch(error){if(error.name==="AbortError"||run!==generation)break;errors.push(file.name+": "+error.message);}
 }
 if(run===generation){setBusy(false);render();if(el("photo-progress"))el("photo-progress").textContent="تم رفع "+completed+" من "+files.length+" صورة. احفظ التغييرات لإظهارها.";if(errors.length)options.error(errors.join(" · "));}
}
window.AdminPhotos={
 init(config){options=config;
  el("editor-fields").addEventListener("change",e=>{if(e.target.matches("[data-photo-upload]")){const files=[...e.target.files];const kind=e.target.dataset.photoUpload;e.target.value="";void upload(files,kind).catch(error=>{setBusy(false);options.error(error.message);});}});
  el("editor-fields").addEventListener("input",e=>{if(e.target.id==="field-image"){const preview=el("photo-preview"),src=e.target.value.trim();preview.hidden=!safeURL(src);if(!preview.hidden)preview.src=src;}if(e.target.hasAttribute("data-photo-alt"))images[Number(e.target.dataset.photoAlt)].alt=e.target.value;if(e.target.hasAttribute("data-photo-caption"))images[Number(e.target.dataset.photoCaption)].caption=e.target.value;});
  el("editor-fields").addEventListener("click",e=>{
   if(e.target.closest("#photo-cancel-upload")){cancel();render();el("photo-progress").textContent="توقف الرفع. الصور المكتملة جاهزة للحفظ.";return;}
   if(busy)return;
   if(e.target.closest("[data-photo-url-add]")){const input=el("project-photo-url"),src=input.value.trim();if(!safeURL(src))return options.error("استخدم مساراً من الموقع أو رابط HTTPS");if(images.length>=20)return options.error("الحد الأقصى 20 صورة");if(images.some(x=>x.src===src))return options.error("الصورة موجودة بالفعل");images.push({src,alt:"",caption:""});input.value="";options.error("");render();return;}
   const button=e.target.closest("[data-photo-action]");if(!button)return;
   const i=Number(button.dataset.index),action=button.dataset.photoAction;if(!images[i])return;
   if(action==="remove")images.splice(i,1);else if(action==="cover")images.unshift(...images.splice(i,1));else if(action==="up"&&i>0)[images[i-1],images[i]]=[images[i],images[i-1]];else if(action==="down"&&i<images.length-1)[images[i+1],images[i]]=[images[i],images[i+1]];render();
  });
 },
 open(item={}){cancel();images=normalize(item);},
 single,gallery,render,cancel,isUploading:()=>busy,getImages:()=>images.map(x=>({...x}))
};
})();