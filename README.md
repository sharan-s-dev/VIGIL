# VIGIL — The Offline Memory Archive

> **The cloud is not the only place a memory can live.**

[![Live demo](https://img.shields.io/badge/live_demo-open-a9ba8b?style=flat-square&labelColor=101514)](https://sharan-s-dev.github.io/VIGIL/)
[![Open source](https://img.shields.io/badge/AI-local--first-e09a68?style=flat-square&labelColor=101514)](#why-open-ai)
[![License](https://img.shields.io/badge/license-MIT-a9ba8b?style=flat-square&labelColor=101514)](#license)

**VIGIL is a private digital ofrenda for the stories that should outlive the cloud.** It is a local-first oral-history archive that keeps memories in your browser, optionally reflects on them with an open-weight model running on your own computer, and still works when the internet and the model are both gone.

## See it in 15 seconds

**[Open the live demo →](https://sharan-s-dev.github.io/VIGIL/)**

1. Open **The orange radio**.
2. Ask for an **echo** using the offline Whisperer.
3. Switch to **Local open model** to use Ollama on `localhost`.
4. Add a memory, search the archive, then export it as portable JSON.

The original story stays visible beside every generated reflection. The model is never allowed to become the source of truth.

### Watch the Demo 

[![Watch the VIGIL Walkthrough](https://i.ytimg.com/vi/m7NQ6o_PVRA/hqdefault.jpg)](https://youtu.be/m7NQ6o_PVRA)

*(Click the image to watch the demo on YouTube)*

## Why this exists

Every intimate thing we give to cloud AI—our personal lore, unwritten recipes, life rituals, and memories of the people we cherish—becomes someone else's training data. VIGIL reverses that contract: an offline-first, zero-dependency memory vault where human stories stay strictly on your machine, reflected by open-weight local AI that you control, inspect, and can put down at any time.

## Why open AI matters

VIGIL is built around an open, local model path—not decorated with AI after the fact.

- **Private by architecture:** memories are stored in browser `localStorage`. There is no account, hosted database, analytics pipeline, or required API key.
- **Open and swappable:** use Ollama with an open-weight model such as `llama3.2:3b`, replace the model, change its prompt, or add a family-specific adapter later.
- **Offline by default:** capture, search, archive, export, and the Whisperer fallback require no network and no model server.
- **Honest about generation:** an echo is visibly labelled as an interpretation. The source memory is never silently rewritten.
- **Portable:** export JSON and keep the archive independent of this repository, this model, and this project.

With a closed API, the privacy boundary is a promise. With VIGIL, it is inspectable code and a localhost address.

## Architecture

```text
                         optional
  selected memory ─────────────────────────▶ Ollama / open-weight model
        │                                             │
        │                                             ▼
        ├── local archive ──▶ original memory + labelled echo
        │
        └── no model / no internet ──▶ deterministic Whisperer

  Browser localStorage ◀── capture · search · export · import
```

The public GitHub Pages demo is static and works through the offline path. When Ollama is selected, only the chosen memory is sent to `http://localhost:11434`; it does not pass through a VIGIL server.

## Run locally

Requirements: Node 18+. There are no runtime dependencies and no build step.

```bash
git clone https://github.com/sharan-s-dev/VIGIL.git
cd VIGIL
npm start
```

Open <http://localhost:4173>.

### Turn on local open-weight inference

Install [Ollama](https://ollama.com/), then run:

```bash
ollama pull llama3.2:3b
ollama serve
```

Choose **Local open model** in VIGIL. If Ollama is unavailable, VIGIL falls back automatically to the offline Whisperer and tells you that it did so.

## Product surface

| Capability | What it demonstrates |
| --- | --- |
| Preserve a memory | Structured capture for a person, place, date, details, and tags |
| Archive search | Local full-text search with no server-side index |
| Ask for an echo | Grounded reflection through offline fallback or local Ollama |
| Source protection | Original story remains separate from generated text |
| Export / import | Portable JSON ownership instead of platform lock-in |
| Night watch | A visible, calm privacy status rather than invisible infrastructure |
| GitHub Pages | A zero-build static demo that works without a backend |

## Honest limitations

VIGIL is a privacy-conscious prototype, not encrypted archival storage. Data lives in the current browser profile; clearing browser storage removes the local copy. Export the JSON and keep an encrypted backup for anything irreplaceable. The public demo uses sample memories so visitors can understand the product without entering personal data.

## Roadmap

- On-device speech-to-text with Whisper.cpp
- Local image embeddings for semantic memory search
- Encrypted archive files with a passphrase held only by the keeper
- Consent-based, family-specific LoRA adapters
- Optional encrypted device-to-device sync under the user's control

## Project files

- `index.html` — accessible application shell
- `styles.css` — responsive visual system and reduced-motion support
- `app.js` — local data layer, search, model adapter, fallback, export/import
- `server.js` — tiny zero-dependency local server
- `SUBMISSION.md` — publish-ready challenge post
- `.github/workflows/pages.yml` — automatic GitHub Pages deployment

## License

MIT — see [LICENSE](LICENSE).
