# Anime Search — YoPrint React Coding Project

A modern anime search built with **React + TypeScript + Redux + Vite** and **shadcn/ui (Neutral theme)**.
Search anime, paginate results, and explore details including characters, reviews, streaming links, and recommendations.

**Live URL:** *<add your deployment link here>*
**Repository:** *<add your GitHub repo link here>*

---

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:4000
```

> **npm only**. The dev server is locked to **port 4000** (`strictPort: true`).
> **No environment variables** are required. Jikan API is public.

---

## ✨ Features

* **Search Page**

  * 6×2 **grid** (exactly 12 items per page)
  * **Instant search** (250ms debounce + **cancels** in-flight requests)
  * **Top-right pagination** (server-side)
  * **Advanced cards**: 3D tilt, framed posters, expanding title panel, conic/acrylic accents
  * **Skeleton loaders**, animated state transitions, and **sonner** toasts
  * **Neutral** palette across shadcn components

* **Detail Page**

  * **Tabs** (shadcn): Overview, Characters, Trailer, Reviews, Streaming, Recommendations
    (Tabs auto-hide if a section has no data)
  * **Synopsis modal** with sticky title/header; modern paper-scroll animation
  * Characters with hover panel, badges; **pagination** (10 per page)
  * Reviews with cards, **pagination** (16 per page), full details in modal
  * Streaming with provider logos + external buttons
  * Recommendations with animation and deep-link to detail page
  * Skeletons and smooth transitions across all sections

* **Robust UX**

  * Rate-limit & network **error handling** (red sonner toasts)
  * Friendly empty states
  * Accessible labels, keyboard focus, and consistent contrast

---

## 🧱 Stack

* React 18, TypeScript
* Vite (port **4000**, strict)
* Redux Toolkit (RTK) + abortable thunks
* react-router-dom
* Tailwind CSS v4
* shadcn/ui (Neutral theme) + lucide-react
* sonner (toasts)

---

## 📦 Scripts

* `npm run dev` – start dev server at `http://localhost:4000`
* `npm run build` – production build to `dist/`
* `npm run preview` – preview `dist/` on port **4000**

---

## 🔌 API (Jikan)

* Base: `https://api.jikan.moe/v4`
* Search: `/anime?q=<query>&page=<n>`
* Detail: `/anime/:id`
* Characters: `/anime/:id/characters?limit=12`
* Reviews: `/anime/:id/reviews?page=<n>&limit=16`
* Streaming: `/anime/:id/streaming`
* Recommendations: `/anime/:id/recommendations`
* Trailer: `anime.trailer.embed_url` (if present)

No auth required.

---

## 🔎 Instant Search (Spec Compliance)

The search bar performs **instant queries** with:

* **Debounce:** 250ms
* **Cancellation:** any in-flight request is aborted when typing continues
* **Server-side pagination** remains intact via the Redux slice

Implementation highlights:

* `createAsyncThunk` passes `thunkAPI.signal` to `fetch`
* The component keeps a ref to the last dispatched thunk promise and calls `.abort()` before dispatching a new one

---

## 🗂️ Structure

```
src/
  app/
    store.ts
  api/
    jikan.ts
  features/
    search/
      SearchPage.tsx
      searchSlice.ts
    detail/
      DetailPage.tsx
      detailSlice.ts
  components/
    AnimeCard.tsx
    SearchBar.tsx
    Pagination.tsx
    SkeletonCard.tsx
    ui/…  (shadcn components)
  index.css
  main.tsx
  App.tsx (routes)
```

---

## 🧰 shadcn components used

Installed via:

```bash
npx shadcn@latest init   # Neutral theme
npx shadcn@latest add button card badge tooltip tabs scroll-area dialog skeleton sonner select pagination aspect-ratio avatar separator
```

(If you don’t have all yet, re-run the add command to generate the files under `src/components/ui/`.)

---

