import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSearch, selectSearch, setQuery } from '../features/search/searchSlice'
import type { AppDispatch } from '../app/store'
import { Input } from '../components/ui/input'
import { X as XIcon } from 'lucide-react'

/** Promise shape we can call .abort() on (RTK thunks support this) */
type AbortablePromise = Promise<any> & { abort?: () => void }

const DEBOUNCE_MS = 250

export default function SearchBar() {
  const dispatch = useDispatch<AppDispatch>()
  const { q } = useSelector(selectSearch)
  const [local, setLocal] = useState(q)

  // Keep the latest in-flight dispatch to cancel it on new keystrokes
  const pendingRef = useRef<AbortablePromise | null>(null)
  // Debounce timer
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    // clear previous debounce
    if (timerRef.current) window.clearTimeout(timerRef.current)

    // schedule debounced search
    timerRef.current = window.setTimeout(() => {
      // cancel any in-flight request
      pendingRef.current?.abort?.()

      // update store query & fetch page 1
      dispatch(setQuery(local))
      pendingRef.current = dispatch(fetchSearch({ q: local, page: 1 })) as unknown as AbortablePromise
    }, DEBOUNCE_MS)

    // cleanup
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [local, dispatch])

  const clearSearch = () => {
    setLocal('')
    pendingRef.current?.abort?.()
    dispatch(setQuery(''))
    pendingRef.current = dispatch(fetchSearch({ q: '', page: 1 })) as unknown as AbortablePromise
  }

  return (
    <div className="relative">
      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0 opacity-70 blur-xl
                      bg-[radial-gradient(40%_20%_at_10%_0%,oklch(var(--chart-2))/18%,transparent_60%),radial-gradient(40%_20%_at_90%_0%,oklch(var(--chart-5))/12%,transparent_60%)]" />

      {/* gradient frame */}
      <div className="relative rounded-2xl p-[1px]
                      bg-[conic-gradient(from_180deg_at_50%_50%,oklch(var(--ring))/70%,transparent_30%,oklch(var(--ring))/40%_60%,transparent_100%)]">
        <div className="flex items-center gap-2 rounded-[calc(theme(borderRadius.2xl)-1px)]
                        border bg-card/80 px-2 py-2 backdrop-blur shadow-sm">
          {/* leading icon */}
          <span className="i-lucide-search size-5 opacity-70" aria-hidden />

          {/* input with clear (×) */}
          <div className="relative flex-1">
            <Input
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Find your next anime…"
              aria-label="Search anime"
              enterKeyHint="search"
              className="h-12 w-full border-0 bg-transparent pr-10 focus-visible:ring-0"
            />
            {local && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center
                           rounded-md p-2 text-muted-foreground transition hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
