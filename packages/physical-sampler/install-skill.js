import fs from 'node:fs';
import path from 'node:path';

export const skillAgents = {
  codex: {name: 'Codex', project: '.agents', personal: '.codex', invoke: '$physical-sampler'},
  claude: {name: 'Claude Code', project: '.claude', personal: '.claude', invoke: '/physical-sampler'},
  cursor: {name: 'Cursor', project: '.cursor', personal: '.cursor', invoke: '/physical-sampler'},
  copilot: {name: 'GitHub Copilot CLI', project: '.github', personal: '.copilot', invoke: 'Use Physical Sampler to tune this component.'},
};

export function skillInstallOptions(args, {cwd, home, codexHome}) {
  let agent = 'codex', global = false, project;
  const seen = new Set();
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--global') {
      if (seen.has(arg)) throw Error('Duplicate --global flag');
      seen.add(arg); global = true;
    } else if (arg === '--agent') {
      if (seen.has(arg) || !args[i + 1] || args[i + 1].startsWith('-')) throw Error('Provide one --agent: codex, claude, cursor or copilot');
      seen.add(arg); agent = args[++i];
    } else if (arg.startsWith('-')) throw Error(`Unknown option: ${arg}`);
    else if (project !== undefined) throw Error('Provide only one project folder');
    else project = arg;
  }
  if (!Object.hasOwn(skillAgents, agent)) throw Error('Supported agents: codex, claude, cursor, copilot');
  if (global && project !== undefined) throw Error('Use --global without a project folder');
  const target = skillAgents[agent];
  const directory = global
    ? (agent === 'codex' && codexHome ? path.resolve(codexHome) : path.join(home, target.personal))
    : path.join(path.resolve(cwd, project || '.'), target.project);
  return {agent, ...target, destination: path.join(directory, 'skills', 'physical-sampler')};
}

export function installSkill(packageRoot, destination) {
  const source = path.join(packageRoot, 'skills', 'physical-sampler');
  // Never replace an existing skill, including a dangling symlink.
  try {
    fs.lstatSync(destination);
    return {installed: false, destination};
  } catch (error) {if (error.code !== 'ENOENT') throw error;}
  fs.mkdirSync(path.dirname(destination), {recursive: true});
  const temporary = fs.mkdtempSync(path.join(path.dirname(destination), '.physical-sampler-'));
  try {
    fs.cpSync(source, temporary, {recursive: true});
    fs.mkdirSync(path.join(temporary, 'references'), {recursive: true});
    fs.writeFileSync(path.join(temporary, 'references', 'package-source.json'), JSON.stringify({packageRoot: fs.realpathSync(packageRoot)}, null, 2) + '\n');
    fs.renameSync(temporary, destination);
  } catch (error) {fs.rmSync(temporary, {recursive: true, force: true}); throw error;}
  return {installed: true, destination};
}
