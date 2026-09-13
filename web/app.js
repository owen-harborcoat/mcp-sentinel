import {timelineLayout, eventLevel, eventLabel, preferredEvent, tooltipPosition, dashboardStats, scanContextLabel} from './timeline.js';

const $ = id => document.getElementById(id);
const state = {overview:{scans:[],alerts:[],deliveries:[],stats:{}},events:[],cursor:0,config:{},cases:{},ready:false,seen:new Set(),notifications:false,selected:null,selectionDismissed:false,layout:{nodes:[]}};
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
let tooltipTimer, tooltipAnchor=null, restoringEventFocus=false;
function hideEventTooltip() {
  clearTimeout(tooltipTimer);
  if(tooltipAnchor)tooltipAnchor.removeAttribute('aria-describedby');
  tooltipAnchor=null;
  if($('event-tooltip'))$('event-tooltip').hidden=true;
}
function postponeTooltipHide() {clearTimeout(tooltipTimer);tooltipTimer=setTimeout(hideEventTooltip,160);}
function showEventTooltip(event,anchor) {
  const tooltip=$('event-tooltip');if(!tooltip)return;
  clearTimeout(tooltipTimer);
  if(tooltipAnchor&&tooltipAnchor!==anchor)tooltipAnchor.removeAttribute('aria-describedby');
  tooltipAnchor=anchor;
  tooltip.replaceChildren(el('strong','tooltip-heading',eventLabel(event)),el('span','tooltip-time',date(event.ts)+' · '+time(event.ts)),el('p','tooltip-detail',event.detail||'No additional detail'),el('span','tooltip-scan','Scan '+(event.scan_id||'unavailable')));
  tooltip.hidden=false;anchor.setAttribute('aria-describedby','event-tooltip');
  const bounds=tooltip.getBoundingClientRect(), position=tooltipPosition(anchor.getBoundingClientRect(),bounds.width,bounds.height,window.innerWidth,window.innerHeight);
  tooltip.style.left=position.left+'px';tooltip.style.top=position.top+'px';
}
function updateEventSelection() {
  const nodes=state.layout.nodes, index=nodes.findIndex(node=>node.event.id===state.selected);
  const firstNode=$('timeline-svg').querySelector('.event-node');
  for(const n of $('timeline-svg').querySelectorAll('.event-node')) {
    const selected=n.dataset.event===String(state.selected);
    n.classList.toggle('selected',selected);n.setAttribute('aria-pressed',String(selected));
    n.setAttribute('tabindex',selected||(!state.selected&&n===firstNode)?'0':'-1');
  }
  for(const row of $('event-list').querySelectorAll('.event-row')) {
    const selected=row.dataset.event===String(state.selected);row.classList.toggle('selected',selected);
    row.querySelector('.event-log-button')?.setAttribute('aria-pressed',String(selected));
  }
  if($('timeline-position'))$('timeline-position').textContent=index>=0?`${index+1} / ${nodes.length}`:nodes.length?`${nodes.length} events`:'No events';
  if($('previous-event'))$('previous-event').disabled=!nodes.length||index===0;
  if($('next-event'))$('next-event').disabled=!nodes.length||index===nodes.length-1;
}
function renderInspector(event) {
  const panel=$('event-detail'), signature=JSON.stringify([event,Boolean(state.layout.nodes.length)]);
  panel.hidden=false;
  if(cache.inspector===signature)return;
  cache.inspector=signature;panel.replaceChildren();
  const header=el('div','inspector-header');header.append(el('h3','',event?eventLabel(event):'Event inspector'));
  if(event) {
    const close=el('button','inspector-close','×');close.type='button';close.id='clear-event';close.setAttribute('aria-label','Close event inspector');
    close.addEventListener('click',()=>{hideEventTooltip();state.selected=null;state.selectionDismissed=true;renderInspector(null);updateEventSelection();$('timeline-scroll').focus({preventScroll:true});});header.append(close);
  }
  panel.append(header);
  if(!event) {panel.append(el('p','inspector-empty',state.layout.nodes.length?'Select an event to inspect its detail and scan evidence.':'No events match the current filters.'));return;}
  const meta=el('div','inspector-meta');
  const scanId=el('span','inspector-scan','Scan '+(event.scan_id?.slice(0,8)||'unavailable'));scanId.title=event.scan_id||'Unavailable';
  meta.append(el('span','mono',date(event.ts)+' · '+time(event.ts)),scanId);
  panel.append(meta,el('p','inspector-detail',event.detail||'No additional detail'));
  if(event.data?.judgment) {
    const judgment=event.data.judgment;
    const rationale=el('details','inspector-rationale');rationale.append(el('summary','','Assessment rationale'),el('p','',judgment.rationale));
    if(judgment.evidence_ids?.length)rationale.append(el('p','mono','Evidence: '+judgment.evidence_ids.join(', ')));
    panel.append(rationale);
  }
  if(event.scan_id) {
    const actions=el('div','inspector-actions');actions.append(button('Open scan details →',()=>detail(event.scan_id),''));panel.append(actions);
  }
}
function revealEvent(id,behavior=motion()) {
  const node=state.layout.nodes.find(item=>item.event.id===id);if(!node)return;
  const scroller=$('timeline-scroll'), right=node.x+(node.level==='normal'?16:138);
  if(node.x-16<scroller.scrollLeft||right>scroller.scrollLeft+scroller.clientWidth)scroller.scrollTo({left:Math.max(0,node.x-scroller.clientWidth*.3),behavior});
}
function inspectEvent(event,{reveal=false,focus=false}={}) {
  hideEventTooltip();state.selected=event.id;state.selectionDismissed=false;
  updateEventSelection();renderInspector(event);
  if(reveal)revealEvent(event.id);
  if(focus)$('timeline-svg').querySelector(`[data-event="${event.id}"]`)?.focus({preventScroll:true});
}
function navigateEvent(direction) {
  const nodes=state.layout.nodes,index=nodes.findIndex(node=>node.event.id===state.selected);
  const target=nodes[index<0?(direction<0?nodes.length-1:0):index+direction];
  if(target)inspectEvent(target.event,{reveal:true});
}
function updateTimelineWindow() {
  const scroller=$('timeline-scroll'), nodes=state.layout.nodes;
  const visible=nodes.filter(node=>node.x>=scroller.scrollLeft&&node.x<=scroller.scrollLeft+scroller.clientWidth);
  if($('timeline-window'))$('timeline-window').textContent=visible.length?`Viewing ${nodes.indexOf(visible[0])+1}–${nodes.indexOf(visible.at(-1))+1} of ${nodes.length}`:nodes.length?`${nodes.length} events`:'No events';
}
function matchingEvents() {
  const filter=$('event-filter').value, term=$('search').value.toLowerCase();
  return state.events.filter(e=>(filter==='all'||(filter==='finding'?eventLevel(e)!=='normal':e.kind.includes(filter)))&&`${e.kind} ${e.detail} ${e.scan_id}`.toLowerCase().includes(term));
}
function renderEvents() {
  const signature=JSON.stringify([state.cursor,$('event-filter').value,$('search').value,$('zoom').value]);
  if(cache.events===signature)return;
  const controls=JSON.stringify([$('event-filter').value,$('search').value,$('zoom').value]);
  const initial=!cache.events, controlsChanged=cache.eventControls!==controls;cache.events=signature;cache.eventControls=controls;
  const events=matchingEvents(), layout=timelineLayout(events,Number($('zoom').value));
  state.layout=layout;
  const selected=state.selectionDismissed?null:preferredEvent(events,state.selected);state.selected=selected?.id??null;
  const active=document.activeElement, focusedNode=active?.closest('.event-node'), focusedLog=active?.closest('.event-log-button');
  const restoreFocus=focusedNode?{id:focusedNode.dataset.event,type:'node'}:focusedLog?{id:focusedLog.closest('.event-row').dataset.event,type:'log'}:null;
  hideEventTooltip();
  const scroller=$('timeline-scroll'), wasAtEnd=scroller.scrollLeft+scroller.clientWidth>=scroller.scrollWidth-50, oldLeft=scroller.scrollLeft;
  $('event-count').textContent=events.length;$('timeline-empty').hidden=events.length>0;$('timeline-scroll').hidden=!events.length;
  $('timeline-range').textContent=events.length?date(events[0].ts)+' · '+time(events[0].ts)+' – '+time(events.at(-1).ts):'';
  const svg=$('timeline-svg');svg.replaceChildren();svg.setAttribute('width',layout.width);svg.setAttribute('viewBox',`0 0 ${layout.width} 220`);
  svg.append(svgEl('path',{d:`M 28 110 H ${layout.width-30}`,class:'trunk'}));
  for(const [i,node] of layout.nodes.entries()) {
    const {event,x,level,branchY,scanBoundary}=node;
    if(scanBoundary) {
      const context=scanContextLabel(event,state.overview.scans,state.cases), contextText=svgEl('text',{x,y:158,class:'scan-label'},context.text);
      contextText.append(svgEl('title',{},context.full+' · Scan '+(event.scan_id||'unknown')));
      svg.append(svgEl('line',{x1:x,y1:122,x2:x,y2:139,class:'scan-boundary'}),contextText,svgEl('text',{x,y:177,class:'axis-label'},time(event.ts)));
    }
    const group=svgEl('g',{class:'event-node '+level+(state.selected===event.id?' selected':''),role:'button',tabindex:state.selected===event.id||(!state.selected&&i===0)?0:-1,'aria-label':time(event.ts)+' '+eventLabel(event)+' '+event.detail,'aria-pressed':state.selected===event.id,'data-event':event.id});
    group.append(svgEl('circle',{cx:x,cy:110,r:12,class:'hit'}));
    if(level!=='normal') {
      const d=`M ${x} 110 C ${x+14} 110 ${x+14} ${branchY} ${x+32} ${branchY} H ${x+120}`;
      group.append(svgEl('path',{d,class:'hit-line',fill:'none',stroke:'transparent','stroke-width':14,'pointer-events':'stroke'}),svgEl('path',{d,class:'branch'}));
      group.append(svgEl('circle',{cx:x+120,cy:branchY,r:12,class:'hit'}));
      group.append(svgEl('circle',{cx:x+120,cy:branchY,r:3,class:'branch-dot'}));
      const severity=event.severity||'medium';
      group.append(svgEl('text',{x:x+32,y:branchY-13,class:'event-label'},event.kind==='SCAN_FAILED'?'Scan failed':severity[0].toUpperCase()+severity.slice(1)+' finding'));
    }
    group.append(svgEl('circle',{cx:x,cy:110,r:scanBoundary?4:3,class:'dot'}));
    group.addEventListener('click',()=>inspectEvent(event));
    group.addEventListener('pointerenter',()=>showEventTooltip(event,group));
    group.addEventListener('pointerleave',postponeTooltipHide);
    group.addEventListener('focus',()=>{if(!restoringEventFocus)showEventTooltip(event,group);});
    group.addEventListener('blur',postponeTooltipHide);
    group.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();inspectEvent(event);}
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
        e.preventDefault();const next=layout.nodes[i+(e.key==='ArrowLeft'?-1:1)];
        if(next)inspectEvent(next.event,{reveal:true,focus:true});
      }
    });
    svg.append(group);
  }
  const selectedNode=layout.nodes.find(node=>node.event.id===state.selected);
  scroller.scrollLeft=initial&&selectedNode?Math.max(0,selectedNode.x-scroller.clientWidth*.35):wasAtEnd&&!state.selected?scroller.scrollWidth:oldLeft;
  $('event-list').replaceChildren();
  for(const event of [...events].reverse().slice(0,100)) {
    const row=el('tr','event-row');row.dataset.event=event.id;
    cell(row,time(event.ts),'mono muted');
    const select=el('button','text-button event-log-button',eventLabel(event));select.type='button';select.setAttribute('aria-label','Inspect '+eventLabel(event)+' at '+time(event.ts));cell(row).append(select);
    cell(row,event.detail,'muted');cell(row,event.scan_id?.slice(0,8)||'Unavailable','mono muted');
    row.addEventListener('click',()=>inspectEvent(event,{reveal:true}));
    $('event-list').append(row);
  }
  updateEventSelection();renderInspector(selected);updateTimelineWindow();
  if(controlsChanged&&selected)revealEvent(selected.id,'auto');
  if(restoreFocus) {
    const target=restoreFocus.type==='node'?svg.querySelector(`[data-event="${restoreFocus.id}"]`):$('event-list').querySelector(`[data-event="${restoreFocus.id}"] .event-log-button`);
    // Polling preserves keyboard focus without reopening a dismissed preview.
    restoringEventFocus=true;
    try {target?.focus({preventScroll:true});} finally {restoringEventFocus=false;}
  }
}
function renderStatus() {
  const stats=dashboardStats(state.overview);
  for(const key of ['scans','active','failed','runtime'])if($('stat-'+key))$('stat-'+key).textContent=stats[key];
  if($('stat-runtime'))$('stat-runtime').title=stats.runtimeTitle;
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
    renderAlerts();renderScans();renderEvents();renderStatus();renderDeliveries();notifyNewAlerts();state.ready=true;
    $('connection').textContent='Connected';
  }finally{refreshing=false;}
}
$('scan-form').addEventListener('submit',async e=>{e.preventDefault();$('run-scan').disabled=true;try{await api('/scans',{scenario:$('scenario').value,runtime:$('runtime').value,assessor:$('assessor').value});error('');await refresh();}catch(err){error(err.message);$('run-scan').disabled=false;}});
for(const id of ['alert-filter','severity-filter'])$(id).addEventListener('change',renderAlerts);
$('alert-search').addEventListener('input',renderAlerts);$('scan-filter').addEventListener('change',renderScans);
for(const id of ['event-filter','zoom'])$(id).addEventListener('change',renderEvents);
$('search').addEventListener('input',renderEvents);
$('latest').addEventListener('click',()=>{const latest=state.layout.nodes.at(-1);if(latest)inspectEvent(latest.event,{reveal:true});});
$('previous-event')?.addEventListener('click',()=>navigateEvent(-1));
$('next-event')?.addEventListener('click',()=>navigateEvent(1));
$('timeline-scroll').addEventListener('scroll',()=>{hideEventTooltip();updateTimelineWindow();},{passive:true});
$('event-tooltip')?.addEventListener('pointerenter',()=>clearTimeout(tooltipTimer));
$('event-tooltip')?.addEventListener('pointerleave',postponeTooltipHide);
document.addEventListener('keydown',event=>{if(event.key==='Escape')hideEventTooltip();});
document.addEventListener('pointerdown',event=>{if(!event.target.closest('.event-node, #event-tooltip'))hideEventTooltip();});
document.addEventListener('scroll',hideEventTooltip,{capture:true,passive:true});
window.addEventListener('resize',()=>{hideEventTooltip();if(state.selected)revealEvent(state.selected,'auto');updateTimelineWindow();});
$('close-dialog').addEventListener('click',()=>$('detail-dialog').close());
$('browser-notify').addEventListener('click',async()=>{
  if(!('Notification'in window)){error('Browser notifications unavailable');return;}
  state.notifications=await Notification.requestPermission()==='granted';$('browser-state').textContent=state.notifications?'Enabled':'Off';
});
const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){for(const link of document.querySelectorAll('nav a')){if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}
},{rootMargin:'-10% 0px -65% 0px'});
for(const section of document.querySelectorAll('main section[id]'))observer.observe(section);
try {
  const [config,cases]=await Promise.all([api('/config'),api('/scenarios')]);state.config=config;
  for(const c of cases){state.cases[c.id]=c.label;$('scenario').append(option(c.id,c.label));}
  $('scenario').value='poison';$('assessor').value=config.openrouter_ready?'openrouter':'demo';
  $('telegram-state').textContent=config.live_notifications&&config.telegram_ready?'Enabled':'Preview only';
  $('twilio-state').textContent=config.live_notifications&&config.twilio_ready?'Enabled':'Preview only';
  await refresh();
}catch(e){error(e.message);$('connection').textContent='Disconnected';}
setInterval(()=>refresh().catch(e=>{error(e.message);$('connection').textContent='Disconnected';}),2000);
