import test from 'node:test';
import assert from 'node:assert/strict';
import {timelineLayout, eventLevel, preferredEvent, tooltipPosition, dashboardStats, scanContextLabel} from '../web/timeline.js';

test('timeline branches come from actual findings, not metadata drift', () => {
  assert.equal(eventLevel({kind:'METADATA_OBSERVED', severity:'high'}), 'normal');
  assert.equal(eventLevel({kind:'AGENT_FLAGGED', severity:'medium'}), 'warning');
  assert.equal(eventLevel({kind:'AGENT_FLAGGED', severity:'critical'}), 'emergency');
  assert.equal(eventLevel({kind:'SCAN_FAILED', severity:'high'}), 'warning');
});
test('chronological event order, zoom and empty history are supported', () => {
  const events = [{id:9, kind:'AGENT_FLAGGED', severity:'high'}, {id:2, kind:'SCAN_STARTED'}];
  const normal = timelineLayout(events,30), zoomed = timelineLayout(events,60);
  assert.deepEqual(normal.nodes.map(n => n.event.id), [2,9]);
  assert.ok(zoomed.nodes[1].x > normal.nodes[1].x);
  assert.equal(normal.nodes[1].level,'emergency');
  assert.deepEqual(timelineLayout([]).nodes,[]);
});

test('scan boundaries and branch spacing keep event targets separate', () => {
  const events = [
    {id:1, scan_id:'a', kind:'SCAN_STARTED'},
    {id:2, scan_id:'a', kind:'TOOL_TEST'},
    {id:3, scan_id:'a', kind:'AGENT_FLAGGED', severity:'high'},
    {id:4, scan_id:'a', kind:'ALERT_OPENED'},
    {id:5, scan_id:'b', kind:'SCAN_STARTED'},
  ];
  const {nodes} = timelineLayout(events,1);
  assert.deepEqual(nodes.map(node=>node.scanBoundary),[true,false,false,false,true]);
  assert.ok(nodes[1].x-nodes[0].x>=26,'24px dot targets do not overlap');
  assert.ok(nodes[3].x-nodes[2].x>=166,'finding branch fits before the next event');
  assert.ok(nodes[4].x-nodes[3].x>26,'a new scan has visible separation');
  assert.ok(timelineLayout(events,NaN).nodes.every(node=>Number.isFinite(node.x)));
});

test('initial inspection prefers a finding and preserves explicit selection as events arrive', () => {
  const events = [{id:1,kind:'AGENT_FLAGGED'}, {id:2,kind:'SCAN_COMPLETED'}, {id:3,kind:'SCAN_STARTED'}];
  assert.equal(preferredEvent(events).id,1);
  assert.equal(preferredEvent([...events,{id:4,kind:'AGENT_FLAGGED'}],2).id,2);
  assert.equal(preferredEvent(events.filter(event=>event.kind!=='AGENT_FLAGGED'),1).id,2);
  assert.equal(preferredEvent([{id:8,kind:'TOOL_TEST'}]).id,8);
  assert.equal(preferredEvent([]),null);
});

test('interleaved alert lifecycle events keep adjacent scan context labels separated', () => {
  const events = [
    {id:1,scan_id:'current',kind:'SCAN_STARTED'},
    {id:2,scan_id:'current',kind:'TOOL_TEST'},
    {id:3,scan_id:'older',kind:'ALERT_RESOLVED'},
    {id:4,scan_id:'current',kind:'AGENT_FLAGGED',severity:'high'},
    {id:5,scan_id:'older',kind:'ALERT_ACKNOWLEDGED'},
  ];
  for(const spacing of [26,30,50,80]) {
    const layout=timelineLayout(events,spacing), contexts=layout.nodes.filter(node=>node.scanBoundary);
    assert.deepEqual(layout.nodes.map(node=>node.event.id),[1,2,3,4,5]);
    assert.deepEqual(contexts.map(node=>node.event.id),[1,3,4,5]);
    for(let index=1;index<contexts.length;index++)assert.ok(contexts[index].x-contexts[index-1].x>=160);
    assert.ok(layout.nodes[4].x-layout.nodes[3].x>=166,'branch targets still fit');
    assert.ok(layout.width-contexts.at(-1).x>=160,'last context label stays within the SVG');
  }
});

test('scan context uses a compact human test case label with an ID fallback', () => {
  const scans=[{id:'known-123456789',scenario:'benign'}];
  const named=scanContextLabel({scan_id:'known-123456789'},scans,{benign:'Harmless instruction clarification'});
  assert.equal(named.full,'Harmless instruction clarification');
  assert.ok(named.text.length<=24);
  assert.ok(named.text.endsWith('…'));
  assert.deepEqual(scanContextLabel({scan_id:'unlisted-123456'},scans,{}),{text:'Scan unlisted',full:'Scan unlisted'});
});

test('tooltip positions stay inside the viewport near chart edges', () => {
  const left = tooltipPosition({left:0,width:20,top:5,bottom:25},320,140,390,700);
  assert.deepEqual(left,{left:12,top:35});
  const right = tooltipPosition({left:370,width:20,top:680,bottom:700},320,140,390,700);
  assert.equal(right.left,58);
  assert.equal(right.top,530);
  const short = tooltipPosition({left:100,width:20,top:100,bottom:120},200,250,500,300);
  assert.ok(short.top>=12&&short.top+250<=288);
});

test('status counts and provenance come from actual overview records', () => {
  const stats = dashboardStats({stats:{scans:3},scans:[
    {id:'old',created_at:'2026-09-12',runtime:'demo',status:'completed'},
    {id:'new',created_at:'2026-09-13',runtime:'wasmer',status:'completed',result:{provenance:'openrouter:actual-model'}},
    {id:'failed',created_at:'2026-09-11',runtime:'wasmer',status:'failed'},
  ],alerts:[{status:'open'},{status:'acknowledged'},{status:'resolved'}]});
  assert.deepEqual(stats,{scans:3,active:2,failed:1,runtime:'Wasmer',runtimeTitle:'Wasmer · openrouter:actual-model'});
  assert.deepEqual(dashboardStats({}),{scans:0,active:0,failed:0,runtime:'No scans yet',runtimeTitle:'No scans yet'});
});
