import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSearch, selectSearch, setQuery } from '../features/search/searchSlice'
import type { AppDispatch } from '../app/store'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Search as SearchIcon, X as XIcon } from 'lucide-react'

type AbortablePromise = Promise<any> & { abort?: () => void }

export default function SearchBar() {
  const dispatch = useDispatch<AppDispatch>()
  const { q } = useSelector(selectSearch)
  const [local, setLocal] = useState(q)

  const performSearch = () => {
    dispatch(setQuery(local))
    ;(dispatch(fetchSearch({ q: local, page: 1 })) as unknown as AbortablePromise)
  }

  const clearSearch = () => {
    setLocal('')
    dispatch(setQuery(''))
    ;(dispatch(fetchSearch({ q: '', page: 1 })) as unknown as AbortablePromise)
  }

  return (
    <div className="relative">
      {/* glow field */}
      <div className="pointer-events-none absolute inset-0 opacity-70 blur-xl
                      bg-[radial-gradient(40%_20%_at_10%_0%,oklch(var(--chart-2))/18%,transparent_60%),radial-gradient(40%_20%_at_90%_0%,oklch(var(--chart-5))/12%,transparent_60%)]" />

      {/* gradient frame */}
      <div className="relative rounded-2xl p-[1px] bg-[conic-gradient(from_180deg_at_50%_50%,oklch(var(--ring))/70%,transparent_30%,oklch(var(--ring))/40%_60%,transparent_100%)]">
        <form
          className="flex items-center gap-2 rounded-[calc(theme(borderRadius.2xl)-1px)] border bg-card/80 px-2 py-2 backdrop-blur shadow-sm"
          onSubmit={(e) => { e.preventDefault(); performSearch() }}
        >
          <span className="i-lucide-search size-5 opacity-70" aria-hidden />

          {/* input + clear (×) inside */}
          <div className="relative flex-1">
            <Input
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Find your next anime…"
              aria-label="Search anime"
              className="h-12 w-full border-0 bg-transparent pr-16 focus-visible:ring-0"
            />
            {local && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground transition"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>

          {/* kbd hint */}
          <div className="hidden items-center gap-1 rounded-lg border bg-background/60 px-2 py-1 text-xs text-muted-foreground backdrop-blur md:flex">
            Press <kbd className="rounded border bg-muted/70 px-1.5 py-0.5 text-[11px] font-medium">Enter</kbd>
          </div>

          <Button type="submit" className="h-10 gap-2 rounded-xl text-white">
            <SearchIcon className="size-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
