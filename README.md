# README Doctor

> Make your repo look **enterprise-ready** in minutes. A tiny CLI + GitHub Action that **lints and auto-fixes README.md**: badges, quick start, usage, config, CI, security, license, and more.

[![CI](https://img.shields.io/github/actions/workflow/status/hunt3r157/readme-doctor/ci.yml?branch=main)](https://github.com/hunt3r157/readme-doctor/actions)
[![Release](https://img.shields.io/github/actions/workflow/status/hunt3r157/readme-doctor/release.yml?label=release)](https://github.com/hunt3r157/readme-doctor/actions)
[![npm](https://img.shields.io/npm/v/readme-doctor.svg)](https://www.npmjs.com/package/readme-doctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of contents
- [Overview](#overview)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [CI](#ci)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Roadmap](#roadmap)
- [FAQ](#faq)

---

## Overview
`readme-doctor` scores your README on the sections teams expect (badges, quick start, usage, config, CI, security, contributing, license, ToC, roadmap, FAQ), prints suggestions, and can **auto-append** missing sections in a safe, idempotent way.

---

## Quick start

### CLI
```bash
# check (no changes)
npx readme-doctor check

# fail CI if score below 80
npx readme-doctor check --fail-below 80

# write missing sections (idempotent, adds markers)
npx readme-doctor fix
```

### GitHub Action
```yaml
name: README Doctor
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx readme-doctor check --fail-below 80
```

---

## Usage
Run against the README in the current repo (defaults to `README.md`):

```bash
# Basic check
npx readme-doctor check

# Specify a different file
npx readme-doctor check --path DOCS.md

# Enforce minimum score (non-zero exit if below)
npx readme-doctor check --fail-below 90

# Auto-append missing sections between markers (no overwrite)
npx readme-doctor fix
```

What gets added on `fix`:
- Sections are appended between markers like:  
  `<!-- readme-doctor:start:SECTION --> … <!-- readme-doctor:end:SECTION -->`
- Re-running `fix` won’t duplicate sections.

---

## Configuration
Create `readme-doctor.config.json` in the repo root (all fields optional):

```json
{
  "path": "README.md",
  "minScore": 80,
  "sections": {
    "title": true,
    "badges": true,
    "install": true,
    "quickstart": true,
    "usage": true,
    "config": true,
    "ci": true,
    "security": true,
    "license": true,
    "contributing": true,
    "toc": true,
    "roadmap": true,
    "faq": true,
    "altImages": true,
    "links": true
  }
}
```

---

## CI
This repo includes a minimal CI workflow that runs the doctor on pushes/PRs:

```yaml
name: readme-doctor CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx readme-doctor check --fail-below 80
```

**Tip:** make this check **Required** on your protected branches.

---

## Security
See [SECURITY.md](SECURITY.md) for how to report vulnerabilities. No telemetry and no network calls: the CLI only reads your README and optional config.

---

## Contributing
Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) and follow the zero-dependency guideline (Node ≥ 18). If you add checks, document the scoring and include a template for `fix`.

---

## License
MIT © README Doctor contributors

---

## Roadmap
- [ ] Score badge endpoint (shields-style) to display README score
- [ ] Link checker with per-section hints
- [ ] Language-specific install snippets (npm/pip/brew/go)
- [ ] Optional auto-generate ToC

---

## FAQ
**Does it overwrite my README?**  
No. `check` is read-only. `fix` appends curated sections at the end between markers and won’t duplicate content.

**Can I disable sections?**  
Yes—set `sections.<name>` to `false` in `readme-doctor.config.json`.

**Why fail in CI?**  
Docs are part of DX. A threshold prevents regressions and keeps repos adoption-ready.

**How do I add it quickly to any repo?**  
Add the CI step above and run `npx readme-doctor fix` once locally to scaffold missing sections.
