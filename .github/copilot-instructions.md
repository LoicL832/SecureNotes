## SecureNotes — Copilot / AI agent instructions

Purpose: quickly orient an AI coding assistant to be productive in this repository.

- **High-level architecture**: this is a two-part web app (frontend + backend). The backend is a Node.js/Express REST API that stores encrypted notes on the filesystem and implements active-active replication between peers. Replication uses `backend/src/services/replicationService.js` and a merge strategy of last-write-wins on metadata timestamps.

- **Key components (where to look first)**:
  - Backend entry: `backend/src/server.js` — route mounting, security middleware, CLI flags (`--port`, `--name`, `--peer`).
  - Replication: `backend/src/services/replicationService.js` — sync protocol, internal endpoint `/api/internal/sync`, uses `X-Internal-Secret` header.
  - Notes business logic: `backend/src/services/noteService.js` — metadata layout, where encrypted files live, example create/read/update/delete flows.
  - Crypto primitives: `backend/src/utils/crypto.js` — AES-256-GCM encrypt/decrypt and PBKDF2 key derivation (important: `userKey` is derived from the username/password convention used by the app).
  - Config and secrets: `backend/config/config.js` — defaults and env fallbacks (override via `JWT_SECRET`, `PEER_URL`, `PORT`).
  - Middleware: `backend/src/middleware/auth.js` and `backend/src/middleware/security.js` — JWT auth and security controls (rate limits, input sanitization).

- **Storage layout and conventions**:
  - Metadata: per-user `metadata.json` located under `./data/notes/<userId>/metadata.json`.
  - Encrypted content files: `./data/notes/<userId>/<noteId>.enc` (JSON with {encrypted, iv, tag, salt}).
  - Users, shares, logs: `./data/users/users.json`, `./data/shares/shares.json`, `./data/logs/`.
  - The code uses synchronous `fs` operations in several places (small dataset assumption). Avoid changing to async without checking calling code and tests.

- **Developer workflows / run commands (explicit)**:
  - Full (two-server) startup: from repository root `npm run server1` and `npm run server2` (or `npm start` which attempts both in background on the same machine via the root backend scripts).
  - Single backend: `cd backend && npm run dev` or `node src/server.js --port=3003 --name=server3 --peer=http://localhost:3001`.
  - Frontend dev: see `frontend/README.md` (frontend is served statically by backend when started).
  - Tests: `cd backend && npm test` (runs `tests/security-tests.js`).

- **Important implementation details agents must preserve**:
  - `req.user.username` is used as `userKey` for encryption/decryption in several places (see `notes.js` and `noteService.js`). Changing this convention affects all crypto flows and replication.
  - Inter-server authentication for replication relies on `config.jwt.secret` (sent in header `X-Internal-Secret`). Do not remove or silently change this mechanism.
  - Replication merge is implemented in `replicationService.merge*` functions — it is deliberate: metadata arrays, last-write-wins by `updatedAt`.
  - Routes are thin: business logic belongs in `src/services/*`; follow that separation when adding features or tests.

- **Patterns & style to follow**:
  - Keep route handlers small; delegate validation/logic to `utils/validator.js` and `services/*`.
  - Use existing logger helpers in `src/utils/logger.js` to record security / replication events.
  - Respect existing error messages and HTTP status codes (routes return 400/401/403/404/500 depending on case).

- **Security & production notes (do not forget in PRs)**:
  - `backend/config/config.js` contains a default secret; production MUST use environment variables (JWT_SECRET, NODE_ENV=production).
  - Hardening: keep rate limiting, helmet/csp headers, and input sanitization enabled. Tests assume these middlewares exist.

- **Where to add tests / how to run them**:
  - Add small, isolated checks to `backend/tests/security-tests.js` for security-related features (the repo runs tests via `npm test`).
  - For replication-related changes, prefer end-to-end checks by starting two servers on different ports and asserting that `data/` directories converge.

If any part of this summary is unclear or you want me to expand a section (examples: sample PR template, concrete unit test skeletons, or specific file links), tell me which area to improve.
