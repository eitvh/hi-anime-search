# PROMPTS.md

This is a simple log of how I used AI while building the app. For each item, I wrote what I asked, why I asked it, and where the result landed in the code.

**Tool:** ChatGPT 5 Thinking (reasoning model)
**Date:** 2025-10-25

---

## 1) Lock dev server to port 4000

**What I asked**

> “Help me make Vite run on port **4000** only, no auto‑fallback and how to free that port on Windows.”

**Why**
The spec demands `npm run dev` on port **4000**. I wanted it to fail fast if something else was already using it.

**What I used**
`server.port = 4000` and `server.strictPort = true`. Also kept the Windows notes: `netstat -ano | findstr :4000` and `taskkill /PID <pid> /F`.

**Files**
`vite.config.ts`

---

## 2) Tailwind v4 + shadcn (Neutral theme)

**What I asked**

> “Set up shadcn on Tailwind with the **Neutral** palette.

**Why**
I wanted a clean, cohesive look without rebuilding primitives from scratch.

**What I used**
Generated components in `src/components/ui/` and theme tokens in `index.css`.

**Files**
`index.css`, `src/components/ui/*`

**Commands**

```bash
npx shadcn@latest init
npx shadcn@latest add button card badge tooltip tabs scroll-area dialog skeleton sonner select pagination aspect-ratio avatar separator
```

---

## 3) Search page layout & polish

**What I asked**

> “Give me a modern, blog‑like search page: 6×2 grid, **pagination in the top‑right**, add skeletons when loading and make sure a smooth transitions between loading/empty/list—staying within the Neutral theme.”

**Why**
I wanted the index to feel content‑first and a bit modern but still practical.

**What I used**
Ambient conic glow, glassy panels, animated grid entrance and `sonner` toasts.

**Files**
`src/features/search/SearchPage.tsx`, `src/components/SkeletonCard.tsx`, `src/components/Pagination.tsx`

---

## 4) Instant search (debounce + cancel)

**What I asked**

> “Show me the best and safest way to do instant search with a **250ms debounce**, and **cancel** any in‑flight request when the user keeps typing.”

**Why**
It’s required by the spec and it avoids hammering the API.

**What I used**
Thunks pass `thunkAPI.signal` to `fetch`. In the component, I keep a ref to the last dispatched promise and call `.abort()` before dispatching a new one.

**Files**
`src/features/search/searchSlice.ts`, `src/components/SearchBar.tsx`

---

## 5) Anime cards that feel alive

**What I asked**

> “Help me design cards with subtle 3D tilt, a frameless poster, an expanding title panel on hover and only show chips (score/episodes/year) when those fields exist.”

**Why**
I wanted a ‘wow’ moment that still reads well and doesn’t clutter the layout.

**What I used**
Tilt on hover, conic ring, framed image, animated title panel, and conditional chips.

**Files**
`src/components/AnimeCard.tsx`

---

## 6) Detail page tabs & content

**What I asked**

> “Build a detail pdummy page with shadcn **Tabs** (Overview, Characters, Trailer, Reviews, Streaming, Recommendations). Hide tabs with no data. Add per tab skeletons. Also give me a simple synopsis modal with a sticky title.”

**Why**
I needed the detail view to be rich but still fast and organized.

**What I used**
Auto‑hiding tabs, per‑tab skeletons, smooth tab transitions, and a normal modal for synopsis with a sticky header.

**Files**
`src/features/detail/DetailPage.tsx`

---

## 7) Rate limits and other errors

**What I asked**

> “What’s a friendly way to surface **429**, based on Jikan rate limit and network errors?”

**Why**
Good error messages reduce confusion and re‑tries.

**What I used**
Red `sonner` toast for rate‑limit, plus a compact inline block with a **Reload** action when needed.

**Files**
`SearchPage.tsx`, `DetailPage.tsx`

---

## 8) TypeScript clean‑up

**What I asked**

> “Fix `verbatimModuleSyntax` imports (`import type`) and stop redefining `Anime`. Just import types from one place.”

**Why**
Keeps types consistent and avoids drift across files.

**What I used**
`import type { PayloadAction }` and shared Jikan types from `api/jikan`.

**Files**
`src/features/search/searchSlice.ts`, `src/api/jikan.ts`

---

