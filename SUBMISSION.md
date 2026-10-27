# VIGIL — The Offline Memory Archive

> **The cloud is not the only place a memory can live.**

This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).

## What I Built

VIGIL is a private digital ofrenda for preserving the stories, rituals, and small details that make a person impossible to forget.

You can record a memory about someone, search the local archive, and ask for a short “echo” of it. The echo is clearly marked as machine-generated and is always shown beside the original story. Nothing is silently rewritten, and no account is required.

I interpreted **Ghost in the Machine** as a question about what happens when a machine reflects something deeply human back to us. The “ghost” in VIGIL is not a fake resurrection. It is the signal that remains in a recipe, a voice, a place, or a phrase someone left behind.

## Demo

**[Open VIGIL on GitHub Pages →](https://sharan-s-dev.github.io/VIGIL/)**

The demo is static, requires no sign-in, and works through the offline reflection path immediately.

### The 60-second demo

1. Notice the **LOCAL ONLY** status in the header.
2. Open **The orange radio**.
3. Choose **Ask for an echo** and show the offline Whisperer response.
4. Switch to **Local open model** if Ollama is running.
5. Add one new memory with a sensory detail.
6. Search for `radio` or `music`.
7. Export the archive and show that it is portable JSON.

## Code

**[View the source on GitHub →](https://github.com/sharan-s-dev/VIGIL)**

The project is intentionally small and inspectable. There is no framework, build pipeline, hosted database, or hidden API layer.

## How I Built It

VIGIL has two reflection engines:

1. **Whisperer — deterministic offline fallback:** a local, no-network reflection path that keeps the product functional when there is no model and no internet.
2. **Local open model — Ollama:** an optional adapter that sends the selected memory to Ollama on `localhost`, using an open-weight model such as `llama3.2:3b`.

The rest of the product is local-first JavaScript:

- structured memories are stored in browser `localStorage`;
- search runs over the local archive;
- export/import uses portable JSON;
- generated echoes are displayed separately from source memories;
- the GitHub Pages version is a zero-build static site.

There is no VIGIL server. When the local model is selected, the request goes directly from the browser to the user's own Ollama process.

## Why Does Open Innovation Matter?

The data in a memory archive is exactly the kind of data that should not become a platform's training set, product surface, or permanent dependency.

A closed AI API would make VIGIL's central promise a policy statement: *trust us, we will keep your story private*. Open local inference makes that boundary visible in the architecture. The keeper can inspect the code, choose the model, swap the model, change the prompt, run a smaller model on an older laptop, or remove AI entirely and still keep the archive.

Open innovation also made failure a first-class design constraint. If Ollama is unavailable, VIGIL does not break or pretend that a remote model answered. It falls back to a clearly labelled local reflection. If the internet disappears, capture, search, export, and the core ritual still work.

The strongest design decision is that the model is not the owner of the memory. It is an instrument the keeper can put down.

## My Agent Session

<!-- Save this coding session with DevRelay and replace the placeholder before publishing. -->

`[Add the saved DevRelay session link here]`

## The Spirit of It

The moment I wanted the demo to land was small: a person opens **The orange radio**, reads a memory about a kitchen and a fading bolero signal, and then sees an echo that stays humble. It does not claim to be Abuela Elena. It does not invent a message from beyond the grave. It simply notices that the detail was kept.

That restraint is the point. A memory does not need a cloud-sized model to matter. It needs a safe place to remain.

## Prize Categories

- Open-source AI
- Local-first / offline inference
- Privacy-conscious AI

<!-- If the challenge lists official partner categories, replace these with the exact category names before publishing. -->

## What I Would Build Next

- on-device speech-to-text with Whisper.cpp;
- local image embeddings for “find the summer kitchen” search;
- encrypted archive files with a passphrase held only by the keeper;
- consent-based family-specific LoRA adapters.

## Links

- **Live demo:** https://sharan-s-dev.github.io/VIGIL/
- **Source:** https://github.com/sharan-s-dev/VIGIL
- **License:** MIT

<!-- Team Submissions: credit teammates by listing their DEV usernames here if applicable. -->

<!-- Thanks for participating! -->
