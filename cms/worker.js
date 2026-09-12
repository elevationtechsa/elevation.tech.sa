const encoder = new TextEncoder();
const MAX_BODY = 900000;
const SESSION_SECONDS = 28800;
const collections = ["services", "products", "projects", "partners", "testimonials", "heroSlides", "posts"];
export const htmlEscape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const hex = bytes => Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
const unhex = text => Uint8Array.from(text.match(/../g) || [], x => parseInt(x, 16));
async function digest(text) { return hex(await crypto.subtle.digest("SHA-256", encoder.encode(text))); }
function randomToken() { return hex(crypto.getRandomValues(new Uint8Array(32))); }
function fail(status, message) { throw Object.assign(new Error(message), {status}); }
export function safeURL(value) {
  if (!value) return "";
  if (typeof value !== "string" || value.length > 2000) fail(400, "رابط غير صالح");
  if (/^\/(?!\/)/.test(value) && !/[\\\u0000-\u0020]/.test(value)) return value;
  try { const u = new URL(value); if (u.protocol === "https:" && !u.username && !u.password) return u.href; } catch {}
  fail(400, "استخدم رابط HTTPS أو مسار صورة من الموقع");
}
function text(value, max = 3000) {
  if (typeof value !== "string" || value.length > max) fail(400, "أحد الحقول النصية غير صالح أو طويل جداً");
  return value.trim();
}
export function validateState(data, previous) {
  if (!data || typeof data !== "object" || Array.isArray(data)) fail(400, "بيانات غير صالحة");
  const clean = {settings: {}, pages: {}};
  const keys = ["companyName","companyPhone","emergencyPhone","companyEmail","companyAddress","footerText"];
  for (const key of keys) clean.settings[key] = text(data.settings?.[key] ?? "", 500);
  if (!clean.settings.companyName) fail(400, "اسم الشركة مطلوب");
  for (const key of ["companyPhone","emergencyPhone"]) if (!/^\+[1-9][0-9]{6,14}$/.test(clean.settings[key])) fail(400, "استخدم الرقم الدولي مثل +966531154551");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.settings.companyEmail)) fail(400, "البريد الإلكتروني غير صالح");
  for (const key of ["home","about","services","products","projects","contact"]) {
    clean.pages[key] = {};
    for (const field of ["heading","subtitle","title","description"]) clean.pages[key][field] = text(data.pages?.[key]?.[field] ?? "", field === "subtitle" ? 3000 : 600);
  }
  const fields = {
    services:["title","description","icon","image","imageAlt"], products:["name","description","image"], projects:["title","description","type","image","location","year","elevators"],
    partners:["name","image"], testimonials:["name","position","content","image"], heroSlides:["title","description","image"],
    posts:["title","slug","excerpt","category","author","image","imageAlt","body","status","publishedAt","updatedAt"]
  };
  for (const key of collections) {
    if (!Array.isArray(data[key]) || data[key].length > 200) fail(400, "قائمة محتوى غير صالحة");
    const ids = new Set();
    clean[key] = data[key].map(item => {
      if (!item || typeof item !== "object") fail(400, "عنصر غير صالح");
      const id = text(item.id, 100);
      if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) fail(400, "معرف عنصر مكرر أو غير صالح");
      ids.add(id);
      const out = {id};
      for (const field of fields[key]) {
        out[field] = field === "image" ? safeURL(item[field] || "") : text(item[field] ?? "", field === "body" ? 60000 : field === "description" || field === "content" ? 6000 : 1000);
      }
      if (!out.title && !out.name) fail(400, "العنوان أو الاسم مطلوب");
      if (["services","products"].includes(key)) {
        if (!Array.isArray(item.features) || item.features.length > 30) fail(400, "قائمة المزايا غير صالحة");
        out.features = item.features.map(v => text(v, 400)).filter(Boolean);
      }
      if (key === "projects") {
        const raw=item.images===undefined?(out.image?[{src:out.image,alt:out.title,caption:""}]:[]):item.images;
        if(!Array.isArray(raw)||raw.length>20)fail(400,"يمكن إضافة 20 صورة كحد أقصى للمشروع");
        out.images=raw.map(image=>{
          if(!image||typeof image!=="object"||Array.isArray(image))fail(400,"بيانات الصورة غير صالحة");
          const src=safeURL(image.src);if(!src)fail(400,"رابط الصورة مطلوب");
          return {src,alt:text(image.alt??"",1000),caption:text(image.caption??"",1000)};
        });
        if(new Set(out.images.map(image=>image.src)).size!==out.images.length)fail(400,"لا تكرر الصورة في معرض المشروع");
        out.image=out.images[0]?.src||"";
      }
      if (key === "testimonials") { out.rating = Number(item.rating); if (!Number.isInteger(out.rating) || out.rating < 1 || out.rating > 5) fail(400, "التقييم من 1 إلى 5"); }
      if (key === "posts") {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(out.slug) || ["rss.xml","category"].includes(out.slug)) fail(400, "رابط المقال يجب أن يحتوي أحرفاً إنجليزية صغيرة وأرقاماً وشرطات");
        if (!["draft","published"].includes(out.status)) fail(400, "حالة المقال غير صالحة");
        const old = previous?.posts?.find(p => p.id === id);
        if (old && old.slug !== out.slug) fail(400, "رابط المقال المحفوظ ثابت للحفاظ على الروابط");
        if (out.status === "published" && (!out.body.trim() || !out.excerpt || !out.author || !/^\d{4}-\d{2}-\d{2}$/.test(out.publishedAt) || !Number.isFinite(Date.parse(out.publishedAt)) || out.publishedAt > new Date().toISOString().slice(0,10))) fail(400, "المقال المنشور يحتاج نصاً وملخصاً وكاتباً وتاريخ نشر صالحاً");
        out.updatedAt = old && Object.keys(out).every(key => key === "updatedAt" || old[key] === out[key]) ? old.updatedAt : new Date().toISOString().slice(0,10);
      }
      return out;
    });
  }
  if (new Set(clean.posts.map(p => p.slug)).size !== clean.posts.length) fail(400, "رابط المقال مستخدم بالفعل");
  return clean;
}
async function readBody(request, limit = MAX_BODY) {
  if (Number(request.headers.get("content-length")) > limit) fail(413, "حجم الطلب كبير");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = []; let total = 0;
  for (;;) { const {done, value} = await reader.read(); if (done) break; total += value.length; if (total > limit) { await reader.cancel(); fail(413, "حجم الطلب كبير"); } chunks.push(value); }
  const bytes = new Uint8Array(total); let offset = 0; for (const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.length;} return bytes;
}
async function jsonBody(request, limit) {
  if (!request.headers.get("content-type")?.includes("application/json")) fail(415, "يجب إرسال JSON");
  try { return JSON.parse(new TextDecoder().decode(await readBody(request, limit))); } catch (error) { if (error.status) throw error; fail(400, "صيغة JSON غير صالحة"); }
}
function cookie(token, maxAge=SESSION_SECONDS) { return "elevation_session=" + token + "; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=" + maxAge; }
function json(value, status=200, headers={}) { return new Response(JSON.stringify(value), {status, headers: {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...headers}}); }
async function getState(env) { const row = await env.DB.prepare("SELECT data, revision FROM site_state WHERE id=1").first(); if (!row) fail(503, "المحتوى غير مهيأ"); return {data: JSON.parse(row.data), revision:row.revision}; }
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2", hash:"SHA-256", salt:unhex(salt),iterations:100000},key,256));
}
async function passwordMatches(env, password) {
  const row = await env.DB.prepare("SELECT salt, hash FROM admin_auth WHERE id=1").first();
  if (!row || typeof password !== "string" || password.length > 128) return false;
  const actual = await passwordHash(password, row.salt);
  return crypto.subtle.timingSafeEqual(actual, unhex(row.hash));
}
async function session(request, env) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)elevation_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) return null;
  return env.DB.prepare("SELECT hash, csrf FROM admin_sessions WHERE hash=? AND expires_at > ?").bind(await digest(token), Date.now()).first();
}
function originAllowed(request, env) {
  const origin = request.headers.get("origin");
  return [env.SITE_ORIGIN, "https://elevationtechsa-elevationtechsa.vercel.app"].includes(origin);
}
async function auth(request, env) {
  const s = await session(request, env);
  if (!s) fail(401, "يرجى تسجيل الدخول");
  if (!["GET","HEAD"].includes(request.method)) {
    if (!originAllowed(request,env)) fail(403, "مصدر الطلب غير مسموح");
    if (request.headers.get("x-csrf-token") !== s.csrf) fail(403, "أعد تحميل لوحة التحكم قبل الحفظ");
  }
  return s;
}
async function login(request, env) {
  if (!originAllowed(request,env)) fail(403, "مصدر الطلب غير مسموح");
  const key = await digest(request.headers.get("cf-connecting-ip") || "shared");
  const now=Date.now(), window=Math.floor(now/600000);
  const result=await env.DB.prepare("INSERT INTO login_limits (id, window, attempts) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN window=excluded.window THEN attempts+1 ELSE 1 END, window=excluded.window RETURNING attempts").bind(key,window).first();
  if (result.attempts > 10) return json({error:"محاولات كثيرة، أعد المحاولة بعد عشر دقائق"},429,{"Retry-After":"600"});
  const body=await jsonBody(request,4096);
  if (!await passwordMatches(env,body.password)) fail(401,"كلمة المرور غير صحيحة");
  const token=randomToken(), csrf=randomToken();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").bind(now),
    env.DB.prepare("DELETE FROM login_limits WHERE window < ?").bind(window-144),
    env.DB.prepare("INSERT INTO admin_sessions (hash, csrf, expires_at) VALUES (?, ?, ?)").bind(await digest(token),csrf,now+SESSION_SECONDS*1000)
  ]);
  return json({authenticated:true,csrf},200,{"Set-Cookie":cookie(token)});
}
async function mediaUpload(request, env) {
  await auth(request,env);
  const bytes=await readBody(request,524288);
  let mime="";
  if (bytes[0]===137 && bytes[1]===80 && bytes[2]===78 && bytes[3]===71 && bytes[4]===13 && bytes[5]===10) mime="image/png";
  else if(bytes[0]===255 && bytes[1]===216 && bytes[2]===255) mime="image/jpeg";
  else if(new TextDecoder().decode(bytes.slice(0,4))==="RIFF" && new TextDecoder().decode(bytes.slice(8,12))==="WEBP") mime="image/webp";
  if (!mime) fail(415,"الصيغ المسموحة: PNG وJPEG وWebP");
  const id=crypto.randomUUID();
  let binary="";for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  await env.DB.prepare("INSERT INTO media (id,mime,data,created_at) VALUES (?,?,?,?)").bind(id,mime,btoa(binary),new Date().toISOString()).run();
  return json({url:"/api/media/"+id},201);
}
import {renderBlog, renderSitemap, renderRSS} from "./blog.js";
export default {
  async fetch(request, env) {
    try {
      const url=new URL(request.url), path=url.pathname;
      if (request.method==="GET" && path==="/api/health") {await env.DB.prepare("SELECT 1").first();return json({ok:true});}
      if (request.method==="POST" && path==="/api/login") return await login(request,env);
      if (request.method==="GET" && path==="/api/session") { const s=await session(request,env);return json(s?{authenticated:true,csrf:s.csrf}:{authenticated:false}); }
      if (request.method==="POST" && path==="/api/logout") {const s=await auth(request,env);await env.DB.prepare("DELETE FROM admin_sessions WHERE hash=?").bind(s.hash).run();return json({ok:true},200,{"Set-Cookie":cookie("",0)});}
      if (request.method==="POST" && path==="/api/password") {
        await auth(request,env);const body=await jsonBody(request,4096);
        if (!await passwordMatches(env,body.currentPassword)) fail(401,"كلمة المرور الحالية غير صحيحة");
        if(typeof body.newPassword!=="string" || body.newPassword.length<12 || body.newPassword.length>128) fail(400,"استخدم كلمة مرور من 12 إلى 128 حرفاً");
        const salt=randomToken();const hash=hex(await passwordHash(body.newPassword,salt));
        await env.DB.batch([env.DB.prepare("UPDATE admin_auth SET salt=?, hash=? WHERE id=1").bind(salt,hash),env.DB.prepare("DELETE FROM admin_sessions")]);
        return json({ok:true},200,{"Set-Cookie":cookie("",0)});
      }
      if (request.method==="POST" && path==="/api/media") return await mediaUpload(request,env);
      if (request.method==="GET" && path==="/api/media") {await auth(request,env);const rows=await env.DB.prepare("SELECT id,mime,created_at FROM media ORDER BY created_at DESC LIMIT 100").all();return json({items:rows.results.map(row=>({...row,url:"/api/media/"+row.id}))});}
      if (request.method==="GET" && /^\/api\/media\/[a-f0-9-]{36}$/.test(path)) {
        const row=await env.DB.prepare("SELECT mime,data FROM media WHERE id=?").bind(path.split("/").pop()).first();
        if(!row)fail(404,"الصورة غير موجودة");
        return new Response(Uint8Array.from(atob(row.data),c=>c.charCodeAt(0)),{headers:{"Content-Type":row.mime,"Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
      }
      if (path==="/api/admin/content") {
        await auth(request,env);
        if(request.method==="GET") return json(await getState(env));
        if(request.method==="PUT") {
          const body=await jsonBody(request);const current=await getState(env);
          if(!Number.isInteger(body.revision)||body.revision!==current.revision) fail(409,"تم تعديل المحتوى من جلسة أخرى. احتفظ بنسخة ثم أعد التحميل");
          const data=validateState(body.data,current.data);
          const saved=await env.DB.prepare("UPDATE site_state SET data=?, revision=revision+1, updated_at=? WHERE id=1 AND revision=? RETURNING revision").bind(JSON.stringify(data),new Date().toISOString(),body.revision).first();
          if(!saved)fail(409,"تعارض في الحفظ. أعد تحميل المحتوى");
          return json({data,revision:saved.revision});
        }
        fail(405,"طريقة غير مسموحة");
      }
      if(request.method==="GET" && path==="/api/content") {const state=await getState(env);state.data.posts=state.data.posts.filter(p=>p.status==="published");return json(state);}
      if(request.method==="GET" && (path==="/blog"||path.startsWith("/blog/")||path==="/sitemap.xml")) {
        const {data}=await getState(env);
        if(path==="/sitemap.xml")return renderSitemap(data,env.SITE_ORIGIN);
        if(path==="/blog/rss.xml")return renderRSS(data,env.SITE_ORIGIN);
        return renderBlog(data,url,env.SITE_ORIGIN);
      }
      return json({error:"غير موجود"},404);
    } catch(error) {
      if(!error.status)console.error(JSON.stringify({event:"cms_request_failed",message:String(error.message)}));
      return json({error:error.status?error.message:"تعذر إكمال الطلب، يرجى المحاولة لاحقاً"},error.status||500);
    }
  }
};
