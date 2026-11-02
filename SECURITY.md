# Security and Privacy Boundary

## Reporting a vulnerability

Please do not publish sensitive details in a public issue. Open a private security report through GitHub or contact the repository owner before disclosure.

## What VIGIL does

- Stores memories in the browser using IndexedDB, with a localStorage fallback.
- Sends data to Ollama only when the user explicitly selects the local model path.
- Sends requests to `localhost`, not to a VIGIL server.
- Escapes memory content and model output before rendering it into the page.
- Validates and bounds imported archives.
- Keeps original memories separate from generated reflections.

## What VIGIL does not promise

VIGIL is not encrypted storage. A browser extension, compromised device, or anyone with access to the browser profile may be able to read local memories. The public GitHub Pages host serves the application code, but it does not receive the archive through the VIGIL application.

Exported JSON files are unencrypted. Store them in an encrypted location when they contain sensitive material.

## Local server note

The included `server.js` is for local development. It binds to `127.0.0.1`, exposes only the application allowlist, rejects non-read methods, and does not provide authentication or TLS. Do not change it to listen on a public interface without adding an appropriate reverse proxy and access controls.
