(() => {
const init=()=>{
 const root=document.getElementById("site-header"),menu=document.getElementById("site-mobile-menu"),button=root?.querySelector("[data-open-navigation]");
 if(!menu||!button)return;let previousOverflow="";
 button.addEventListener("click",()=>{if(menu.open)return;previousOverflow=document.body.style.overflow;menu.showModal();document.body.style.overflow="hidden";button.setAttribute("aria-expanded","true");});
 const close=()=>{if(menu.open)menu.close();};
 menu.querySelector("[data-close-navigation]").addEventListener("click",close);
 menu.addEventListener("click",e=>{if(e.target.closest("a"))close();else if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
 menu.addEventListener("close",()=>{document.body.style.overflow=previousOverflow;button.setAttribute("aria-expanded","false");button.focus({preventScroll:true});});
 matchMedia("(min-width:1200px)").addEventListener("change",event=>{if(event.matches)close();});
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();