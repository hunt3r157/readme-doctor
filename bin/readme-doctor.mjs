#!/usr/bin/env node
// README Doctor — zero-dep CLI to score and fix README.md
// Node >= 18

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const cmd = (args[0] && !args[0].startsWith('-')) ? args[0] : 'check';

// parse flags
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : (/^\d+$/.test(v) ? Number(v) : v)];
  })
);

const cwd = process.cwd();
const configPath = path.join(cwd, 'readme-doctor.config.json');
const userCfg = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
const cfg = {
  path: 'README.md',
  minScore: 80,
  sections: {
    title: true, badges: true, install: true, quickstart: true, usage: true, config: true,
    ci: true, security: true, license: true, contributing: true, toc: true, roadmap: true, faq: true,
    altImages: true, links: true
  },
  ...userCfg
};

const readmePath = path.resolve(cwd, flags.path || cfg.path);
const exists = fs.existsSync(readmePath);
const text = exists ? fs.readFileSync(readmePath, 'utf8') : '';

if (cmd === 'check') {
  const report = scoreReadme(text, { path: readmePath, cfg });
  printReport(report);
  if (flags['fail-below'] !== undefined) {
    process.exit(report.score < Number(flags['fail-below']) ? 1 : 0);
  }
  if (cfg.minScore && flags['fail-below'] === undefined) {
    process.exit(report.score < cfg.minScore ? 1 : 0);
  }
  process.exit(0);
}

if (cmd === 'fix') {
  const report = scoreReadme(text, { path: readmePath, cfg });
  const updated = applyFixes(text, report.missing, readmePath);
  if (updated.changed) {
    fs.writeFileSync(readmePath, updated.text, 'utf8');
    console.log(`✓ Wrote updates to ${path.relative(cwd, readmePath)}`);
  } else {
    console.log('✓ No changes needed');
  }
  process.exit(0);
}

console.log(`README Doctor
Usage:
  npx readme-doctor check [--path README.md] [--fail-below 80]
  npx readme-doctor fix [--path README.md]
`);
process.exit(1);

// ---------- scoring ----------
function scoreReadme(md, { path: p, cfg }) {
  const s = { points: 0, max: 100, missing: [], hits: [] };

  const has = {
    title: /^#\s+\S+/m.test(md),
    tagline: /^>\s+.+/m.test(md),
    badges: /\[!\[.*?\]\(https?:\/\/img\.shields\.io\/.*?\)\]\(.*?\)/.test(md),
    install: /```[\s\S]*?(npm i|npx|pip|brew|go install)[\s\S]*?```/i.test(md),
    quickstart: /^##\s+Quick start/m.test(md),
    usage: /^##\s+Usage/m.test(md),
    config: /^##\s+Config(uration)?/mi.test(md),
    ci: /^##\s+CI|GitHub Action/mi.test(md),
    security: /SECURITY\.md/i.test(md) || /^##\s+Security/mi.test(md),
    license: /LICENSE|^##\s+License/mi.test(md),
    contributing: /CONTRIBUTING\.md/i.test(md) || /^##\s+Contributing/mi.test(md),
    toc: /^##\s+Table of contents/mi.test(md),
    roadmap: /^##\s+Roadmap/mi.test(md),
    faq: /^##\s+FAQ/mi.test(md),
    altImages: /!\[[^\]\n]+\]\(.*?\)/.test(md), // has alt text
    links: /\[[^\]]+\]\(https?:\/\/[^\)]+\)/.test(md)
  };

  // points map
  const pts = {
    title: 6, tagline: 4, badges: 10, install: 8, quickstart: 10, usage: 10, config: 8,
    ci: 5, security: 8, license: 5, contributing: 5, toc: 5, roadmap: 5, faq: 5, altImages: 6, links: 4
  };

  for (const [k, v] of Object.entries(has)) {
    if (!cfg.sections[k === 'tagline' ? 'title' : k] && k !== 'tagline') continue;
    if (v) { s.points += pts[k]; s.hits.push(k); }
    else s.missing.push(k);
  }

  s.points = Math.min(s.points, s.max);
  const score = s.points;
  return { score, hits: s.hits, missing: s.missing, path: p };
}

function printReport(r) {
  console.log(`README Doctor — score: ${r.score}/100`);
  if (r.hits.length) console.log(`✓ Present: ${r.hits.sort().join(', ')}`);
  if (r.missing.length) {
    console.log(`✗ Missing: ${r.missing.sort().join(', ')}`);
    console.log('Suggestions:');
    for (const k of r.missing) console.log(`• add-${k}`);
  }
}

// ---------- fix ----------
function applyFixes(md, missing, readmePath) {
  let out = md || '';
  const add = (section, content) => {
    const start = `<!-- readme-doctor:start:${section} -->`;
    const end = `<!-- readme-doctor:end:${section} -->`;
    if (out.includes(start)) return;
    out += `\n\n${start}\n${content.trim()}\n${end}\n`;
  };

  if (!/^#\s+/m.test(out)) {
    add('title', '# Project Title\n\n> One-liner explaining the value.\n');
  }
  if (missing.includes('badges')) {
    add('badges', `[![CI](https://img.shields.io/github/actions/workflow/status/<your-username>/<repo>/ci.yml?branch=main)](./actions)\n[![npm](https://img.shields.io/npm/v/<pkg>.svg)](https://www.npmjs.com/package/<pkg>)\n[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)`);
  }
  if (missing.includes('toc')) {
    add('toc', '## Table of contents\n- [Overview](#overview)\n- [Quick start](#quick-start)\n- [Usage](#usage)\n- [Configuration](#configuration)\n- [CI](#ci)\n- [Security](#security)\n- [License](#license)\n- [Contributing](#contributing)');
  }
  if (missing.includes('install') || missing.includes('quickstart')) {
    add('quickstart', '## Quick start\n```bash\nnpx your-tool init\n```\n');
  }
  if (missing.includes('usage')) {
    add('usage', '## Usage\n```bash\nyour-tool do-thing --flag value\n```');
  }
  if (missing.includes('config')) {
    add('configuration', '## Configuration\nCreate `tool.config.json` and set options.\n');
  }
  if (missing.includes('ci')) {
    add('ci', '## CI\nMinimal GitHub Action:\n```yaml\nname: Tool CI\non: [push, pull_request]\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npx your-tool check\n```');
  }
  if (missing.includes('security')) {
    add('security', '## Security\nSee [SECURITY.md](SECURITY.md) for reporting vulnerabilities.');
  }
  if (missing.includes('license')) {
    add('license', '## License\nMIT © Your Org');
  }
  if (missing.includes('contributing')) {
    add('contributing', '## Contributing\nSee [CONTRIBUTING.md](CONTRIBUTING.md).');
  }
  if (missing.includes('roadmap')) {
    add('roadmap', '## Roadmap\n- [ ] Next feature\n- [ ] Your idea here');
  }
  if (missing.includes('faq')) {
    add('faq', '## FAQ\n**Q:** Common question?\n**A:** Helpful answer.');
  }

  const changed = out !== md;
  return { changed, text: out };
}
