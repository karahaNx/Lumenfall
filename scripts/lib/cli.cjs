'use strict';
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

function parseArgs(argv, values = [], flags = []) {
  const result = { positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i];
    if (flags.includes(name)) result[name.slice(2)] = true;
    else if (values.includes(name)) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error('Missing value: ' + name);
      result[name.slice(2)] = argv[++i];
    } else if (name.startsWith('-')) throw Error('Unknown option: ' + name);
    else result.positional.push(name);
  }
  return result;
}
function resolvePath(value) {
  let ancestor = path.resolve(value);
  const suffix = [];
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    suffix.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  return path.join(fs.realpathSync(ancestor), ...suffix);
}
function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}
function inside(root, relative, boundary = root) {
  const target = resolvePath(path.resolve(root, relative));
  if (!isInside(resolvePath(boundary), target)) throw Error('Unsafe path: ' + relative);
  return target;
}
function hash(data, algorithm = 'sha256') { return crypto.createHash(algorithm).update(data).digest('hex'); }
function checkHash(data, row, label) {
  if (data.length !== row.bytes || hash(data) !== row.sha256) throw Error('Integrity mismatch: ' + label);
}
function json(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function emptyDestination(destination) {
  if (fs.existsSync(destination) && (!fs.statSync(destination).isDirectory() || fs.readdirSync(destination).length)) {
    throw Error('Destination must be new or empty: ' + destination);
  }
}
function main(fn) {
  Promise.resolve().then(fn).catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { parseArgs, resolvePath, isInside, inside, hash, checkHash, json, emptyDestination, main };
