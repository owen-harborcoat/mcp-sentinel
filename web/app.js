import {timelineLayout, eventLevel, eventLabel} from './timeline.js';

const $ = id => document.getElementById(id);
const state = {overview:{scans:[],alerts:[],deliveries:[],stats:{}},events:[],cursor:0,config:{},cases:{},ready:false,seen:new Set(),notifications:false,selected:null};
const cache = {};
const levels = {critical:4,high:3,medium:2,low:1,info:0};
const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
function el(tag, cls, text) {const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function time(value) {return new Date(value).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});}
function date(value) {return new Date(value).toLocaleDateString([], {month:'short',day:'numeric'});}
function label(scan) {return state.cases[scan.scenario] || scan.scenario;}
function error(message) {$('error').textContent=message;$('error').hidden=!message;}
async function api(path, body) {
  const response=await fetch('/api'+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const value=await response.json();
  if(!response.ok)throw new Error(typeof value.detail==='string'?value.detail:`Request failed (${response.status})`);
  return value;
}
function button(text, action, cls='text-button') {
  const b=el('button',cls,text);b.type='button';
  b.addEventListener('click',async()=>{b.disabled=true;try{await action();error('');}catch(e){error(e.message);}finally{b.disabled=false;}});
  return b;
}
function cell(row,text,cls='') {const td=el('td',cls,text);row.append(td);return td;}
function option(value,text) {const o=el('option','',text);o.value=value;return o;}

async function detail(id, alertId=null) {
  const scan=await api('/scans/'+id), body=$('detail-body');body.replaceChildren();
  $('detail-title').textContent=label(scan);
  const meta=el('div','detail-meta');
  meta.append(el('span','mono',scan.id.slice(0,8)),el('span','',date(scan.created_at)+' '+time(scan.created_at)),el('span','',scan.runtime==='wasmer'?'Wasmer':'Simulation'),el('span','',scan.result?.provenance||scan.assessor));
  body.append(meta);
  if(scan.error)body.append(el('p','',scan.error));
  if(scan.result) {
    const j=scan.result.judgment, summary=el('div','detail-summary');
    summary.append(el('h3','',j.title),el('span','severity',j.flag?j.severity:'No alert'),el('p','',j.rationale),el('p','',j.recommendation));
    body.append(summary);
    const alert=state.overview.alerts.find(a=>a.id===(alertId||scan.result.alert_id));
    if(alert) {
      const actions=el('div','detail-actions');
      const act=async action=>{await api(`/alerts/${alert.id}/actions`,{action});await refresh();await detail(alert.scan_id,alert.id);};
      if(alert.status==='open')actions.append(button('Acknowledge',()=>act('acknowledge'),''));
      actions.append(button(alert.status==='resolved'?'Reopen':'Resolve',()=>act(alert.status==='resolved'?'reopen':'resolve'),''));
      if(['high','critical'].includes(alert.severity)&&alert.status!=='resolved') {
        const channels=el('details');channels.append(el('summary','','Notifications'));
        const deliveryActions=el('div','detail-actions');
        for(const [channel,name] of [['telegram','Telegram'],['twilio','SMS']]) {
          deliveryActions.append(button((state.config.live_notifications?'Send ':'Preview ')+name,async()=>{
            await api(`/alerts/${alert.id}/deliveries`,{channel});await refresh();
          },''));
        }
        channels.append(deliveryActions);body.append(actions,channels);
      }else body.append(actions);
    }
    for(const item of scan.result.evidence) {
      const d=el('details');d.open=j.evidence_ids.includes(item.id);
      d.append(el('summary','',item.id+' · '+item.summary));
      if(Object.hasOwn(item.data,'before')&&Object.hasOwn(item.data,'after')) {
        const grid=el('div','evidence-grid');
        for(const key of ['before','after']) {const col=el('div');col.append(el('h4','',key==='before'?'Before':'After'),el('pre','',JSON.stringify(item.data[key],null,2)));grid.append(col);}
        d.append(grid);
        const other=Object.fromEntries(Object.entries(item.data).filter(([key])=>!['before','after'].includes(key)));
        if(Object.keys(other).length)d.append(el('pre','',JSON.stringify(other,null,2)));
      } else d.append(el('pre','',JSON.stringify(item.data,null,2)));
      body.append(d);
    }
  }else if(!scan.error)body.append(el('p','muted',scan.status));
  if(!$('detail-dialog').open)$('detail-dialog').showModal();
}

function renderAlerts() {
  const filter=$('alert-filter').value, severity=$('severity-filter').value, term=$('alert-search').value.toLowerCase();
  const signature=JSON.stringify([state.overview.alerts,filter,severity,term]);
  if(cache.alerts===signature)return;cache.alerts=signature;
  const alerts=state.overview.alerts.filter(a=>(filter==='all'||(filter==='active'?a.status!=='resolved':a.status==='resolved'))&&(severity==='all'||a.severity===severity)&&`${a.id} ${a.title} ${a.rationale}`.toLowerCase().includes(term)).sort((a,b)=>levels[b.severity]-levels[a.severity]||b.updated_at.localeCompare(a.updated_at));
  $('alert-count').textContent=alerts.length;$('nav-alerts').textContent=state.overview.stats.open||'';
  $('alerts-empty').hidden=alerts.length>0;$('alert-list').replaceChildren();
  for(const a of alerts) {
    const row=el('tr');cell(row,'#'+a.id,'mono muted');
    const title=button(a.title,()=>detail(a.scan_id,a.id),'text-button finding');title.title=a.title;
    cell(row).append(title);cell(row,a.severity,'severity');cell(row,a.occurrences,'mono muted');cell(row,time(a.updated_at),'mono muted');
    const select=el('select','state-select');select.setAttribute('aria-label','State of alert '+a.id);
    select.append(option('',a.status));
    if(a.status==='open')select.append(option('acknowledge','Acknowledge'));
    select.append(option(a.status==='resolved'?'reopen':'resolve',a.status==='resolved'?'Reopen':'Resolve'));
    select.addEventListener('change',async()=>{if(!select.value)return;select.disabled=true;try{await api(`/alerts/${a.id}/actions`,{action:select.value});await refresh();error('');}catch(e){error(e.message);select.value='';}finally{select.disabled=false;}});
    cell(row).append(select);$('alert-list').append(row);
  }
}
function renderScans() {
  const filter=$('scan-filter').value, signature=JSON.stringify([state.overview.scans,filter]);
  if(cache.scans===signature)return;cache.scans=signature;
  const scans=state.overview.scans.filter(s=>filter==='all'||(filter==='flagged'?s.result?.judgment.flag:filter==='clear'?s.result&&!s.result.judgment.flag:['failed','interrupted'].includes(s.status)));
  $('scan-count').textContent=scans.length;$('scans-empty').hidden=scans.length>0;$('scan-list').replaceChildren();
  for(const scan of scans) {
    const row=el('tr');cell(row,time(scan.created_at),'mono muted');
    cell(row).append(button(label(scan),()=>detail(scan.id),'text-button scan-name'));
    cell(row,scan.runtime==='wasmer'?'Wasmer':'Simulation','runtime');
    cell(row,scan.assessor==='demo'?'Demo':scan.assessor==='openrouter'?'OpenRouter':'Gemini','muted');
    cell(row,scan.completed_at?((new Date(scan.completed_at)-new Date(scan.created_at))/1000).toFixed(1)+'s':'—','mono muted');
    cell(row,scan.result?(scan.result.judgment.flag?'Flagged':'No alert'):scan.status,'severity');
    $('scan-list').append(row);
  }
}
function svgEl(tag,attrs={},text) {
  const n=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));
  if(text!=null)n.textContent=text;return n;
}
function inspectEvent(event) {
  state.selected=event.id;
  for(const n of $('timeline-svg').querySelectorAll('.event-node')) {
    const selected=n.dataset.event===String(event.id);n.classList.toggle('selected',selected);n.setAttribute('tabindex',selected?'0':'-1');
  }
  const panel=$('event-detail');panel.hidden=false;panel.replaceChildren();
  const content=el('div');content.append(el('span','mono muted',time(event.ts)+' · '+eventLabel(event)),el('p','',event.detail));
  if(event.data?.judgment)content.append(el('p','',event.data.judgment.rationale));
  panel.append(content,button('Inspect scan →',()=>detail(event.scan_id)));
}
function matchingEvents() {
  const filter=$('event-filter').value, term=$('search').value.toLowerCase();
  return state.events.filter(e=>(filter==='all'||(filter==='finding'?eventLevel(e)!=='normal':e.kind.includes(filter)))&&`${e.kind} ${e.detail} ${e.scan_id}`.toLowerCase().includes(term));
}
function renderEvents() {
  const signature=JSON.stringify([state.cursor,$('event-filter').value,$('search').value,$('zoom').value]);
  if(cache.events===signature)return;
  const initial=!cache.events;cache.events=signature;
  const events=matchingEvents(), layout=timelineLayout(events,Number($('zoom').value));
  if(state.selected&&!events.some(e=>e.id===state.selected)){$('event-detail').hidden=true;state.selected=null;}
  const scroller=$('timeline-scroll'), wasAtEnd=scroller.scrollLeft+scroller.clientWidth>=scroller.scrollWidth-50, oldLeft=scroller.scrollLeft;
  $('event-count').textContent=events.length;$('timeline-empty').hidden=events.length>0;$('timeline-scroll').hidden=!events.length;
  $('timeline-range').textContent=events.length?date(events[0].ts)+' · '+time(events[0].ts)+' – '+time(events.at(-1).ts):'';
  const svg=$('timeline-svg');svg.replaceChildren();svg.setAttribute('width',layout.width);svg.setAttribute('viewBox',`0 0 ${layout.width} 250`);
  svg.append(svgEl('path',{d:`M 28 125 H ${layout.width-30}`,class:'trunk'}));
  for(const [i,node] of layout.nodes.entries()) {
    const {event,x,level,branchY}=node;
    if(i===0||i%8===0) {
      svg.append(svgEl('line',{x1:x,y1:132,x2:x,y2:143,class:'axis-tick'}),svgEl('text',{x,y:158,class:'axis-label'},time(event.ts)));
    }
    const group=svgEl('g',{class:'event-node '+level+(state.selected===event.id?' selected':''),role:'button',tabindex:state.selected===event.id||(!state.selected&&i===layout.nodes.length-1)?0:-1,'aria-label':time(event.ts)+' '+eventLabel(event)+' '+event.detail,'data-event':event.id});
    group.append(svgEl('title',{},time(event.ts)+' · '+eventLabel(event)+' · '+event.detail),svgEl('rect',{x:x-10,y:112,width:20,height:26,class:'hit'}));
    if(level!=='normal') {
      group.append(svgEl('rect',{x:x-8,y:Math.min(125,branchY)-24,width:140,height:Math.abs(125-branchY)+45,class:'hit'}));
      group.append(svgEl('path',{d:`M ${x} 125 C ${x+14} 125 ${x+14} ${branchY} ${x+32} ${branchY} H ${x+120}`,class:'branch'}));
      group.append(svgEl('circle',{cx:x+120,cy:branchY,r:3,class:'branch-dot'}));
      group.append(svgEl('text',{x:x+32,y:branchY-12},event.kind==='SCAN_FAILED'?'Scan failed':level==='emergency'?'Emergency':'Warning'));
    }
    group.append(svgEl('circle',{cx:x,cy:125,r:event.kind==='SCAN_STARTED'?4:2.5,class:'dot'}));
    group.addEventListener('click',()=>inspectEvent(event));
    group.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();inspectEvent(event);}
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
        e.preventDefault();const next=layout.nodes[i+(e.key==='ArrowLeft'?-1:1)];
        if(next){inspectEvent(next.event);svg.querySelector(`[data-event="${next.event.id}"]`).focus();}
      }
    });
    svg.append(group);
  }
  const lastBranch=layout.nodes.findLast(n=>n.level!=='normal');
  scroller.scrollLeft=initial&&lastBranch?Math.max(0,lastBranch.x-scroller.clientWidth*.35):wasAtEnd?scroller.scrollWidth:oldLeft;
  $('event-list').replaceChildren();
  for(const event of [...events].reverse().slice(0,100)) {
    const row=el('tr');cell(row,time(event.ts),'mono muted');cell(row,eventLabel(event));
    cell(row,event.detail,'muted');cell(row).append(button(event.scan_id?.slice(0,8)||'—',()=>detail(event.scan_id),'text-button mono'));
    $('event-list').append(row);
  }
}
function renderDeliveries() {
  const signature=JSON.stringify(state.overview.deliveries);if(cache.deliveries===signature)return;cache.deliveries=signature;
  $('delivery-list').replaceChildren();$('delivery-count').textContent=state.overview.deliveries.length;
  for(const d of state.overview.deliveries) {
    const row=el('tr');cell(row,time(d.created_at),'mono muted');cell(row,'#'+d.alert_id,'mono');
    cell(row,d.channel==='twilio'?'Twilio SMS':'Telegram');cell(row,d.status==='dry_run'?'Preview':d.status);cell(row,d.detail,'muted');$('delivery-list').append(row);
  }
}
function notifyNewAlerts() {
  for(const a of state.overview.alerts) {
    const key=a.id+':'+a.generation;
    if(state.ready&&state.notifications&&!state.seen.has(key)&&a.status==='open'&&['high','critical'].includes(a.severity)){
      try{new Notification('MCP Sentinel',{body:a.severity.toUpperCase()+' alert #'+a.id,tag:key});}catch{state.notifications=false;}
    }
    state.seen.add(key);
  }
}
let refreshing=false;
async function refresh() {
  if(refreshing)return;refreshing=true;
  try {
    state.overview=await api('/overview');
    let more=true;while(more){const page=await api(`/events?since_id=${state.cursor}&limit=500`);state.events.push(...page.events);state.cursor=page.next_since_id;more=page.events.length===500;}
    state.events=state.events.slice(-500);
    $('run-scan').disabled=state.overview.running;$('run-scan').textContent=state.overview.running?'Scanning…':'Run scan';
    renderAlerts();renderScans();renderEvents();renderDeliveries();notifyNewAlerts();state.ready=true;
    $('connection').textContent='Connected';
  }finally{refreshing=false;}
}
$('scan-form').addEventListener('submit',async e=>{e.preventDefault();$('run-scan').disabled=true;try{await api('/scans',{scenario:$('scenario').value,runtime:$('runtime').value,assessor:$('assessor').value});error('');await refresh();}catch(err){error(err.message);$('run-scan').disabled=false;}});
for(const id of ['alert-filter','severity-filter'])$(id).addEventListener('change',renderAlerts);
$('alert-search').addEventListener('input',renderAlerts);$('scan-filter').addEventListener('change',renderScans);
for(const id of ['event-filter','zoom'])$(id).addEventListener('change',renderEvents);
$('search').addEventListener('input',renderEvents);
$('latest').addEventListener('click',()=>$('timeline-scroll').scrollTo({left:$('timeline-scroll').scrollWidth,behavior:motion()}));
$('close-dialog').addEventListener('click',()=>$('detail-dialog').close());
$('browser-notify').addEventListener('click',async()=>{
  if(!('Notification'in window)){error('Browser notifications unavailable');return;}
  state.notifications=await Notification.requestPermission()==='granted';$('browser-state').textContent=state.notifications?'Enabled':'Off';
});
const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){for(const link of document.querySelectorAll('nav a')){if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}
},{rootMargin:'-10% 0px -65% 0px'});
for(const section of document.querySelectorAll('main>section'))observer.observe(section);
try {
  const [config,cases]=await Promise.all([api('/config'),api('/scenarios')]);state.config=config;
  for(const c of cases){state.cases[c.id]=c.label;$('scenario').append(option(c.id,c.label));}
  $('scenario').value='poison';$('assessor').value=config.openrouter_ready?'openrouter':'demo';
  $('telegram-state').textContent=config.live_notifications&&config.telegram_ready?'Enabled':'Preview only';
  $('twilio-state').textContent=config.live_notifications&&config.twilio_ready?'Enabled':'Preview only';
  await refresh();
}catch(e){error(e.message);$('connection').textContent='Disconnected';}
setInterval(()=>refresh().catch(e=>{error(e.message);$('connection').textContent='Disconnected';}),2000);
