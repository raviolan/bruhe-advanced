import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractionPlan } from './extract-frames.mjs';
test('sampling covers one full turn without duplicate endpoints', () => {
  const plan = extractionPlan(18,36);
  assert.equal(plan.length,36);
  assert.equal(plan[0].time,.25);
  assert.equal(plan.at(-1).time,17.75);
  assert.equal(plan[0].name,'frame-001.png');
  assert.equal(plan.at(-1).name,'frame-036.png');
  assert.ok(plan.every((f,i) => i===0 || Math.abs(f.time-plan[i-1].time-.5)<1e-9));
});
test('all supported frame counts and invalid inputs', () => {
  for(const count of [24,36,48]) assert.equal(extractionPlan(10,count).length,count);
  for(const args of [[0],[-1],[NaN],[10,12],[10,36,10]]) assert.throws(() => extractionPlan(...args));
});
