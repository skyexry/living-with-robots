const $=id=>document.getElementById(id);
const names=['Living with Robots','Frontier / Participation','Different Ways of Working','When Robots and Humans Collide','Whose Risk? Whose Rewards?','Regular Animals','Cat Royale','Under Construction','Detroit: Become Human'];
const entries=names.map((_,p)=>SCENES.findIndex(s=>s.page===p&&!s.kind));
const positions=names.map((_,i)=>({x:(i%3)*1390,y:Math.floor(i/3)*930}));
let current=0,lineFrame,paintTimer,exploring=false,view={x:0,y:0,s:1},drag=null;
for(let i=0;i<9;i++){
 const el=document.createElement('div');el.className='spread';el.style.left=positions[i].x+'px';el.style.top=positions[i].y+'px';el.setAttribute('aria-label','Open '+names[i]);
 el.innerHTML=`<img src="assets/spread-${i}.jpg?v=final-cited-2" alt="Original magazine spread: ${names[i]}" draggable="false"><span class="spread-label"><b>${String(i+1).padStart(2,'0')}</b>${names[i]}</span>`;
 el.onclick=()=>{if(!exploring)go(entries[i])};
 SCENES.forEach((s,n)=>{if(s.page!==i||s.kind||!s.rect||s.rect[2]>=.99)return;const hot=document.createElement('button');hot.className='hotspot';hot.style.cssText=`left:${s.rect[0]*100}%;top:${s.rect[1]*100}%;width:${s.rect[2]*100}%;height:${s.rect[3]*100}%;`;hot.setAttribute('aria-label','Zoom into '+s.eyebrow);hot.innerHTML='<span>'+s.eyebrow+' ↗</span>';hot.onmouseenter=()=>{if(exploring)return;const r=hot.getBoundingClientRect(),tip=$('hotspot-tip');tip.textContent=s.eyebrow+' ↗';tip.hidden=false;tip.style.left=Math.max(20,Math.min(innerWidth-350,r.left))+'px';tip.style.top=Math.max(85,Math.min(innerHeight-100,r.top-35))+'px'};hot.onmouseleave=()=>{$('hotspot-tip').hidden=true};hot.onclick=e=>{e.stopPropagation();if(!exploring)go(n)};el.append(hot)});
 CITE_SPOTS.filter(c=>c.page===i).forEach(c=>{const b=document.createElement('button');b.className='citation-hotspot';b.setAttribute('aria-label','Read source '+c.ids.join(', '));b.title='Read source '+c.ids.join(', ');b.style.cssText=`left:${c.rect[0]*100}%;top:${c.rect[1]*100}%;width:${c.rect[2]*100}%;height:${c.rect[3]*100}%;`;b.onclick=e=>{e.stopPropagation();showSources(c.ids)};el.append(b)});
 SCENES.forEach((scene,n)=>{if(scene.page!==i||!scene.callout)return;scene.visual.items.forEach(item=>{const a=item.anchor,mark=document.createElement('span');mark.className='text-highlight';mark.dataset.scene=n;mark.style.cssText=`left:${a[0]}px;top:${a[1]}px;width:${a[2]-a[0]}px;height:${a[3]-a[1]}px`;el.append(mark)})});
 $('world').append(el);
 const tile=document.createElement('button');tile.innerHTML=`<img src="assets/spread-${i}.jpg?v=final-cited-2" alt="${names[i]}"><span>${names[i]}<small>pp. ${i*2+2}–${i*2+3}</small></span>`;tile.onclick=()=>{$('index-panel').hidden=true;go(entries[i])};const group=document.createElement('div');group.className='index-group';group.append(tile);const stops=document.createElement('div');stops.className='index-stops';SCENES.forEach((s,n)=>{if(s.page!==i||s.kind)return;const b=document.createElement('button');b.textContent=s.eyebrow.replace(/^0[1-4] \/ /,'');b.onclick=()=>{$('index-panel').hidden=true;go(n)};stops.append(b)});group.append(stops);$('index-grid').append(group);
}
SCENES.forEach((s,i)=>{const b=document.createElement('button');b.title=`${i+1}. ${(s.title||s.eyebrow).replace(/<[^>]+>/g,' ')} · ${s.time}s`;b.setAttribute('aria-label',b.title);b.onclick=()=>go(i);$('progress').append(b)});
function fit(rect,box){const s=Math.min(box.w/rect.w,box.h/rect.h);return {s,x:box.x+box.w/2-(rect.x+rect.w/2)*s,y:box.y+box.h/2-(rect.y+rect.h/2)*s}}
function apply(v){view=v;document.documentElement.style.setProperty('--camera-scale',v.s);$('world').style.transform=`translate(${v.x}px,${v.y}px) scale(${v.s})`}
function camera(){const s=SCENES[current],w=innerWidth,h=$('viewport').clientHeight,mobile=w<=600;let v;
 if(s.kind==='map'){v=fit({x:0,y:0,w:4004,h:2680},{x:mobile?24:Math.max(40,w*.14),y:mobile?140:195,w:mobile?w-48:w*.72,h:h-(mobile?160:220)})}
 else if(s.kind==='cover'||s.kind==='end'){v=fit({x:0,y:0,w:4004,h:2680},{x:mobile?10:w*.43,y:mobile?-20:25,w:mobile?w*1.4:w*.64,h:mobile?h*.7:h-50})}
 else{const p=positions[s.page],r=s.rect;v=fit({x:p.x+r[0]*1224,y:p.y+r[1]*792,w:r[2]*1224,h:r[3]*792},mobile?{x:24,y:12,w:w-48,h:h*.44}:{x:40,y:28,w:s.callout?w*.28-50:w*.645-60,h:h-110})}
 apply(v);trackCalloutLines();
 document.querySelectorAll('.spread').forEach((el,i)=>{el.classList.toggle('dim',!s.kind&&i!==s.page);el.classList.toggle('active',i===s.page&&!s.kind)});
}
function paint(){const s=SCENES[current];$('eyebrow').textContent=s.eyebrow;document.body.classList.toggle('callout',!!s.callout);$('intro').hidden=!s.intro;$('intro').textContent=s.intro||'';document.querySelectorAll('.text-highlight').forEach(el=>el.hidden=Number(el.dataset.scene)!==current);document.body.classList.toggle('chapter',!!s.chapter);$('chapter-marker').hidden=!s.chapter;$('chapter-marker').innerHTML=s.chapter?'<span>'+s.chapter.number+'</span><strong>'+s.chapter.name+'</strong>':'';$('title').innerHTML=s.title;$('body').innerHTML=s.body;$('tags').innerHTML=(s.tags||[]).map(t=>'<span>'+t+'</span>').join('');$('take').textContent=s.take||'';
 $('excerpt-label').hidden=!s.excerpt;
 $('authors').hidden=s.kind!=='cover'&&s.kind!=='end';$('actions').hidden=s.kind!=='cover'&&s.kind!=='end';$('begin').hidden=s.kind==='end';
 $('reference').textContent=s.ref?`CHAPTER pp. ${s.pages||`${s.page*2+2}–${s.page*2+3}`} · ${s.ref} ↗`:'';$('reference').href=`Living-with-Robots.pdf?v=final-cited-3#page=${s.page+1}`;
 $('section').textContent=s.section;$('count').textContent=String(current+1).padStart(2,'0')+' / '+SCENES.length;
 $('page-label').textContent=`IN THE MAGAZINE / pp. ${s.pages||`${s.page*2+2}–${s.page*2+3}`}`;
 $('cue').textContent=s.note;let elapsed=SCENES.slice(0,current).reduce((a,b)=>a+b.time,0);$('timing').textContent=`${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')} · ${s.time} sec`;
 $('prev').disabled=current===0;$('next').disabled=current===SCENES.length-1;
 [...$('progress').children].forEach((b,i)=>{b.classList.toggle('current',i===current);b.classList.toggle('past',i<current);if(i===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 const visual=$('feature-visual');visual.replaceChildren();visual.hidden=!s.visual;document.body.classList.toggle('with-visual',!!s.visual);
 if(s.visual){const v=s.visual;if(v.type==='images'){visual.className='visual-images count-'+v.items.length;v.items.forEach(item=>{const fig=document.createElement('figure');const im=document.createElement('img');im.src=item.src;im.alt=item.label;const caption=document.createElement('figcaption');caption.textContent=item.label;fig.append(im,caption);visual.append(fig)})}else{visual.className='visual-diagram '+v.type;const k=document.createElement('div');k.className='kicker';k.textContent=v.kicker;visual.append(k);v.steps.forEach((step,i)=>{const row=document.createElement('div');row.className='diagram-row';const num=document.createElement('span');num.textContent=String(i+1).padStart(2,'0');const content=document.createElement('div');const h=document.createElement('h3');h.textContent=step[0];const t=document.createElement('p');t.textContent=step[1];content.append(h,t);row.append(num,content);visual.append(row)});const caption=document.createElement('p');caption.className='diagram-caption';caption.textContent=v.caption;visual.append(caption)}}
 requestAnimationFrame(drawCalloutLines);
}
let transitionToken=0;
function trackCalloutLines(){
 cancelAnimationFrame(lineFrame);
 const until=performance.now()+1500;
 const tick=()=>{drawCalloutLines();if(performance.now()<until)lineFrame=requestAnimationFrame(tick)};
 lineFrame=requestAnimationFrame(tick);
}
function go(n,instant=false){
 const next=Math.max(0,Math.min(SCENES.length-1,n)),target=SCENES[next];
 const token=++transitionToken;
 clearTimeout(paintTimer);$('hotspot-tip').hidden=true;
 $('story').classList.add('changing');
 $('feature-visual').classList.add('changing');
 $('callout-lines').classList.add('changing');
 current=next;exploring=false;$('explore-hint').hidden=true;
 document.body.classList.remove('exploring');
 history.replaceState(null,'','#'+current);
 // The magazine starts moving immediately; only overlays cross-fade.
 if(instant)$('world').classList.add('repositioning');
 camera();
 const update=()=>{
  if(token!==transitionToken)return;
  document.body.className=target.kind||'detail';
  paint();
  $('feature-visual').classList.add('changing');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(token!==transitionToken)return;
   $('world').classList.remove('repositioning');
   $('story').classList.remove('changing');
   $('feature-visual').classList.remove('changing');
   $('callout-lines').classList.remove('changing');
   trackCalloutLines();
  }));
 };
 if(instant)update();else paintTimer=setTimeout(update,260);
}

