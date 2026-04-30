# Gallery Feature — Plan

**Status:** In progress (started 2026-05-01)
**Created:** 2026-05-01

## Goal

Add a public photo gallery to the wedding site. Admin creates albums and bulk-uploads photographer's edits to Cloudinary; guests browse a grid → tap → immersive lightbox. ~200 photos total expected (~70 already in hand for the pre-nup album). No download UI. No gating — gallery is fully public.

## Decisions baked into this plan (reject any before I start)

### A. Cloudinary folder strategy
All media nests under a project root in your shared account:

```
jiejoy-wedding/
  albums/
    engagement/
    getting-ready/
    ceremony/
    portraits/
    reception/
    dance-floor/
```

Slugs are admin-defined when an album is created (defaults to `kebab-case(title)`).

### B. Upload path: signed direct-to-Cloudinary
The browser uploads straight to Cloudinary using a short-lived signature minted by our API. Photos never pass through Vercel functions (which would hit timeouts on a 70-photo bulk drop). Flow per file:

1. Browser asks `/api/admin/cloudinary/sign` for a signature
2. Browser POSTs the file directly to Cloudinary with that signature
3. Browser hands the returned `public_id` + dimensions back to our API
4. Our API writes a row to `jiejoy_photos`

### C. Data model — two new Supabase tables

**`jiejoy_albums`**
- `id` uuid pk
- `slug` text unique (URL segment)
- `title` text
- `description` text nullable
- `cover_public_id` text nullable (null → use first photo)
- `sort_order` int (controls album order on landing page)
- `is_published` bool default false
- `created_at`, `updated_at` timestamptz

**`jiejoy_photos`**
- `id` uuid pk
- `album_id` uuid fk → `jiejoy_albums.id` on delete cascade
- `cloudinary_public_id` text unique
- `width` int, `height` int (stored at upload — lets the grid lay out without image-load jank)
- `caption` text nullable
- `sort_order` int (admin-controlled drag order)
- `created_at` timestamptz

We store **`public_id` only**, never URLs. URLs are derived via a transform helper so we can change quality/sizing presets globally later.

RLS: public `SELECT` on rows where `is_published = true` (albums) and joined-published (photos). All writes service-role only.

### D. URL transform presets (the bandwidth guardrail)
Single helper `cloudinaryUrl(publicId, variant)`:
- `thumb` → `f_auto,q_auto,c_fill,w_600,h_600` (grid; square-cropped previews)
- `lightbox` → `f_auto,q_auto,w_1600` (immersive viewer)
- `hero` → `f_auto,q_auto,w_2400,c_fill,h_1200,g_auto` (landing page hero)

We *never* serve originals. A 200-photo gallery × 100 viewers × `q_auto` should land well under the 25 GB/mo free-tier cap.

### E. Library choices
- **`cloudinary`** — server-side signing only. No client SDK; we call the upload endpoint directly with `fetch`.
- **`react-photo-album`** — masonry grid that handles mixed aspect ratios cleanly.
- **`yet-another-react-lightbox`** — drop-in lightbox with keyboard nav, swipe, preloading. Pairs natively with `react-photo-album` (same author). Saves us weeks of gesture/preload bugs.
- **`@dnd-kit/core` + `@dnd-kit/sortable`** — admin photo reordering.

### F. Random / "Surprise Me"
- Public `/gallery` landing page: hero rotator pulls one random photo (`ORDER BY random() LIMIT 1`) on page load. Server-rendered, no client flicker.
- A "Surprise Me" link on the landing → opens the lightbox on a random photo from any published album. Album context preserved so left/right keep working within that album.

### G. What I'm explicitly *not* building (v1)
- No guest uploads / moderation queue
- No download buttons (you said no)
- No comments/reactions
- No video (Cloudinary supports it; can add later if you need it)
- No public/gated split — fully public

## Blast radius

### New files
- `supabase/migrations/003_create_gallery_tables.sql`
- `src/lib/cloudinary.ts` — server SDK init, signing, URL helper
- `src/lib/types/gallery.ts` — shared `Album`, `Photo` types
- `src/app/api/admin/cloudinary/sign/route.ts` — upload signing
- `src/app/api/admin/albums/route.ts` — list/create
- `src/app/api/admin/albums/[slug]/route.ts` — get/patch/delete
- `src/app/api/admin/albums/[slug]/photos/route.ts` — list/create/reorder
- `src/app/api/admin/albums/[slug]/photos/[id]/route.ts` — patch/delete
- `src/app/api/gallery/albums/route.ts` — public list
- `src/app/api/gallery/albums/[slug]/route.ts` — public album + photos
- `src/app/api/gallery/random/route.ts` — random photo
- `src/app/admin/gallery/page.tsx` — admin album list
- `src/app/admin/gallery/[slug]/page.tsx` — admin album editor (upload, reorder, captions, cover)
- `src/app/gallery/page.tsx` — public landing (hero rotator + album cards + Surprise Me)
- `src/app/gallery/[slug]/page.tsx` — masonry grid + lightbox
- `src/components/gallery/PhotoGrid.tsx`
- `src/components/gallery/Lightbox.tsx`
- `src/components/admin/PhotoUploader.tsx` — drag-drop bulk upload with progress
- `src/components/admin/PhotoReorder.tsx` — sortable grid

