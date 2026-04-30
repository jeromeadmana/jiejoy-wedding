# Lessons

Anti-patterns + rules to prevent recurrence. Reviewed at session start per the development protocol.

---

## 2026-05-01 — Don't co-locate server-only SDKs with client-safe helpers

**What happened.** I put `cloudinaryUrl()` (a pure string-builder, used by client components like `AlbumViewer.tsx`) and `signUpload()` / `deleteFromCloudinary()` (which import the `cloudinary` Node SDK) in the same file `src/lib/cloudinary.ts`. Local `npx tsc --noEmit` passed. The first Vercel build failed with `Module not found: Can't resolve 'fs'` because Turbopack pulled the SDK into the browser bundle through the client-component import chain.

**Anti-pattern.** Exporting both server-only SDK code and client-importable helpers from one module. TypeScript will not catch this — bundlers will, and only at full build time.

**Rule.** When a module mixes:
- Code that imports a Node-only SDK (anything using `fs`, `path`, `net`, `crypto.createPrivateKey`, etc., or that holds an API secret), AND
- Code that any client component might want to import,

**split it into two files**. Put the SDK and secrets in `lib/<thing>.ts` with `import "server-only"` at the top — that turns any client import into a build-time error. Put the browser-safe helpers in `lib/<thing>-url.ts` (or `-client.ts`).

**How to apply.**
1. Before merging anything that adds a Node SDK dep (`cloudinary`, `aws-sdk`, `nodemailer`, `googleapis`, `pg`, `bcryptjs`...), grep for client components (files starting with `"use client"`) that import from the same module.
2. Run `npm run build` locally — not just `tsc --noEmit` — when adding any third-party SDK that might be Node-only. TypeScript is not a substitute for the bundler check.
3. Use `import "server-only"` on every file that holds secrets or Node-specific code, even if you "know" no client imports it. It's a one-line tripwire.