function toggleIndex(){const p=$('index-panel');p.hidden=!p.hidden;if(!p.hidden)$('close-index').focus()}
function explore(){exploring=!exploring;document.body.classList.toggle('exploring',exploring);if(exploring)$('callout-lines').replaceChildren();else trackCalloutLines();$('explore-hint').hidden=!exploring;if(!exploring)camera()}
$('next').onclick=()=>go(current+1);$('prev').onclick=()=>go(current-1);$('begin').onclick=()=>go(1);$('overview').onclick=toggleIndex;$('close-index').onclick=toggleIndex;
$('explore').onclick=explore;$('resume').onclick=explore;$('note-toggle').onclick=()=>{$('notes').hidden=!$('notes').hidden};$('close-notes').onclick=()=>{$('notes').hidden=true};
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(e){$('full').title='Use your browser’s fullscreen menu'}};
document.querySelector('.brand').onclick=e=>{e.preventDefault();go(0)};
document.addEventListener('keydown',e=>{if(e.altKey||e.metaKey||e.ctrlKey||['INPUT','TEXTAREA'].includes(e.target.tagName))return;
 if(e.key==='Escape'){$('index-panel').hidden=true;$('notes').hidden=true;$('sources-panel').hidden=true;if(exploring)explore();return}
 if(!$('index-panel').hidden||!$('sources-panel').hidden)return;
 if((e.key===' '&&e.target.tagName!=='BUTTON')||e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(current+1)}
 if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(current-1)}
 if(e.key==='Home'){e.preventDefault();go(0)}
 if(e.key.toLowerCase()==='o')toggleIndex();if(e.key.toLowerCase()==='e'&&!SCENES[current].kind)explore();if(e.key.toLowerCase()==='n')$('notes').hidden=!$('notes').hidden;if(e.key.toLowerCase()==='f')$('full').click();
});
$('viewport').addEventListener('wheel',e=>{if(!exploring)return;e.preventDefault();const r=$('viewport').getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,ns=Math.max(.12,Math.min(5,view.s*Math.exp(-e.deltaY*.0015)));apply({s:ns,x:x-(x-view.x)*ns/view.s,y:y-(y-view.y)*ns/view.s})},{passive:false});
$('viewport').addEventListener('pointerdown',e=>{if(!exploring)return;drag={x:e.clientX,y:e.clientY,v:{...view}};$('viewport').setPointerCapture(e.pointerId)});
$('viewport').addEventListener('pointermove',e=>{if(!drag)return;apply({s:drag.v.s,x:drag.v.x+e.clientX-drag.x,y:drag.v.y+e.clientY-drag.y})});
$('viewport').addEventListener('pointerup',()=>drag=null);$('viewport').addEventListener('pointercancel',()=>drag=null);$('viewport').ondblclick=()=>{if(exploring)camera()};
window.addEventListener('resize',camera);window.addEventListener('hashchange',()=>{const n=parseInt(location.hash.slice(1));if(Number.isFinite(n))go(n)});
go(Number.isFinite(parseInt(location.hash.slice(1)))?parseInt(location.hash.slice(1)):0,true);

