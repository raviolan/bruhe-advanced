import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/components/bootTimeline.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { bootSnapshot } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('boot stages follow the configured duration and finish with an exit window', () => {
  for (const duration of [2000, 3800, 5000]) {
    assert.equal(bootSnapshot(0, duration).stage, 'cold');
    assert.equal(bootSnapshot(duration * .2, duration).stage, 'diagnostics');
    assert.equal(bootSnapshot(duration * .54, duration).stage, 'sync');
    assert.equal(bootSnapshot(duration * .86, duration).stage, 'online');
    assert.equal(bootSnapshot(duration * .97, duration).exiting, true);
    assert.equal(bootSnapshot(duration * 2, duration).progress, 1);
    assert.equal(bootSnapshot(-100, duration).progress, 0);
  }
});
test('diagnostics complete before sync; sync rolls back once then recovers to 100%', () => {
  const duration = 3800;
  assert.equal(bootSnapshot(duration * .529, duration).diagnosticCount, 10);
  const sample = fraction => bootSnapshot(duration * (.53 + .32 * fraction), duration).percent;
  assert.ok(sample(.5) > sample(.64));
  assert.ok(sample(.9) > sample(.65));
  assert.equal(sample(1), 100);
  for(let time = 0; time <= duration; time += 10) {
    const snapshot = bootSnapshot(time, duration);
    assert.ok(snapshot.percent >= 0 && snapshot.percent <= 100);
  }
});
