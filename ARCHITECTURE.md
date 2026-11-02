# VIGIL Architecture

VIGIL is deliberately split into a static client and an optional local inference process. The application can be hosted on GitHub Pages because the privacy-critical path does not require a VIGIL backend.

## Runtime boundaries

```text
┌─────────────────────────────────────────────────────────────┐
│ Browser                                                     │
│                                                             │
│  UI ── archive controller ── IndexedDB                     │
│              │                 └── localStorage fallback    │
│              │                                              │
│              ├── Whisperer (deterministic, no network)      │
│              │                                              │
│              └── Ollama adapter ── localhost:11434         │
└─────────────────────────────────────────────────────────────┘
```

The browser owns the archive. The optional model receives only the selected memory and returns a reflection. VIGIL does not proxy or persist model requests.

## Storage strategy

- **Primary:** IndexedDB, which avoids the small synchronous quota and main-thread serialisation cost of `localStorage` for normal archives.
- **Compatibility fallback:** versioned `localStorage` data for browsers where IndexedDB is unavailable or restricted.
- **Portable boundary:** JSON export/import is the user-controlled backup and migration format.
- **Safety limits:** imports, memory fields, tag counts, archive size, and memory count are bounded before persistence.

## Reflection contract

The source memory and generated echo are separate values in the UI. The source is never replaced by model output. Each response is labelled as one of:

- `LOCAL WHISPERER · OFFLINE`
- `LOCAL OPEN MODEL · OLLAMA`
- `LOCAL WHISPERER · OFFLINE FALLBACK`

Ollama requests are cancellable and time out after 15 seconds. A stale response cannot overwrite a newer request.

## Local server boundary

`server.js` is a development server, not an application backend. It:

- binds to loopback by default;
- allows only `GET` and `HEAD`;
- serves an explicit allowlist of public files;
- rejects repository metadata and hidden files;
- sets browser security headers;
- supports graceful shutdown.

GitHub Pages serves the same static application directly and does not run `server.js`.

## Threat model

VIGIL protects against accidental cloud transmission and unnecessary server-side collection. It does not claim to protect against a compromised browser profile, malicious extensions, local malware, screenshots, or an unlocked device. Browser storage is not encrypted. Users should export and encrypt important archives outside VIGIL.

## Operational checks

```bash
npm test
node --check app.js
node --check server.js
```

The Pages workflow runs the smoke tests before creating a deployment artifact.
