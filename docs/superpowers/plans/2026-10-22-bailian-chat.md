# Bailian chat implementation plan

**Goal:** Replace scripted chat with real streaming Bailian replies, preserve four coach voices, and prepare a deployable server without publishing it.

**Architecture:** Node 22 built-in HTTP server serves the existing website and POST /api/chat. Only the server reads DASHSCOPE_API_KEY. Qwen Plus in non-thinking mode is the default; provider URL and model remain environment settings. No account or database is introduced.

**Scope approved in chat:** Local integration plus online server deployment preparation. Model choice delegated to the implementer. The user entered the key through a masked terminal into ignored .env.

## Tasks

- [x] Add failing HTTP and streaming-client tests: streaming, role validation, provider errors, cancellation, authentication, origin checks, rate limits, and static-file isolation.
- [x] Implement bounded server-side provider requests, four server-controlled voice prompts, explicit errors, client cancellation and per-process limits. Require a shared access token in production.
- [x] Connect the existing chat page to streamed replies; add stop, retry, optional access-token input and an accurate disclosure about sending conversation to Bailian. Never change plans from model output.
- [x] Add npm commands, runtime-only Docker packaging and environment examples. Keep existing static preview build usable. Container configuration prepared; engine unavailable for an image build.
- [x] Run the existing 80 tests plus new tests; verify real streaming with the local key and browser; obtain independent review before reporting completion. 97 tests pass, including idle-reader stop and client-disconnect cancellation; both review lanes clear after fixing the staged-body concurrency race.

## Boundaries

- Keep .env ignored and exclude it from container context. Do not log keys, user conversations or provider error bodies.
- Send only recent user/assistant messages, selected voice and language. Do not send saved measurements or historical records.
- No deployment, push or merge is included. A separately hosted unchanged static Sites page does not automatically acquire the new server API.
- Public multi-instance deployment still needs centralized quotas and account authentication; this version prepares a single-instance team server with an access token.
