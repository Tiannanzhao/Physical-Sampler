import test from 'node:test';
import assert from 'node:assert/strict';
import {defineControls, register, getSnapshot, valuesFor, setParameter, reset, replay} from '../packages/physical-sampler/controls.js';

test('inline controls share updates, validate values and restore defaults after reset or last unmount', () => {
  const c = defineControls('testCard', {radius: [18, 0, 48], color: '#d0ec5c', enabled: false, easing: {type: 'select', value: 'linear', options: ['linear', 'ease-out']}});
  const a = register(c), b = register(c);
  try {
    setParameter(c.id, 'radius', 32);
    setParameter(c.id, 'enabled', true);
    assert.equal(valuesFor(c).radius, 32);
    assert.equal(valuesFor(c).enabled, true);
    assert.throws(() => setParameter(c.id, 'radius', 49));
    assert.throws(() => setParameter(c.id, 'enabled', 'true'));
    assert.throws(() => setParameter(c.id, 'easing', 'unknown'));
    assert.throws(() => register(defineControls(c.id, {radius: [20, 0, 48]})), /Conflicting/);
    replay(c.id);
    assert.equal(getSnapshot().replays[c.id], 1);
    reset(c.id);
    assert.equal(valuesFor(c).radius, 18);
    setParameter(c.id, 'radius', 40);
    a();
    assert.equal(valuesFor(c).radius, 40);
  } finally {b();}
  assert.equal(getSnapshot().components.length, 0);
  assert.equal(valuesFor(c).radius, 18);
  assert.equal(getSnapshot().replays[c.id], undefined);
});

test('invalid defaults fail before registration', () => {
  assert.throws(() => defineControls('invalid', {radius: [99, 0, 48]}), /Invalid default/);
  assert.throws(() => defineControls('invalid', {radius: [18, 0, 48, 0]}), /Invalid range/);
  assert.throws(() => defineControls('invalid', {color: 'purple'}), /Invalid default/);
});
