# VIGIL — The Offline Memory Archive

> **A private digital ofrenda for the stories that should outlive the cloud.**

[![Live demo](https://img.shields.io/badge/live_demo-vigil--sharan--s--dev.github.io-a9ba8b?style=flat-square&labelColor=101514)](https://sharan-s-dev.github.io/VIGIL/)
[![License](https://img.shields.io/badge/license-MIT-a9ba8b?style=flat-square&labelColor=101514)](#license)
[![AI](https://img.shields.io/badge/AI-local--first-e09a68?style=flat-square&labelColor=101514)](#why-open-ai)

VIGIL is a **local-first oral-history archive** for preserving the stories, rituals, and small details that make a person impossible to forget. It can use an open-weight model running on your own computer to create a short, grounded “echo” of a memory — but the archive remains useful with no internet, no account, and no model installed.

## Try it

**[Open the live demo →](https://sharan-s-dev.github.io/VIGIL/)**

The GitHub Pages demo includes seeded sample memories so the experience is immediately understandable. Add your own memory, search it, ask for an offline echo, and export the archive as JSON.

## Why open AI matters

The most intimate data should not have to become someone else's product. VIGIL makes the model a replaceable local tool, not a hosted gatekeeper:

- **Private by architecture:** memories live in the browser's local storage. There is no VIGIL account, analytics pipeline, hosted database, or required API key.
- **Open and swappable:** select a local Ollama model such as `llama3.2:3b`, replace it with another model, or build a family-specific adapter later.
- **Works offline:** the capture, search, archive, export, and deterministic “Whisperer” reflection path require no network.
- **Honest about generation:** source memories are never rewritten. Every echo is labelled as an interpretation, and the original remains the source of truth.
- **Portable:** export the archive to JSON. Your memories are not locked into a product that might disappear.

This is where an open approach works better than a closed one: it makes the privacy boundary inspectable, lets the keeper choose the model, and keeps the core experience alive when the lights — or the internet — go out.

## Run locally

Requirements: Node 18+.

```bash
git clone https://github.com/sharan-s-dev/VIGIL.git
cd VIGIL
npm start
```

Open <http://localhost:4173>. The app uses no build step and no runtime dependency install.

### Enable local open-weight inference

Install [Ollama](https://ollama.com/), then run:

```bash
ollama pull llama3.2:3b
ollama serve
```

Choose **Local open model** inside VIGIL. The browser sends the selected memory to Ollama on `localhost` only. If Ollama is unavailable, VIGIL automatically falls back to its offline Whisperer and labels the fallback clearly.

## What is inside

| File | Purpose |
| --- | --- |
| `index.html` | Accessible application shell and archive UI |
| `styles.css` | Responsive visual system and reduced-motion support |
| `app.js` | Local data layer, search, model adapter, fallback, export/import |
| `server.js` | Tiny zero-dependency local development server |
| `SUBMISSION.md` | Hackathon-ready project story and demo path |
| `.github/workflows/pages.yml` | Automatic GitHub Pages deployment |

## Data model and privacy

VIGIL stores memories in `localStorage` under a versioned key. It does not upload, index, or synchronise them. The optional Ollama request contains only the selected memory and is sent to `http://localhost:11434`; it never goes through a VIGIL server. Export your archive and keep an encrypted backup for anything irreplaceable. Clearing browser storage deletes the local copy.

This is a privacy-conscious prototype, not a replacement for encrypted archival storage. That limitation is intentional and visible.

## Roadmap

- On-device speech-to-text with Whisper.cpp
- Local image embeddings for semantic memory search
- Encrypted archive files with a passphrase held only by the keeper
- Consent-based, family-specific LoRA adapters
- Optional encrypted sync between devices under the user's control

## License

MIT — see [LICENSE](LICENSE).
