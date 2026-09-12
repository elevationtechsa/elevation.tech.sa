import {readFile,writeFile} from "node:fs/promises";
const source=await readFile(new URL("./header.js",import.meta.url),"utf8");
const {renderHeader}=await import("data:text/javascript;base64,"+Buffer.from(source).toString("base64"));
const root=new URL("../",import.meta.url),{settings}=JSON.parse(await readFile(new URL("content/site.json",root),"utf8"));
for(const [path,key] of [["index.html","home"],["pages/about.html","about"],["pages/services.html","services"],["pages/products.html","products"],["pages/projects.html","projects"],["pages/contact.html","contact"]]){
 const url=new URL(path,root),html=await readFile(url,"utf8");
 if(!/<header\b[\s\S]*?<\/header>/.test(html))throw Error("Header missing: "+path);
 await writeFile(url,html.replace(/<header\b[\s\S]*?<\/header>/,renderHeader(settings,key)));
}
