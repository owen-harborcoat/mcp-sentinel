import test from 'node:test';
import assert from 'node:assert/strict';
import {timelineLayout, eventLevel} from '../web/timeline.js';

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
