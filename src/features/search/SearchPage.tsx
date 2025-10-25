import { useEffect, useRef, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSearch, selectSearch, setPage } from './searchSlice'
import type { AppDispatch } from '../../app/store'

import SearchBar from '../../components/SearchBar'
import AnimeCard from '../../components/AnimeCard'
import SkeletonCard from '../../components/SkeletonCard'
import Pagination from '../../components/Pagination'

import { Separator } from '../../components/ui/separator'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Button } from '../../components/ui/button'
import { Toaster } from '../../components/ui/sonner'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

type AbortablePromise = Promise<any> & { abort?: () => void }
type SortKey = 'score' | 'popularity' | 'year' | 'title'

export default function SearchPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { q, page, items, status, error, totalPages } = useSelector(selectSearch)
  const pendingRef = useRef<AbortablePromise | null>(null)
  const userSearchedRef = useRef(false)

  // Sort (client-side for the current page view)
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  // Initial load (popular)
  useEffect(() => {
    pendingRef.current = dispatch(fetchSearch({ q, page })) as unknown as AbortablePromise
    return () => pendingRef.current?.abort?.()
  }, [dispatch])

  // Fetch on page or query change (after first user search)
  useEffect(() => {
    if (!userSearchedRef.current && (!q || page === 1)) return
    pendingRef.current?.abort?.()
    pendingRef.current = dispatch(fetchSearch({ q, page })) as unknown as AbortablePromise
  }, [page, q])

  // Errors → sonner
  useEffect(() => {
    if (status === 'failed') {
      toast.error('Heads up', {
        description: error?.includes('429')
          ? 'Rate limit reached by the public API. Please wait a bit and retry.'
          : 'Search failed. Please try again.',
      })
    }
  }, [status, error])

  // Empty results toast (after user initiated)
  useEffect(() => {
    if (status !== 'loading' && q && items.length === 0) {
      userSearchedRef.current && toast('No results', { description: 'Try refining your keywords.' })
    }
  }, [status, q, items.length])

  // View state key for transitions
  const viewKey = useMemo(() => {
    if (status === 'loading') return 'loading'
    if (q && items.length === 0) return 'empty'
    return 'list'
  }, [status, q, items.length])

  // Sorted list for current page render
  const visible = useMemo(() => {
    const list = [...items].sort((a, b) => {
      const A = (sortKey === 'title' ? (a.title ?? '') : sortKey === 'year' ? (a.year ?? 0) : sortKey === 'popularity' ? (a.popularity ?? 0) : (a.score ?? 0))
      const B = (sortKey === 'title' ? (b.title ?? '') : sortKey === 'year' ? (b.year ?? 0) : sortKey === 'popularity' ? (b.popularity ?? 0) : (b.score ?? 0))
      if (A === B) return 0
      const cmp = (A > B ? 1 : -1)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [items, sortKey, sortDir])

  return (
    <div className="relative min-h-dvh">
      <Toaster richColors closeButton />

      {/* Ambient — stone palette */}
      <div
        className="absolute inset-0 -z-10 blur-2xl
                   bg-[radial-gradient(60%_35%_at_50%_-10%,oklch(var(--chart-4))/12%,transparent_70%),radial-gradient(35%_30%_at_0%_10%,oklch(var(--primary))/10%,transparent_60%),radial-gradient(35%_30%_at_100%_15%,oklch(var(--chart-2))/10%,transparent_60%)]"
      />

      {/* Header */}
      <header className="border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-[95rem] items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-primary to-chart-3" />
            <div className="text-base font-semibold tracking-tight">eitvh journal</div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-xl text-xs" title="GitHub">
              <a href="https://github.com/eitvh" target="_blank" rel="noreferrer">GitHub</a>
            </Button>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-6 w-6"><AvatarFallback>EV</AvatarFallback></Avatar>
              <span>eitvh</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[95rem] px-5 py-5">
        <div
          className="relative rounded-2xl border ring-1 ring-border/60 bg-card/80 p-4 md:p-5 backdrop-blur
                     transition-[box-shadow,transform] duration-300 ease-out
                     hover:shadow-[0_20px_50px_-24px_oklch(var(--ring))] hover:translate-y-[1px]"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full
                          bg-[conic-gradient(from_180deg,transparent,oklch(var(--ring)),transparent)] opacity-30 blur-2xl" />
          <h1
            className="pb-1.5 leading-[1.15] text-2xl md:text-3xl font-extrabold tracking-tight
                       bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent
                       drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]"
          >
            Search classic & trending anime
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Explore series, movies and specials.</p>

          {/* Search + Sort */}
          <div
            className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center"
            onClick={() => { userSearchedRef.current = true }}
          >
            <SearchBar />

            <div className="flex items-center gap-2">
              <Select
                value={`${sortKey}:${sortDir}`}
                onValueChange={(v) => {
                  const [k, d] = v.split(':') as [SortKey, 'asc' | 'desc']
                  setSortKey(k); setSortDir(d)
                }}
              >
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score:desc">Score ↓</SelectItem>
                  <SelectItem value="score:asc">Score ↑</SelectItem>
                  <SelectItem value="popularity:asc">Popularity ↑ (less popular)</SelectItem>
                  <SelectItem value="popularity:desc">Popularity ↓ (more popular)</SelectItem>
                  <SelectItem value="year:desc">Year ↓</SelectItem>
                  <SelectItem value="year:asc">Year ↑</SelectItem>
                  <SelectItem value="title:asc">Title A→Z</SelectItem>
                  <SelectItem value="title:desc">Title Z→A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-[95rem] px-5 pb-4">
        {/* Top bar with count (left) + separator + pagination (right) */}
        <div className="mb-3 flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            {q
              ? <>Showing <span className="font-medium">{Math.min(visible.length, 12)}</span> of <span className="font-medium">{visible.length}</span> results for <span className="font-medium">“{q}”</span></>
              : <>Trending & recent updates</>}
          </div>
          <div className="flex-1"><Separator /></div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPage={(p) => { userSearchedRef.current = true; dispatch(setPage(p)) }}
            className="justify-end"
          />
        </div>

        {/* Animated view switch */}
        <div key={viewKey} className="animate-in fade-in-50 zoom-in-95 duration-300">
          {viewKey === 'loading' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {viewKey === 'empty' && (
            <div
              className="rounded-2xl border bg-popover/60 p-8 text-center backdrop-blur
                         animate-in slide-in-from-top-2 duration-300"
            >
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border text-muted-foreground">
                🔎
              </div>
              <div className="text-sm font-medium">No results</div>
              <div className="text-xs text-muted-foreground">Try refining your keywords.</div>
            </div>
          )}

          {viewKey === 'list' && (
            <div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6
                         animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
            >
              {visible.slice(0, 12).map((a) => <AnimeCard key={a.mal_id} anime={a} />)}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-[95rem] px-5 py-4 text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} eitvh journal — Built for YoPrint challenge
        </div>
      </footer>
    </div>
  )
}
