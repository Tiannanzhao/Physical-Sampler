import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {installSkill} from '../packages/physical-sampler/install-skill.js';

test('skill install supplies a usable package source and preserves user changes on repeat', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sampler-skill-'));
  const source = path.resolve('packages/physical-sampler');
  const target = path.join(root, '.agents/skills/physical-sampler');
  try {
    assert.equal(installSkill(source, target).installed, true);
    assert.equal(fs.readFileSync(path.join(target, 'SKILL.md'), 'utf8'), fs.readFileSync(path.join(source, 'skills/physical-sampler/SKILL.md'), 'utf8'));
    const hint = JSON.parse(fs.readFileSync(path.join(target, 'references/package-source.json')));
    assert.equal(hint.packageRoot, fs.realpathSync(source));
    assert.equal(JSON.parse(fs.readFileSync(path.join(hint.packageRoot, 'package.json'))).name, 'physical-sampler');
    fs.writeFileSync(path.join(target, 'SKILL.md'), 'User customized instructions');
    assert.equal(installSkill(source, target).installed, false);
    assert.equal(fs.readFileSync(path.join(target, 'SKILL.md'), 'utf8'), 'User customized instructions');
  } finally {fs.rmSync(root, {recursive: true, force: true});}
});

test('global CLI respects CODEX_HOME and does not set up MCP or modify the project', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sampler-global-skill-'));
  const codex = path.join(root, 'codex');
  try {
    const result = spawnSync(process.execPath, [path.resolve('packages/physical-sampler/cli.js'), 'install-skill', '--global'], {cwd: root, env: {...process.env, CODEX_HOME: codex}, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.existsSync(path.join(codex, 'skills/physical-sampler/SKILL.md')));
    assert.equal(fs.existsSync(path.join(root, 'physical-sampler.config.json')), false);
    assert.equal(fs.existsSync(path.join(root, '.mcp.json')), false);
    const invalid = spawnSync(process.execPath, [path.resolve('packages/physical-sampler/cli.js'), 'install-skill', '--global', 'extra'], {cwd: root, env: {...process.env, CODEX_HOME: codex}, encoding: 'utf8'});
    assert.equal(invalid.status, 1);
  } finally {fs.rmSync(root, {recursive: true, force: true});}
});
