# VIGIL — The Offline Memory Archive

## One-line pitch

VIGIL is a private digital ofrenda that keeps family stories on your own machine and uses an open-weight model to return them as gentle, grounded “echoes.”

## The story

The most important things we hand to technology are often the things we should not hand to a platform: a grandfather's recipe, a voice note from a parent, the tiny details that make a person more than a name. VIGIL is a local-first memory archive for those fragments.

You can enter a memory, attach a local artifact, and return to it later through search or a chronological archive. When you want a reflection, VIGIL can ask a local Ollama model to create an “echo” using only the selected story. The original stays beside the generated text. If no model or internet is available, a deterministic local Whisperer still creates a small ritual prompt, so the core experience survives offline.

## Why open innovation mattered

An API-only memory product would make the most intimate part of this project dependent on a company, a network connection, and a policy that could change. Open-weight inference gives VIGIL a different contract: the keeper chooses the model, the model can be swapped or fine-tuned, and the story never has to leave the room.

The open approach also made the product more honest. We could show exactly when a model was used, preserve the source text, build an offline fallback, and make export a first-class feature rather than an afterthought. “Private” is not a marketing promise here; it is an architecture made of browser storage and a localhost-only model adapter.

## How it works

1. The browser stores structured memories in `localStorage`.
2. Search runs over the local archive.
3. The **Local open model** option sends only the selected memory to an Ollama server on `localhost`.
4. The fallback Whisperer uses no network and no model endpoint.
5. JSON export makes the archive portable and user-owned.

## What I would build next

- optional on-device speech-to-text with Whisper.cpp
- local image embeddings for “find the summer kitchen” search
- encrypted archive files with a passphrase held only by the keeper
- a small family-specific LoRA adapter, trained only on consented stories

## Demo path

1. Open VIGIL and notice the **LOCAL ONLY** watch indicator.
2. Use the seeded sample memories to open “The orange radio.”
3. Generate an echo in fallback mode, then switch to **Local open model** if Ollama is running.
4. Add a new memory with a detail only a human would think to preserve.
5. Search for `marigold` or `radio`.
6. Export the archive and point out that no account or server was involved.

## Links

- Live demo: `http://localhost:4173`
- Source: add repository link here
- Session recording: add DevRelay session link here
