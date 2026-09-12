import {readFile, writeFile} from "node:fs/promises";
import {renderFooter} from "./footer.js";
const root=new URL("../",import.meta.url);
const {settings}=JSON.parse(await readFile(new URL("content/site.json",root),"utf8"));
const footer=renderFooter(settings);
for(const path of ["index.html","pages/about.html","pages/services.html","pages/products.html","pages/projects.html","pages/contact.html"]){
  const url=new URL(path,root),html=await readFile(url,"utf8");
  if(!/<footer\b[\s\S]*?<\/footer>/.test(html))throw new Error("Footer missing: "+path);
  await writeFile(url,html.replace(/<footer\b[\s\S]*?<\/footer>/,footer));
}
