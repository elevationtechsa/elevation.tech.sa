(() => {
"use strict";
const $=id=>document.getElementById(id);
const labels={dashboard:"نظرة عامة",posts:"المدونة",pages:"الصفحات",services:"الخدمات",products:"المنتجات",projects:"المشاريع",testimonials:"آراء العملاء",partners:"الشركاء",heroSlides:"صور الواجهة",media:"الوسائط",settings:"الإعدادات"};
const fields={title:"العنوان",name:"الاسم",description:"الوصف",icon:"رمز الخدمة",features:"المزايا — سطر لكل ميزة",image:"رابط الصورة",location:"الموقع",year:"السنة",elevators:"عدد المصاعد",type:"نوع المشروع",position:"الصفة / الجهة",content:"نص التقييم",rating:"التقييم",slug:"رابط المقال",excerpt:"الملخص",category:"التصنيف",author:"الكاتب",imageAlt:"وصف الصورة",body:"نص المقال",status:"حالة المقال",publishedAt:"تاريخ النشر",heading:"عنوان الصفحة",subtitle:"النص التعريفي",companyName:"اسم الشركة",companyPhone:"هاتف المبيعات",emergencyPhone:"هاتف الطوارئ",companyEmail:"البريد الإلكتروني",companyAddress:"العنوان",footerText:"نص تذييل الموقع"};
const schemas={services:["title","description","icon","features"],products:["name","description","image","features"],projects:["title","description","type","image","location","year","elevators"],testimonials:["name","position","content","rating","image"],partners:["name","image"],heroSlides:["title","description","image"],posts:["title","slug","excerpt","category","author","image","imageAlt","body","status","publishedAt"]};
const pageLabels={home:"الرئيسية",about:"من نحن",services:"الخدمات",products:"المنتجات",projects:"المشاريع",contact:"تواصل معنا"};
let state=null,revision=0,csrf="",active="dashboard",editing=null,saving=false;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function notify(message,error=false){$("notice").textContent=message;$("notice").className=error?"error":"";}
async function api(path,options={}) {
  if(options.method && !["GET","HEAD"].includes(options.method) && path!=="login") {const fresh=await fetch("/api/session",{credentials:"same-origin",cache:"no-store"}).then(r=>r.json());if(fresh.authenticated)csrf=fresh.csrf;}
  const response=await fetch("/api/"+path,{credentials:"same-origin",cache:"no-store",...options,headers:{...(options.body&&!(options.body instanceof File)?{"Content-Type":"application/json"}:{}),...(csrf?{"X-CSRF-Token":csrf}:{}),...options.headers}});
  let result;try{result=await response.json();}catch{throw new Error("تعذر الاتصال بخدمة المحتوى. أعد المحاولة.");}
  if(!response.ok){if(response.status===401&&!path.startsWith("login"))notify("انتهت الجلسة. سجّل الدخول مجدداً في تبويب آخر ثم أعد المحاولة.",true);throw Object.assign(new Error(result.error||"تعذر إكمال الطلب"),{status:response.status});}
  return result;
}
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
async function loadContent(){const result=await api("admin/content");state=result.data;revision=result.revision;$("revision").textContent="نسخة المحتوى: "+revision;}
async function openApp(){await loadContent();$("login-view").hidden=true;$("app").hidden=false;$("logout").hidden=false;render();let legacy={};for(const key of Object.keys(schemas)){try{const value=localStorage.getItem(key);if(value)legacy[key]=JSON.parse(value);}catch{}}if(Object.keys(legacy).length){$("legacy").hidden=false;$("legacy").onclick=()=>download(legacy,"legacy-browser-content.json");}notify("تم تحميل محتوى الموقع. التغييرات المحفوظة تظهر لجميع الزوار.");}
$("tabs").innerHTML=Object.entries(labels).map(([key,label])=>'<button type="button" data-tab="'+key+'">'+label+'</button>').join("");
$("tabs").addEventListener("click",e=>{const tab=e.target.closest("[data-tab]");if(tab){active=tab.dataset.tab;render();}});
function render(){
  $("section-title").textContent=labels[active];$("add-item").hidden=!schemas[active];document.querySelectorAll("[data-tab]").forEach(b=>{b.classList.toggle("active",b.dataset.tab===active);b.setAttribute("aria-current",b.dataset.tab===active?"page":"false");});
  const container=$("section-body");
  if(active==="dashboard"){container.innerHTML='<div class="stats">'+["posts","services","products","projects","partners"].map(key=>'<div class="stat"><span>'+labels[key]+'</span><strong>'+state[key].length+'</strong></div>').join("")+'</div><section class="panel"><h2>محتوى واحد للموقع ولوحة التحكم</h2><p>اختر قسماً لعرض البيانات وتعديلها. احفظ المقال كمسودة عند التحضير، واختر «منشور» ليظهر في المدونة.</p><p>المقالات المنشورة: '+state.posts.filter(p=>p.status==="published").length+' · المسودات: '+state.posts.filter(p=>p.status==="draft").length+'</p><a href="/blog/" target="_blank" rel="noopener">زيارة المدونة ↗</a></section>';return;}
  if(active==="pages"){container.innerHTML='<div class="item-list">'+Object.entries(pageLabels).map(([key,label])=>'<article class="item"><div class="item-content"><h3>'+label+'</h3><p class="muted">'+esc(state.pages[key].heading)+'</p></div><button data-page="'+key+'">تعديل الصفحة</button></article>').join("")+"</div>";return;}
  if(active==="settings"){container.innerHTML='<section class="panel"><h2>بيانات الشركة</h2><p>'+esc(state.settings.companyName)+' · '+esc(state.settings.companyEmail)+'</p><button data-settings>تعديل البيانات</button></section><section class="panel" style="margin-top:24px"><h2>تغيير كلمة المرور</h2><form id="password-form"><label for="current-pass">كلمة المرور الحالية</label><input id="current-pass" type="password" autocomplete="current-password" required maxlength="128"><label for="new-pass">كلمة المرور الجديدة — 12 حرفاً على الأقل</label><input id="new-pass" type="password" autocomplete="new-password" minlength="12" maxlength="128" required><button type="submit">تغيير كلمة المرور</button></form></section>';return;}
  if(active==="media"){container.innerHTML='<section class="panel"><h2>رفع صورة</h2><p>PNG أو JPEG أو WebP — حتى 512 كيلوبايت. انسخ رابط الصورة إلى حقل الصورة في المقال أو العنصر.</p><form id="upload-form"><label for="upload-file">ملف الصورة</label><input id="upload-file" type="file" accept="image/png,image/jpeg,image/webp" required><button type="submit">رفع الصورة</button></form><p id="upload-result" role="status"></p></section><div id="media-list" class="media-grid">جاري تحميل الصور…</div>';loadMedia();return;}
  const items=state[active];
  container.innerHTML=(active==="posts"?'<div class="toolbar"><input id="post-search" type="search" placeholder="البحث في المقالات" aria-label="البحث في المقالات"></div>':"")+'<div class="item-list">'+(items.length?items.map(item=>'<article class="item" data-search="'+esc((item.title||item.name||"").toLowerCase())+'">'+(item.image?'<img src="'+esc(item.image)+'" alt="" loading="lazy">':"")+'<div class="item-content"><h3>'+esc(item.title||item.name)+'</h3><p class="muted">'+esc((item.excerpt||item.description||item.position||"").slice(0,160))+'</p>'+(active==="posts"?'<span class="badge '+(item.status==="draft"?"draft":"")+'">'+(item.status==="draft"?"مسودة":"منشور")+'</span>':"")+'</div><div class="item-actions">'+(active==="posts"&&item.status==="published"?'<a class="quiet" href="/blog/'+esc(item.slug)+'/" target="_blank" rel="noopener">عرض ↗</a>':"")+'<button class="quiet" data-edit="'+esc(item.id)+'">تعديل</button><button class="danger" data-delete="'+esc(item.id)+'">حذف</button></div></article>').join(""):'<div class="empty">لا يوجد محتوى بعد. اضغط «إضافة جديد» للبدء.</div>')+"</div>";
}
function fieldHTML(key,value,isPost=false){
  const wide=["body","description","content","features","subtitle","excerpt","image"].includes(key);
  let input;if(key==="status")input='<select name="status" id="field-status"><option value="draft"'+(value==="draft"?" selected":"")+'>مسودة</option><option value="published"'+(value==="published"?" selected":"")+'>منشور</option></select>';
  else if(wide&&key!=="image")input='<textarea id="field-'+key+'" name="'+key+'"'+(key==="body"?' maxlength="60000"':' maxlength="6000"')+'>'+esc(Array.isArray(value)?value.join("\n"):value)+'</textarea>';
  else input='<input id="field-'+key+'" name="'+key+'" type="'+(key==="publishedAt"?"date":key==="rating"?"number":"text")+'" value="'+esc(value)+'"'+(["title","name","slug","companyName"].includes(key)?" required":"")+(key==="slug"?' pattern="[a-z0-9]+(-[a-z0-9]+)*" dir="ltr"'+(editing?.id?" readonly":""):"")+(key==="rating"?' min="1" max="5" step="1"':"")+(key==="image"?' dir="ltr"':"")+' maxlength="2000">';
  return '<div class="field '+(wide?"wide":"")+'"><label for="field-'+key+'">'+esc(fields[key]||key)+'</label>'+input+(key==="body"?'<p class="hint">للعنوان الفرعي ابدأ السطر بـ ## ثم مسافة. افصل الفقرات بسطر فارغ. HTML يعرض كنص.</p>':key==="slug"?'<p class="hint">مثال: elevator-project-guide. يثبت الرابط بعد أول حفظ.</p>':key==="image"?'<p class="hint">مسار مثل /assets/hero-img.jpeg أو رابط HTTPS. يمكن رفع الصور من قسم الوسائط.</p>':"")+"</div>";
}
function editItem(id=null,type=active){
  const item=id?state[type].find(x=>x.id===id):{id:crypto.randomUUID(),features:[],rating:5,status:"draft",author:state.settings.companyName,publishedAt:new Date().toISOString().slice(0,10)};
  editing={type,id:id||null,item:structuredClone(item),fields:schemas[type]};
  $("editor-title").textContent=(id?"تعديل ":"إضافة ")+labels[type];$("editor-fields").innerHTML=schemas[type].map(key=>fieldHTML(key,item[key]??"")).join("");$("editor-error").textContent="";$("editor").showModal();$("editor").querySelector("input,textarea,select")?.focus();
}
function editPage(key){editing={type:"pages",key,fields:["heading","subtitle","title","description"]};$("editor-title").textContent="تعديل "+pageLabels[key];$("editor-fields").innerHTML=editing.fields.map(f=>fieldHTML(f,state.pages[key][f])).join("");$("editor-error").textContent="";$("editor").showModal();}
function editSettings(){editing={type:"settings",fields:Object.keys(state.settings)};$("editor-title").textContent="بيانات الشركة";$("editor-fields").innerHTML=editing.fields.map(f=>fieldHTML(f,state.settings[f])).join("");$("editor-error").textContent="";$("editor").showModal();}
async function persist(next){const result=await api("admin/content",{method:"PUT",body:JSON.stringify({revision,data:next})});state=result.data;revision=result.revision;$("revision").textContent="نسخة المحتوى: "+revision;}
$("editor-form").addEventListener("submit",async e=>{
  e.preventDefault();if(saving)return;saving=true;$("save-item").disabled=true;$("editor-error").textContent="";
  try{
    const values=Object.fromEntries(new FormData(e.target));const next=structuredClone(state);
    for(const key of editing.fields){if(key==="features")values[key]=values[key].split("\n").map(s=>s.trim()).filter(Boolean);if(key==="rating")values[key]=Number(values[key]);}
    if(editing.type==="pages"){next.pages[editing.key]={...next.pages[editing.key],...values};if(editing.key==="home"&&next.heroSlides[0]){next.heroSlides[0].title=values.heading;next.heroSlides[0].description=values.subtitle;}}
    else if(editing.type==="settings")next.settings={...next.settings,...values};
    else{const item={...editing.item,...values};const list=next[editing.type],index=list.findIndex(x=>x.id===item.id);if(index<0)list.push(item);else list[index]=item;}
    if(editing.type==="heroSlides"&&next.heroSlides[0]){next.pages.home.heading=next.heroSlides[0].title;next.pages.home.subtitle=next.heroSlides[0].description;}
    await persist(next);$("editor").close();render();notify(editing.type==="posts"&&values.status==="draft"?"تم حفظ المقال كمسودة":"تم حفظ التغييرات بنجاح");
  }catch(error){$("editor-error").textContent=error.message;}finally{saving=false;$("save-item").disabled=false;}
});
function closeEditor(){if(!saving)$("editor").close();}
$("close-editor").onclick=closeEditor;$("cancel-editor").onclick=closeEditor;$("editor").addEventListener("cancel",e=>{if(saving)e.preventDefault();});
$("add-item").onclick=()=>editItem();
$("section-body").addEventListener("click",async e=>{
  const edit=e.target.closest("[data-edit]"),remove=e.target.closest("[data-delete]"),page=e.target.closest("[data-page]");
  if(edit)return editItem(edit.dataset.edit);if(page)return editPage(page.dataset.page);if(e.target.closest("[data-settings]"))return editSettings();
  if(remove&&confirm("حذف هذا العنصر من الموقع؟")){remove.disabled=true;try{const next=structuredClone(state);next[active]=next[active].filter(x=>x.id!==remove.dataset.delete);await persist(next);render();notify("تم حذف العنصر");}catch(error){notify(error.message,true);remove.disabled=false;}}
});
$("section-body").addEventListener("input",e=>{if(e.target.id==="post-search"){const query=e.target.value.toLowerCase();document.querySelectorAll("[data-search]").forEach(row=>row.hidden=!row.dataset.search.includes(query));}});
$("section-body").addEventListener("submit",async e=>{
  if(!["password-form","upload-form"].includes(e.target.id))return;e.preventDefault();const button=e.target.querySelector("button[type=submit]");button.disabled=true;
  try{if(e.target.id==="password-form"){await api("password",{method:"POST",body:JSON.stringify({currentPassword:$("current-pass").value,newPassword:$("new-pass").value})});location.reload();}else{const file=$("upload-file").files[0];if(!file||file.size>524288)throw new Error("اختر صورة حتى 512 كيلوبايت");const result=await api("media",{method:"POST",body:file,headers:{"Content-Type":file.type}});if($("upload-result"))$("upload-result").textContent="تم الرفع: "+result.url;e.target.reset();await loadMedia();}}catch(error){notify(error.message,true);}finally{button.disabled=false;}
});
async function loadMedia(){try{const result=await api("media");if(active!=="media")return;$("media-list").innerHTML=result.items.length?result.items.map(x=>'<article class="media-card"><img src="'+esc(x.url)+'" alt="صورة مرفوعة" loading="lazy"><label class="hint">رابط الصورة<input readonly value="'+esc(x.url)+'" aria-label="رابط الصورة"></label></article>').join(""):"لا توجد صور مرفوعة بعد.";}catch(error){if($("media-list"))$("media-list").textContent=error.message;}}
$("login-form").addEventListener("submit",async e=>{e.preventDefault();const button=e.target.querySelector("button");button.disabled=true;try{const result=await api("login",{method:"POST",body:JSON.stringify({password:$("password").value})});csrf=result.csrf;$("password").value="";await openApp();}catch(error){notify(error.message,true);}finally{button.disabled=false;}});
$("logout").onclick=async()=>{try{await api("logout",{method:"POST"});location.reload();}catch(error){notify(error.message,true);}};
$("refresh").onclick=async()=>{try{const s=await api("session");if(!s.authenticated)throw new Error("يرجى تسجيل الدخول من جديد");csrf=s.csrf;await loadContent();render();notify("تم تحديث المحتوى");}catch(error){notify(error.message,true);}};
$("export").onclick=()=>download(state,"elevation-content-"+new Date().toISOString().slice(0,10)+".json");
(async()=>{try{const result=await api("session");if(result.authenticated){csrf=result.csrf;await openApp();}}catch(error){notify(error.message,true);}})();
})();