## 🚦 Error Handling

* **429** (rate limit) and network failures:

  * Red **sonner** toast with friendly message
  * Detail page also displays a compact error block with **Reload** action
* Consistent **skeletons** during loading across search and detail tabs
* Animated transitions for list ↔ empty ↔ loading

---

## ✅ Submission Checklist (self-audit)

* [x] **npm only**
* [x] `npm install` + `npm run dev` works
* [x] Dev server runs on **port 4000**
* [x] **No environment variables** needed
* [x] App **deployed** (fill link above)
* [x] Core functionality works (search + server pagination + details)
* [x] TypeScript throughout
* [x] Redux state management (abortable thunks)
* [x] Bonus UI/UX (skeletons, toasts, animations, tabs, modals)

---

## Bonus Implementation

### User Experience

* **Creative, futuristic UI** using shadcn (Neutral theme) with conic gradients, glass surfaces, soft shadows, and neon rings.
* **Advanced cards** (search + recommendations + characters): 3D tilt on hover, framed posters with equal padding, expanding title panel on hover, chip badges (score/episodes/year) and smooth “lift” on click.
* **Meaningful loading states**: shadcn **Skeleton** for search grid, detail poster and each tab (characters/reviews/recommendations).
* **Animated state transitions**: loading ↔ empty ↔ list, slide/fade for grid and panels, smooth page/tab transitions.
* **Empty state UX** with gentle guidance (icon + copy) instead of blank screens.
* **Synopsis modal** with sticky title/section header and subtle “paper scroll” animation (accessible; keyboard/focus-safe).
* **Top–right pagination** to avoid layout shifts and keep actions near the title/sort controls.
* **Responsive** layout: 6×2 grid on desktop, gracefully collapses on smaller screens, character/review cards adapt across breakpoints.
* **Toasts** via **sonner** for errors/rate limits and “no results” messages, non-blocking and consistent with app theme.
* **Accessible affordances**: labeled inputs/buttons, keyboard nav, clear focus states, avoids emoji-only indicators.

### Technical Excellence

* **Instant search** with **250ms debounce** and **cancellation** of in-flight requests using `AbortController` via RTK’s `thunkAPI.signal` (prevents request storms and race conditions).
* **Server-side pagination** integrated with Redux (query resets to page 1; page changes fetch from API).
* **Race-condition handling**: previous thunk promise is stored and `.abort()` is invoked before dispatching a new one; UI state machine prevents flicker (keyed view: `loading | empty | list`).
* **Granular skeletons** and per-tab lazy fetches (characters/reviews/streaming/recommendations) to avoid blocking the first content paint.
* **Resilient error handling**:

  * Red **sonner** toast for 429 (rate limit) with clear messaging.
  * Inline, themed error blocks with **Reload** action.
  * Defensive checks for missing fields (e.g., hide score/year chips if data unavailable).
* **TypeScript-first**: strict typings, centralized Jikan API types, no `any`; corrected `verbatimModuleSyntax` imports.
* **UI consistency**: all controls/components are shadcn-based (buttons, tabs, select, dialog, scroll-area, avatar, skeleton, pagination), themed to Neutral to avoid color mismatches.

### Nice-to-haves & Future Work

* **Filters**: type, status, score range, season/year, genres—the UI has room beside sort.
* **Caching**: memoize or cache recent queries with RTK Query (or SWR) to reduce API calls.
* **Tests**: add unit tests for slices and hooks (Jest/Vitest + React Testing Library), plus visual tests for critical components.
* **Accessibility pass**: add `aria-live` for async status and ensure modals/tabs fully meet WCAG 2.2.

---

## 🚀 Deploy

### Vercel

1. Import project → Framework: **Vite**
2. **Build command:** `npm run build`
3. **Output directory:** `dist`

---

## 📋 AI Usage Disclosure

See **PROMPTS.md** for the list of prompts, purposes, and affected files.

---

