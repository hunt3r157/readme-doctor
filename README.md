# README Doctor

> Make your repo look **enterprise-ready** in minutes. A tiny CLI + GitHub Action that **lints and auto-fixes README.md**: badges, quick start, install one-liner, config, CI, security, license, and more.

[![CI](https://img.shields.io/github/actions/workflow/status/hunt3r157/readme-doctor/ci.yml?branch=main)](https://github.com/hunt3r157/readme-doctor/actions)
[![Release](https://img.shields.io/github/actions/workflow/status/hunt3r157/readme-doctor/release.yml?label=release)](https://github.com/hunt3r157/readme-doctor/actions)
[![npm](https://img.shields.io/npm/v/readme-doctor.svg)](https://www.npmjs.com/package/readme-doctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What it does
- **Scores** your README across key sections (title, badges, one-liner install, quick start, usage, config, CI, security, contributing, license, FAQ, roadmap, ToC)
- **Prints suggestions** with copy‑ready snippets
- **Auto‑fixes** missing sections (appends curated templates) — opt‑in
- Ships a **GitHub Action** for PRs to enforce a minimum score

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
Use the built-in workflow or this minimal job:

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

## Scoring rubric (100 pts)
- Title + tagline (10)
- Badges (CI/npm/license/node) (10)
- One-liner install (8)
- Quick start (10)
- Usage (10)
- Configuration (8)
- CI integration (5)
- Security/SECURITY.md (8)
- License (5)
- Contributing (5)
- ToC (5)
- Roadmap (5)
- FAQ (5)
- Images with alt text (6)
- Links sanity (5) — basic checks

## Output example
```
README Doctor — score: 82/100  (pass ≥ 80)
✓ Title/tagline
✗ Missing badges (CI, npm) — see: add-badges
✗ No Quick start section — see: add-quickstart
…
Suggestions:
• add-badges — add shields for CI/npm/license
• add-quickstart — add code block with install + first command
• add-security — link SECURITY.md and contact
```

## Auto-fix behavior
- Appends missing sections at the end of README between markers:
  - `<!-- readme-doctor:start:SECTION -->` … `<!-- readme-doctor:end:SECTION -->`
- Idempotent: re-running won’t duplicate sections.
- Won’t overwrite your custom content.

## Config (optional)
Create `readme-doctor.config.json`:
```json
{
  "path": "README.md",
  "minScore": 80,
  "sections": { "faq": true, "roadmap": true }
}
```

## Local dev
```bash
pnpm i  # or npm i
node bin/readme-doctor.mjs check
```

## License
MIT © README Doctor contributors


<!-- readme-doctor:start:toc -->
## Table of contents
- [Overview](#overview)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [CI](#ci)
- [Security](#security)
- [License](#license)
- [Contributing](#contributing)
<!-- readme-doctor:end:toc -->


<!-- readme-doctor:start:usage -->
## Usage
```bash
your-tool do-thing --flag value
```
<!-- readme-doctor:end:usage -->


<!-- readme-doctor:start:contributing -->
## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md).
<!-- readme-doctor:end:contributing -->


<!-- readme-doctor:start:roadmap -->
## Roadmap
- [ ] Next feature
- [ ] Your idea here
<!-- readme-doctor:end:roadmap -->


<!-- readme-doctor:start:faq -->
## FAQ
**Q:** Common question?
**A:** Helpful answer.
<!-- readme-doctor:end:faq -->
