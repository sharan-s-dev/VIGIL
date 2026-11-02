# VIGIL — A Local-First Memory Archive for Stories That Outlive the Cloud

> **The cloud is not the only place a memory can live.**

[![Live demo](https://img.shields.io/badge/live_demo-open-a9ba8b?style=flat-square&labelColor=101514)](https://sharan-s-dev.github.io/VIGIL/)
[![CI](https://img.shields.io/github/actions/workflow/status/sharan-s-dev/VIGIL/pages.yml?label=CI%20%2F%20Pages&style=flat-square&color=a9ba8b&labelColor=101514)](https://github.com/sharan-s-dev/VIGIL/actions)
[![Open source AI](https://img.shields.io/badge/AI-local--first-e09a68?style=flat-square&labelColor=101514)](#why-open-ai)
[![MIT](https://img.shields.io/badge/license-MIT-a9ba8b?style=flat-square&labelColor=101514)](LICENSE)

**VIGIL is a private digital ofrenda for the stories, rituals, recipes, and small details that make someone impossible to forget.** It stores the archive on the keeper’s device, optionally uses an open-weight model through local Ollama, and still works when the model and the internet are both gone.

## Try the product

**[Open the live demo →](https://sharan-s-dev.github.io/VIGIL/)** · **[Watch the walkthrough →](https://youtu.be/m7NQ6o_PVRA)** · **[Read the architecture →](ARCHITECTURE.md)**

[![Watch the VIGIL walkthrough](https://i.ytimg.com/vi/m7NQ6o_PVRA/hqdefault.jpg)](https://youtu.be/m7NQ6o_PVRA)

### The 60-second path

1. Open **The orange radio**.
2. Choose **Ask for an echo** using the offline Whisperer.
3. Add a memory with one sensory detail.
4. Search the archive locally.
5. Export the archive as portable JSON.
6. Optional: run Ollama and switch to **Local open model**.

The original memory always remains separate from the generated reflection. VIGIL never presents machine-written text as the voice of the person being remembered.

## The problem

The most intimate things we give technology are often the things we should not casually give to a platform: a grandmother’s recipe, a parent’s voice, a family phrase, or the details that make a person more than a name.

Cloud AI makes powerful reflection easy, but it also makes the privacy boundary opaque. VIGIL explores a different contract:

> **The archive belongs to the keeper. The model is a replaceable instrument.**

The “ghost” is not a simulated person. It is the signal that remains in a song, a kitchen, a handwritten recipe, or a phrase someone left behind.

## Why open AI

VIGIL is not a conventional web app with an AI feature added at the end. Its local model boundary is part of the product design.

- **Local by default:** capture, search, storage, export, import, and the offline Whisperer require no network.
- **Open and inspectable:** Ollama can run an open-weight model such as `llama3.2:3b` on the user’s machine. The prompt and adapter are visible and replaceable.
- **Private by architecture:** memories are stored in IndexedDB, with a localStorage fallback. VIGIL has no account, hosted database, analytics pipeline, or required API key.
- **Graceful without AI:** if Ollama is not installed, unreachable, or times out, VIGIL uses a clearly labelled deterministic local fallback instead of silently calling a cloud service.
- **Source-first:** generated text is escaped, bounded, labelled as an interpretation, and never written back over the original memory.
- **Portable:** export JSON and keep the archive independent of this repository, this model, and this project.

With a closed API, privacy is primarily a policy promise. With VIGIL, the boundary is visible in the code and the model request points to `localhost`.

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│                                                             │
│  Memory UI ── validation ── IndexedDB                      │
│       │                         └─ localStorage fallback    │
│       │                                                     │
│       ├── Whisperer ─────────── deterministic / no network  │
│       │                                                     │
│       └── Ollama adapter ────── localhost:11434             │
│                                      │                      │
│                                      └─ open-weight model    │
└─────────────────────────────────────────────────────────────┘
```

The GitHub Pages deployment is a static client. There is no VIGIL API or database. When the local model is selected, only the selected memory is sent directly from the browser to the user’s Ollama process.

## What is built

| Capability | Engineering value |
| --- | --- |
| Preserve a memory | Structured capture for a person, place, date, details, and tags |
| Local archive | IndexedDB persistence with browser fallback |
| Search and recent view | Local full-text search with no server-side index |
| Reflection engines | Deterministic offline path plus optional Ollama inference |
| Source protection | Original memory and generated echo remain separate |
| Import / export | Versioned, bounded, validated, portable JSON |
| Failure handling | Model timeout, cancellation, stale-response protection, rollback on save failure |
| Local server | Loopback binding, public-file allowlist, safe methods, security headers |
| Delivery | GitHub Pages with smoke tests required before deployment |

## Run it locally

Requirements: **Node 18+**. There are no runtime dependencies and no build step.

```bash
git clone https://github.com/sharan-s-dev/VIGIL.git
cd VIGIL
npm start
```

Open <http://localhost:4173>.

Run the verification suite:

```bash
npm test
```

The tests verify that the local server serves only the intended application surface, rejects mutation methods, returns security headers, and supports `HEAD` correctly.

## Enable local open-weight inference

Install [Ollama](https://ollama.com/), then run:

```bash
ollama pull llama3.2:3b
ollama serve
```

Choose **Local open model** inside VIGIL. Requests are cancelled after 15 seconds, and the offline Whisperer takes over if Ollama cannot answer.

## Privacy boundary

VIGIL is designed to prevent accidental cloud transmission, not to claim impossible security.

- The public demo does not require personal data and starts with sample memories.
- Normal archive operations stay in the current browser profile.
- Ollama is contacted only after the user selects the local-model path.
- The browser profile, device, extensions, screenshots, and exported JSON remain outside VIGIL’s protection boundary.
- Browser storage and exported JSON are **not encrypted**. Encrypt backups separately when the content is sensitive.

This limitation is intentional and documented in [`SECURITY.md`](SECURITY.md).

## Quality and operations

- `npm test` runs on every GitHub Pages deployment.
- The local server binds to `127.0.0.1` by default and does not expose `.git`, workflows, package metadata, or documentation as runtime files.
- Imports are limited to 4 MB and validated before replacing the current archive.
- Memory fields, archive size, memory count, model output, and tag counts are bounded.
- Ollama calls have a timeout and stale responses cannot overwrite a newer echo.

## Roadmap

- On-device speech-to-text with Whisper.cpp
- Local image embeddings for semantic memory search
- Encrypted archive files with a passphrase held only by the keeper
- Consent-based family-specific LoRA adapters
- Optional encrypted device-to-device synchronisation

## Repository map

- `index.html` — accessible product shell
- `styles.css` — responsive visual system and reduced-motion support
- `app.js` — storage, validation, search, model adapter, fallback, export/import
- `server.js` — allowlisted zero-dependency local development server
- `test/server.test.js` — server hardening smoke tests
- `ARCHITECTURE.md` — runtime boundaries and threat model
- `SECURITY.md` — privacy boundary and responsible disclosure
- `.github/workflows/pages.yml` — test-gated GitHub Pages deployment
- `SUBMISSION.md` — original challenge write-up

## License

MIT — see [`LICENSE`](LICENSE).
