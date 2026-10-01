import fs from 'node:fs';
import path from 'node:path';

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
