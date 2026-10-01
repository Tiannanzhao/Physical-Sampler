const listeners = new Set();
let state = {components: [], drafts: {}, replays: {}};
const owners = new Map();
const safeKey = key => typeof key === 'string' && /^[a-zA-Z][\w-]{0,63}$/.test(key) && !['constructor', 'prototype', '__proto__'].includes(key);
export const subscribe = listener => {listeners.add(listener); return () => listeners.delete(listener);};
export const getSnapshot = () => state;
function update(next) {state = {...state, ...next}; listeners.forEach(listener => listener());}
export function defineControls(id, controls, label = id) {
  if (!safeKey(id)) throw Error('Use a stable component ID: letters, numbers, underscores or hyphens.');
  if (!controls || Array.isArray(controls) || typeof controls !== 'object') throw Error('Define controls as an object.');
  const parameters = Object.entries(controls).map(([key, control]) => {
    if (!safeKey(key)) throw Error(`Invalid control ID: ${key}`);
    let p;
    if (Array.isArray(control)) {
      const [value, min, max, step = 1] = control;
      p = {type: 'number', value, min, max, step};
    } else if (typeof control === 'boolean') p = {type: 'boolean', value: control};
    else if (typeof control === 'string') p = {type: 'color', value: control};
    else if (control && typeof control === 'object') p = {...control};
    else throw Error(`Define ${key} with [default, min, max, step] or an explicit control.`);
    p.id = key; p.label ||= key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
    if (!['number', 'boolean', 'select', 'color'].includes(p.type)) throw Error(`Unsupported control: ${key}`);
    if (p.type === 'number' && (!Number.isFinite(p.min) || !Number.isFinite(p.max) || p.min > p.max || !Number.isFinite(p.step) || p.step <= 0)) throw Error(`Invalid range: ${key}`);
    if (p.type === 'select' && (!Array.isArray(p.options) || !p.options.length || !p.options.every(v => typeof v === 'string'))) throw Error(`Invalid options: ${key}`);
    if (!valid(p, p.value)) throw Error(`Invalid default: ${key}`);
    return p;
  });
  return {id, label, parameters};
}
function valid(p, value) {
  if (p.type === 'number') return Number.isFinite(value) && value >= p.min && value <= p.max;
  if (p.type === 'boolean') return typeof value === 'boolean';
  if (p.type === 'color') return typeof value === 'string' && /^#[a-f\d]{6}$/i.test(value);
  return p.options.includes(value);
}
export function register(component) {
  const previous = state.components.find(c => c.id === component.id);
  if (previous && JSON.stringify(previous) !== JSON.stringify(component) && owners.get(component.id)) throw Error(`Conflicting controls for ${component.id}. Use a different ID.`);
  owners.set(component.id, (owners.get(component.id) || 0) + 1);
  if (!previous) update({components: [...state.components, component]});
  return () => {
    const count = owners.get(component.id) - 1;
    if (count) {owners.set(component.id, count); return;}
    owners.delete(component.id);
    const drafts = {...state.drafts}, replays = {...state.replays};
    delete drafts[component.id]; delete replays[component.id];
    update({components: state.components.filter(c => c.id !== component.id), drafts, replays});
  };
}
export function valuesFor(component, snapshot = state) {
  return Object.fromEntries(component.parameters.map(p => [p.id, snapshot.drafts[component.id]?.[p.id] ?? p.value]));
}
export function setParameter(id, key, value) {
  const p = state.components.find(c => c.id === id)?.parameters.find(p => p.id === key);
  if (!p || !valid(p, value)) throw Error('Invalid parameter value');
  update({drafts: {...state.drafts, [id]: {...state.drafts[id], [key]: value}}});
}
export function reset(id) {const drafts = {...state.drafts}; delete drafts[id]; update({drafts});}
export function replay(id) {update({replays: {...state.replays, [id]: (state.replays[id] || 0) + 1}});}