### Modified files
- `.env.example` — add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `src/middleware.ts` — confirm `/admin/gallery` is covered (likely already by `/admin/*` matcher; verify, no logic change expected)
- Nav / homepage — add link to `/gallery` (location TBD — see Open Questions)

### Dependencies (npm)
- `cloudinary`
- `react-photo-album`
- `yet-another-react-lightbox`
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

### Env vars (production)
You'll need to add the four Cloudinary vars in Vercel before the first deploy.

## Implementation order

- [x] **1. Schema + types.** Migration `003`, `src/lib/types/gallery.ts`.
- [x] **2. Cloudinary plumbing.** `src/lib/cloudinary.ts` (init, sign, URL helper).
- [x] **3. Sign endpoint.** `/api/admin/cloudinary/sign`.
- [x] **4. Admin albums CRUD.** API + admin list/create page.
- [x] **5. Photo upload.** `PhotoUploader` component (drag-drop, queue, progress).
- [x] **6. Admin photo management.** Reorder (dnd-kit), set cover, edit caption, delete photo.
- [x] **7. Public album route.** `/gallery/[slug]` with `react-photo-album` masonry + `yet-another-react-lightbox` integration.
- [x] **8. Public landing.** `/gallery` — hero (random), album cards, Surprise Me.
- [x] **9. Nav integration.** "Browse all our photos →" CTA added inside the existing homepage `PhotoGallery` section.
- [ ] **10. Bandwidth audit.** Manual — DevTools Network tab, verify `w_600`/`w_1600` transform URLs are served. Run after a populated album exists.

## Review (2026-05-01)

### Verified before handoff
- `npx tsc --noEmit` passes clean.
- `npm run lint` shows only pre-existing errors (Navbar, useParallax, original PhotoGallery memoization). No new lint errors introduced.
- All routes follow the project's existing dynamic-params pattern (`Promise<{ slug: string }>`).
- Middleware matcher already covers `/admin/gallery/*` via the existing `"/admin/((?!login).*)"` rule — no middleware change needed.

### Outstanding (user action required)
1. **Apply migration `supabase/migrations/003_create_gallery_tables.sql`** to your Supabase project (SQL editor or `supabase db push`).
2. **Production env vars** — when deploying to Vercel, add `CLOUDINARY_URL` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`. Local `.env.local` already has them.
3. **Smoke test the bandwidth promise** — once you've uploaded some photos, open `/gallery/engagement` in DevTools → Network and verify thumbnail URLs contain `w_600` and lightbox URLs contain `w_1600`. If anything serves at original size, the URL helper has a bug.

### Files touched
- New: 17 files (1 migration, 1 type, 1 lib, 1 sign endpoint, 4 admin API routes, 3 public API routes, 2 admin pages, 2 public pages, 3 components)
- Modified: `src/app/admin/page.tsx` (added Gallery nav button), `src/components/sections/PhotoGallery.tsx` (CTA link), `.env.example` (Cloudinary vars).

### Decisions worth remembering for next time
- **Editorial vs archival split** — homepage `PhotoGallery` stays curated (4 hardcoded narrative beats); `/gallery` is the archival Cloudinary-backed feed. CTA bridges them.
- **Folder root** in shared Cloudinary account is `jiejoy-wedding/albums/{slug}/`. Nothing else should live under that prefix.
- **URL helper is the single bandwidth chokepoint.** Every image render in the gallery must go through `cloudinaryUrl(publicId, variant)`; never `https://res.cloudinary.com/.../upload/{publicId}` directly.

## Verification (how "done" is proven)

- Migration `003` applies cleanly on a fresh local DB; rollback script works
- Admin can log in, create "Engagement" album, drag-drop the 70 pre-nup photos, see them appear in grid
- Drag to reorder persists on refresh
- Setting a photo as cover updates the album card
- Public `/gallery` shows published-only albums, hero rotates on each load
- Tap a photo in the album grid → lightbox opens on that photo; arrow keys + swipe navigate; Esc closes
- Mobile (Chrome DevTools iPhone 14 emu): photo fits viewport with margin, swipe works, no horizontal page scroll
- Network tab: every grid image URL contains `w_600`, every lightbox URL contains `w_1600`, no original-size requests
- Lighthouse on `/gallery/[slug]`: LCP < 2.5s on Fast 3G

## Resolved micro-decisions (2026-05-01)

1. **Nav placement** — Existing homepage section `PhotoGallery` (4 hardcoded curated photos with anchor `#gallery`) stays as-is. Nav `Gallery` link continues to anchor `#gallery`. A "Browse all our photos →" CTA inside that section routes to the new `/gallery` page. Two distinct jobs: editorial highlight reel vs. archival full gallery.
2. **Pre-seed albums in migration** — Yes. Migration creates `engagement`, `getting-ready`, `ceremony`, `portraits`, `reception`, `dance-floor` as published=false placeholders. Admin can edit/publish/reorder.
3. **Lightbox backdrop** — Warm-toned `rgba(20, 15, 12, 0.95)` with subtle backdrop blur to match site palette.
4. **Captions** — DB field + optional admin input. Hidden in lightbox unless populated.

---

Reply **"go"** to start at step 1, or push back on any decision in the "baked-in" section above.
