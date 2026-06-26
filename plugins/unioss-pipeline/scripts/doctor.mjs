#!/usr/bin/env node
// UNIOSS pipeline environment doctor — cross-platform (node/jq/docker/containers/token/MCP).
import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const isWin = platform() === 'win32';
const has = (cmd) => {
  try { execSync(isWin ? `where ${cmd}` : `command -v ${cmd}`, { stdio: 'ignore' }); return true; } catch { return false; }
};
const out = (cmd) => {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch { return ''; }
};

const pm = isWin
  ? (has('winget') ? 'winget' : has('choco') ? 'choco' : '')
  : platform() === 'darwin'
    ? (has('brew') ? 'brew' : '')
    : (has('apt-get') ? 'apt' : has('dnf') ? 'dnf' : has('pacman') ? 'pacman' : '');

const installCmd = (pkg) => ({
  brew: `brew install ${pkg}`,
  apt: `sudo apt-get update && sudo apt-get install -y ${pkg}`,
  dnf: `sudo dnf install -y ${pkg}`,
  pacman: `sudo pacman -S --noconfirm ${pkg}`,
  winget: `winget install ${pkg}`,
  choco: `choco install -y ${pkg}`,
}[pm] || `(install ${pkg} with your package manager)`);

const dockerOk = has('docker');
const names = dockerOk ? out('docker ps --format "{{.Names}}"') : '';

const checks = [
  { name: 'node', ok: has('node'), fix: installCmd('node'), light: true },
  { name: 'jq', ok: has('jq'), fix: installCmd('jq'), light: true },
  { name: 'docker', ok: dockerOk, fix: 'Install Docker: https://docs.docker.com/get-docker/' },
  { name: 'container mysql-unioss3', ok: /(^|\n)mysql-unioss3(\r?\n|$)/.test(names), fix: 'Start the unioss stack: docker compose up -d (from the unioss3 project root)' },
  { name: 'container php-unioss3', ok: /(^|\n)php-unioss3(\r?\n|$)/.test(names), fix: 'Start the unioss stack: docker compose up -d (from the unioss3 project root)' },
  { name: 'GITLAB_TOKEN', ok: !!process.env.GITLAB_TOKEN, fix: isWin ? 'setx GITLAB_TOKEN <your-token>' : 'export GITLAB_TOKEN=<your-token>  (add to your shell profile)' },
];

console.log('\nUNIOSS pipeline — environment check\n');
let allOk = true;
const lightMissing = [];
for (const c of checks) {
  console.log(`  [${c.ok ? 'OK' : 'XX'}] ${c.name}` + (c.ok ? '' : `\n        -> ${c.fix}`));
  if (!c.ok) { allOk = false; if (c.light) lightMissing.push(c.name); }
}
if (lightMissing.length && pm) {
  console.log(`\nLight deps install command:\n  ${lightMissing.map(installCmd).join('  &&  ')}`);
}
console.log(`\nPlaywright MCP ships with this plugin (npx @playwright/mcp@latest) — no manual install needed.\n`);
process.exit(allOk ? 0 : 1);
