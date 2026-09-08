# AGENTS.md

Governance for AI agents working in the React Component Generator codebase.

## Operational Commands

Agent execution must use Bun exclusively. npm/yarn/pnpm are not supported.

- `bun install` — Install dependencies
- `bun run dev` — Start API server (port 3002) and frontend (port 5173) concurrently
- `bun run server` — Start API server only (watch mode)
- `bun run build` — Compile TypeScript and bundle with Vite
- `bun run lint` — Run ESLint
- `bun run test` — Run Vitest (one pass)
- `bun run test:watch` — Run Vitest (watch mode)
- `bun run test -- src/components/PromptInput.test.tsx` — Run specific test file
- `bun run preview` — Preview built frontend

## Golden Rules

### Immutable: API Key Isolation

**DO:**
- Store API keys in `.env` only (ANTHROPIC_API_KEY, GOOGLE_API_KEY)
- Validate API key presence at server entry point (`server/index.ts:60-66`)
- Return 400 error with descriptive message before calling AI APIs

**DON'T:**
- Log, cache, or forward API keys to third parties
- Allow client-side code to directly construct API URLs
- Assume environment variables are present; always call `resolveApiKey()`

**Evidence:** `server/index.ts:64-66` (client key takes precedence; 59-62 env vars loaded at server startup).

### Immutable: React-Live Execution Contract

**DO:**
- Always ensure generated code includes `render(<ComponentName />)` call
- Strip markdown code fences before passing code to LiveProvider
- Use `noInline={true}` in LiveProvider to require explicit render call

**DON'T:**
- Pass unprocessed AI responses directly to react-live
- Assume AI generates properly formatted code; use `ensureRenderCall()` and `stripCodeFences()`
- Use inline CSS modules or import statements in generated components; react-live scope is global React only

**Evidence:** `server/generator.ts:16-24` (ensureRenderCall logic); `src/components/LivePreview.tsx:14` (noInline contract); `server/index.ts:9-20` (SYSTEM_PROMPT forbids imports).

### Immutable: Async Error Handling

**DO:**
- Catch API errors in `server/index.ts:159-212` route handler, not in individual AI service functions
- Return descriptive error messages (distinguish 503 overload, 429 rate-limit, 400 bad request)
- Propagate promise rejections from `useComponentGenerator.generate()` to error banner

**DON'T:**
- Let uncaught promise rejections from fetch/API calls propagate silently
- Retry API calls in frontend; only server-side fallback (Google model fallback in `server/fallback.ts`)

**Evidence:** `server/index.ts:191-212` (error classification); `src/hooks/useComponentGenerator.ts:43-45` (error state capture).

### Team Pattern: Google Model Fallback

When calling Google Gemini, always use `withModelFallback()` with the ordered model list. Do not make direct API calls to Google without trying the next model on failure.

**DO:**
- Call `withModelFallback(GOOGLE_MODELS, (model) => callGoogleModel(...))` for all Google requests
- Define model priority in root scope (e.g., `const GOOGLE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash']`)
- Catch and throw the last error if all models fail

**DON'T:**
- Call `callGoogleModel()` directly without fallback wrapper
- Hardcode model names in route handlers; always reference a constant

**Evidence:** `server/index.ts:5` (model priority list); `server/index.ts:134-136` (callGoogle uses fallback); `server/fallback.ts:3-20` (fallback implementation).

### Asymmetry Flag: Frontend Hooks Lack Test Coverage

Critical data flow in `src/hooks/useComponentGenerator.ts` has no test file, while server utility functions (`generator.ts`, `fallback.ts`) do. This asymmetry indicates a testing gap.

**DO:**
- For any change to `useComponentGenerator.ts` or `useComponentState.ts`, add or update corresponding test files
- Test hook behavior (state transitions, error capture, cleanup) not just component rendering
- Run `bun run test` to verify suite passes before commit

**DON'T:**
- Skip testing hook logic because UI components are "integration-tested"
- Assume PromptInput test (`src/components/PromptInput.test.tsx`) covers all hook behavior; hooks are reusable

**Evidence:** `src/hooks/useComponentGenerator.ts` (no .test.ts file); `server/generator.test.ts` and `server/fallback.test.ts` (equivalent server utils have tests).

### Double Defense: API Key Validation

API key presence is checked twice: once in frontend (`App.tsx:34`) and again in server (`server/index.ts:64-66, 169-174`). Do not remove either check.

**DO:**
- Keep both validation layers
- Client-side check provides UX feedback; server-side check enforces security boundary
- Server error response should match client-side alert message for consistency

**DON'T:**
- Remove client-side check assuming server will catch it (UX degrades)
- Remove server-side check assuming client handled it (security boundary weakens)
- Use different error messages in client and server (confuses users)

**Evidence:** `src/App.tsx:34-36` (client validation); `server/index.ts:169-174` (server validation).

## Project Context

AI-powered React component generator: accept natural language prompts and render generated components with live preview. Supports Anthropic Claude and Google Gemini APIs.

**Tech Stack:** React 19, TypeScript, Vite, Bun, Vitest, react-live 4

## Standards & References

- **Commit Format:** `<type>(<scope>): <subject>` in Korean or English (consistent with repo history)
- **Maintenance:** If observed behavior diverges from Golden Rules, open an issue or PR rather than working around it. Auto-heal the rules.