function sourceIds(ref){const vals=ref.replace(/[\[\]]/g,'').split(',');let ids=[];vals.forEach(v=>{const a=v.trim().split(/[–-]/).map(Number);if(a.length===2){for(let n=a[0];n<=a[1];n++)ids.push(n)}else if(a[0])ids.push(a[0])});return ids}
function showSources(ids){$('source-list').replaceChildren();ids.forEach(id=>{const source=SOURCES[id-1];if(!source)return;const article=document.createElement('article');const h=document.createElement('p');h.textContent=source.text;article.append(h);if(source.url){const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener';a.textContent='Open original source ↗';article.append(a)}else{const label=document.createElement('small');label.textContent='Print source · full publication details above';article.append(label)}$('source-list').append(article)});$('sources-panel').hidden=false;$('close-sources').focus()}
$('reference').onclick=e=>{e.preventDefault();showSources(sourceIds(SCENES[current].ref||''))};$('close-sources').onclick=()=>{$('sources-panel').hidden=true;$('reference').focus()};

function drawCalloutLines(){
 const svg=$('callout-lines');svg.replaceChildren();const s=SCENES[current];if(!s.callout||exploring)return;
 const marks=[...document.querySelectorAll('.text-highlight')].filter(el=>!el.hidden),figs=$('feature-visual').querySelectorAll('figure');
 marks.forEach((mark,i)=>{if(!figs[i])return;const a=mark.getBoundingClientRect(),b=figs[i].getBoundingClientRect();const x=a.right+4,y=a.bottom+2,ex=b.left-8,ey=b.top+b.height/2;const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M ${x} ${y} H ${(x+ex)/2} V ${ey} H ${ex}`);svg.append(path)});
}
