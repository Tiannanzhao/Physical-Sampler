import React, {useEffect, useMemo, useState, useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {defineControls, register, subscribe, getSnapshot, valuesFor, setParameter, reset, replay} from './controls.js';
import './sampler.css';

export function usePhysicalSampler(id, controls, options = {}) {
  const definition = JSON.stringify({id, controls, label: options.label || id});
  const component = useMemo(() => {
    const {id, controls, label} = JSON.parse(definition);
    return defineControls(id, controls, label);
  }, [definition]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => register(component), [component]);
  return {values: valuesFor(component, snapshot), replay: snapshot.replays[id] || 0, attributes: {'data-sampler-id': id}};
}

export function SamplerRoot({defaultOpen = false, productionEnabled = false}) {
  const production = import.meta.env?.PROD ?? (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');
  const enabled = !production || productionEnabled;
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [open, setOpen] = useState(defaultOpen), [selected, setSelected] = useState(''), [picking, setPicking] = useState(false), [status, setStatus] = useState('');
  const component = snapshot.components.find(c => c.id === selected) || snapshot.components[0];
  useEffect(() => {
    if (!enabled) return;
    function key(e) {
      if (e.altKey && e.shiftKey && e.code === 'KeyP') {e.preventDefault(); setOpen(v => !v);}
      if (e.key === 'Escape') {setOpen(false); setPicking(false);}
    }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [enabled]);
  useEffect(() => {
    if (!enabled || !open || !picking) return;
    function click(e) {
      const target = e.target.closest?.('[data-sampler-id]');
      if (!target || !snapshot.components.some(c => c.id === target.dataset.samplerId)) return;
      e.preventDefault(); e.stopPropagation(); setSelected(target.dataset.samplerId); setPicking(false);
    }
    document.addEventListener('click', click, true);
    return () => document.removeEventListener('click', click, true);
  }, [enabled, open, picking, snapshot.components]);
  if (!enabled || typeof document === 'undefined') return null;
  const values = component ? valuesFor(component, snapshot) : {};
  async function copy() {
    try {
      await navigator.clipboard.writeText(`Apply these Physical Sampler values to the defaults for component ${component.id}:\n${JSON.stringify(values, null, 2)}`);
      setStatus('Copied. Give these values to your coding agent to save in code.');
    } catch {setStatus('Copy unavailable. Use Download values instead.');}
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({id: component.id, values}, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = `${component.id}-sampler.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Values downloaded. Ask your coding agent to apply them to the component defaults.');
  }
  function close() {setOpen(false); setPicking(false);}
  return createPortal(<div className={`ps-root ${open && picking ? 'ps-picking' : ''}`}>
    <button className="ps-launch" aria-expanded={open} onClick={() => {if(open) close(); else setOpen(true);}}>Physical Sampler <span>⌥ ⇧ P</span></button>
    {open && <aside className="ps-panel" aria-label="Physical Sampler controls">
      <header><strong>Physical Sampler</strong><button aria-label="Close panel" onClick={close}>×</button></header>
      <p className="ps-status" role="status">{status || 'Tune here. Copy your chosen values back into code.'}</p>
      {!component ? <p>Ask your coding agent to add controls to a component using usePhysicalSampler.</p> : <>
        <button className="ps-pick" onClick={() => setPicking(v => !v)}>{picking ? 'Click a registered component · Esc to cancel' : 'Select on page'}</button>
        <label>Component<select aria-label="Component" value={component.id} onChange={e => {setSelected(e.target.value); setStatus('');}}>{snapshot.components.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
        {component.parameters.map(p => <label className="ps-control" key={p.id}>
          <span>{p.label}<output>{p.type === 'number' ? `${values[p.id]} ${p.unit || ''}` : ''}</output></span>
          {p.type === 'select' ? <select aria-label={p.label} value={values[p.id]} onChange={e => setParameter(component.id, p.id, e.target.value)}>{p.options.map(v => <option key={v}>{v}</option>)}</select> : <input aria-label={p.label} type={p.type === 'number' ? 'range' : p.type === 'boolean' ? 'checkbox' : 'color'} min={p.min} max={p.max} step={p.step} checked={p.type === 'boolean' ? values[p.id] : undefined} value={p.type === 'boolean' ? undefined : values[p.id]} onChange={e => setParameter(component.id, p.id, p.type === 'number' ? Number(e.target.value) : p.type === 'boolean' ? e.target.checked : e.target.value)}/>}
        </label>)}
        <div className="ps-actions"><button onClick={() => replay(component.id)}>Replay</button><button onClick={() => {reset(component.id); setStatus('Restored component defaults.');}}>Reset</button></div>
        <button className="ps-apply" onClick={copy}>Copy values for agent</button><button onClick={download}>Download values</button>
        <details><summary>Add a new behavior</summary><p>Ask your coding agent to implement the behavior and bind its parameters to usePhysicalSampler. Then tune it here.</p></details>
      </>}
    </aside>}
  </div>, document.body);
}
