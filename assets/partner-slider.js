(() => {
  "use strict";
  const start = () => {
    const root=document.getElementById("partners"),track=root?.querySelector(".partners-slider"),viewport=root?.querySelector(".partners-container");
    if(!root||!track||!viewport)return;
    const prev=document.getElementById("prevPartner"),next=document.getElementById("nextPartner");
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    viewport.setAttribute("role","region");viewport.setAttribute("aria-roledescription","carousel");viewport.setAttribute("aria-label","شركاء النجاح");viewport.tabIndex=0;
    prev?.setAttribute("aria-label","الشريك السابق");next?.setAttribute("aria-label","الشريك التالي");
    const controls=document.createElement("div");controls.className="partner-playback";
    const toggle=document.createElement("button");toggle.type="button";toggle.className="partner-toggle";
    const status=document.createElement("span");status.className="partner-status";status.setAttribute("aria-live","off");
    controls.append(toggle,status);viewport.parentElement.after(controls);
    let originals=[],visible=4,index=0,position=0,step=0,moving=false,timer=null,settleTimer=null,frame=null,enabled=!motion.matches,inView=false,lastWidth=0;
    const count=()=>innerWidth<=768?2:4;
    const stop=()=>{clearTimeout(timer);timer=null;};
    const canPlay=()=>enabled&&!document.hidden&&inView&&!root.matches(":hover")&&!root.contains(document.activeElement);
    function schedule(){stop();if(originals.length>visible&&canPlay())timer=setTimeout(()=>move(1),5000);}
    function paint(){track.style.transform="translate3d("+(position*step)+"px,0,0)";track.dataset.index=String(index);}
    function update(){
      const total=originals.length;
      status.textContent=total?Array.from({length:Math.min(visible,total)},(_,i)=>originals[(index+i)%total].querySelector("img")?.alt||"").filter(Boolean).join(" · "):"";
      originals.forEach((slide,i)=>slide.setAttribute("aria-hidden",String((i-index+total)%total>=visible)));
      toggle.textContent=enabled?"إيقاف الحركة التلقائية":"تشغيل الحركة التلقائية";
      toggle.setAttribute("aria-pressed",String(enabled));controls.hidden=total<=visible;
      for(const button of [prev,next])if(button){button.hidden=total<=visible;button.disabled=moving;}
    }
    function settle(){
      if(!moving)return;
      clearTimeout(settleTimer);moving=false;
      if(position>=visible+originals.length||position<visible){
        track.style.transition="none";position=visible+index;paint();
        cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>track.style.removeProperty("transition"));});
      }
      update();schedule();
    }
    function move(direction){
      if(moving||originals.length<=visible)return;
      stop();cancelAnimationFrame(frame);track.style.removeProperty("transition");
      index=(index+direction+originals.length)%originals.length;position+=direction;moving=true;update();paint();
      if(motion.matches)settle();else settleTimer=setTimeout(settle,650);
    }
    function rebuild(){
      stop();clearTimeout(settleTimer);cancelAnimationFrame(frame);moving=false;
      track.querySelectorAll("[data-partner-clone]").forEach(node=>node.remove());
      originals=[...track.children];visible=count();index=originals.length?index%originals.length:0;
      originals.forEach(slide=>{slide.classList.remove("is-active","is-entering");slide.style.removeProperty("animation");slide.style.removeProperty("order");});
      if(originals.length>visible){
        const clone=slide=>{const node=slide.cloneNode(true);node.dataset.partnerClone="true";node.setAttribute("aria-hidden","true");node.inert=true;node.querySelectorAll("[id]").forEach(x=>x.removeAttribute("id"));return node;};
        track.prepend(...originals.slice(-visible).map(clone));track.append(...originals.slice(0,visible).map(clone));position=visible+index;
      }else position=0;
      const first=track.firstElementChild;step=first?first.getBoundingClientRect().width+parseFloat(getComputedStyle(first).marginLeft)+parseFloat(getComputedStyle(first).marginRight):0;
      track.style.transition="none";paint();update();lastWidth=viewport.clientWidth;
      frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{track.style.removeProperty("transition");schedule();});});
    }
    track.addEventListener("transitionend",e=>{if(e.target===track&&e.propertyName==="transform")settle();});
    next?.addEventListener("click",()=>move(1));prev?.addEventListener("click",()=>move(-1));
    viewport.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();move(e.key==="ArrowLeft"?1:-1);}});
    toggle.addEventListener("click",()=>{enabled=!enabled;update();schedule();});
    root.addEventListener("mouseenter",stop);root.addEventListener("mouseleave",schedule);root.addEventListener("focusin",stop);root.addEventListener("focusout",()=>setTimeout(schedule,0));
    document.addEventListener("visibilitychange",schedule);
    motion.addEventListener("change",()=>{enabled=!motion.matches;rebuild();});
    new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(viewport);
    new ResizeObserver(()=>{if(Math.abs(viewport.clientWidth-lastWidth)>1||visible!==count())rebuild();}).observe(viewport);
    window.addEventListener("elevation:content",rebuild);
    rebuild();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();