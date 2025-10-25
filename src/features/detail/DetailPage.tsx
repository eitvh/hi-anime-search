import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchDetail, selectDetail } from './detailSlice'
import type { AppDispatch } from '../../app/store'

import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Skeleton } from '../../components/ui/skeleton'
import { AspectRatio } from '../../components/ui/aspect-ratio'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip'
import { ScrollArea } from '../../components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Star, Calendar, Clapperboard, Clock, Users, Flame, Heart,
  BookOpen, ExternalLink, PlayCircle, TvMinimalPlay, Link as LinkIcon,
  ArrowUpRight, Film, ArrowLeft
} from 'lucide-react'

type AbortablePromise = Promise<any> & { abort?: () => void }

type CharacterEdge = {
  character: { mal_id?: number; name: string; images?: { jpg?: { image_url?: string } } }
  role?: string
  favorites?: number
}
type Review = { review: string; score?: number; date?: string; user?: { username?: string } }
type StreamingSite = { name: string; url: string }
type Recommendation = { entry?: { mal_id: number; title: string; images?: { jpg?: { image_url?: string } } } }

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { item, status, error } = useSelector(selectDetail)
  const pendingRef = useRef<AbortablePromise | null>(null)

  // ensure top on route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }, [id])

  // local data per-tab
  const [chars, setChars] = useState<CharacterEdge[] | null>(null)
  const [charsStatus, setCharsStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle')
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [reviewsStatus, setReviewsStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle')
  const [streams, setStreams] = useState<StreamingSite[] | null>(null)
  const [streamsStatus, setStreamsStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle')
  const [recs, setRecs] = useState<Recommendation[] | null>(null)
  const [recsStatus, setRecsStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle')
  const aborters = useRef<{ c?: AbortController; r?: AbortController; s?: AbortController; rc?: AbortController }>({})

  useEffect(() => {
    if (!id) return
    pendingRef.current?.abort?.()
    pendingRef.current = dispatch(fetchDetail({ id })) as unknown as AbortablePromise
    return () => pendingRef.current?.abort?.()
  }, [id, dispatch])

  const fetchJSON = (url: string, key: 'c'|'r'|'s'|'rc') =>
    new Promise<any>((resolve, reject) => {
      aborters.current[key]?.abort()
      const ac = new AbortController()
      aborters.current[key] = ac
      fetch(url, { signal: ac.signal })
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 429) {
              toast.error('Rate limit reached', {
                description: 'The public API is throttling. You can reload the page.',
                action: { label: 'Reload', onClick: () => window.location.reload() },
              })
            }
            throw new Error(String(res.status))
          }
          resolve(await res.json())
        })
        .catch((e) => { if (e?.name !== 'AbortError') reject(e) })
    })

  // fetch per section
  useEffect(() => {
    if (!id) return
    setCharsStatus('loading')
    fetchJSON(`https://api.jikan.moe/v4/anime/${id}/characters?limit=24`, 'c')
      .then(j => { setChars(j.data as CharacterEdge[]); setCharsStatus('success') })
      .catch(() => setCharsStatus('failed'))
    return () => aborters.current.c?.abort()
  }, [id])
  useEffect(() => {
    if (!id) return
    setReviewsStatus('loading')
    fetchJSON(`https://api.jikan.moe/v4/anime/${id}/reviews?limit=48`, 'r')
      .then(j => { setReviews(j.data as Review[]); setReviewsStatus('success') })
      .catch(() => setReviewsStatus('failed'))
    return () => aborters.current.r?.abort()
  }, [id])
  useEffect(() => {
    if (!id) return
    setStreamsStatus('loading')
    fetchJSON(`https://api.jikan.moe/v4/anime/${id}/streaming`, 's')
      .then(j => { setStreams(j.data as StreamingSite[]); setStreamsStatus('success') })
      .catch(() => setStreamsStatus('failed'))
    return () => aborters.current.s?.abort()
  }, [id])
  useEffect(() => {
    if (!id) return
    setRecsStatus('loading')
    fetchJSON(`https://api.jikan.moe/v4/anime/${id}/recommendations?limit=20`, 'rc')
      .then(j => { setRecs(j.data as Recommendation[]); setRecsStatus('success') })
      .catch(() => setRecsStatus('failed'))
    return () => aborters.current.rc?.abort()
  }, [id])

  // header chips
  const chips = useMemo(() => {
    const out: { icon: JSX.Element; text: string }[] = []
    if (item?.score != null) out.push({ icon: <Star className="size-3.5" />, text: String(item.score) })
    if (item?.episodes != null) out.push({ icon: <Clapperboard className="size-3.5" />, text: `${item.episodes} ep` })
    if (item?.year != null) out.push({ icon: <Calendar className="size-3.5" />, text: String(item.year) })
    return out
  }, [item])

  const metaBadges = useMemo(() => {
    if (!item) return [] as { icon: JSX.Element; label: string }[]
    return ([
      item.type ? { icon: <Film className="size-3.5" />, label: item.type } : null,
      item.status ? { icon: <Flame className="size-3.5" />, label: item.status } : null,
      item.duration ? { icon: <Clock className="size-3.5" />, label: item.duration } : null,
      item.rating ? { icon: <BookOpen className="size-3.5" />, label: item.rating } : null,
    ].filter(Boolean)) as { icon: JSX.Element; label: string }[]
  }, [item])

  const derived = useMemo(() => {
    if (!item) return { img: undefined as string | undefined, genres: [] as string[], themes: [] as string[], studios: [] as string[], producers: [] as string[] }
    const img = item.images?.jpg?.image_url as string | undefined
    const genres = (item.genres || []).map((g: any) => g?.name).filter(Boolean)
    const themes = (item.themes || []).map((g: any) => g?.name).filter(Boolean)
    const studios = (item.studios || []).map((s: any) => s?.name).filter(Boolean)
    const producers = (item.producers || []).map((s: any) => s?.name).filter(Boolean)
    return { img, genres, themes, studios, producers }
  }, [item])

  const [synOpen, setSynOpen] = useState(false)

  // characters pagination (10/page)
  const [charPage, setCharPage] = useState(1)
  const [charAll, setCharAll] = useState(false)
  const charPageSize = 10
  const charItems = useMemo(() => {
    const arr = chars || []
    if (charAll) return arr
    const start = (charPage - 1) * charPageSize
    return arr.slice(start, start + charPageSize)
  }, [chars, charAll, charPage])
  const charTotalPages = useMemo(() => Math.max(1, Math.ceil((chars?.length || 0) / charPageSize)), [chars])

  // reviews pagination (4/page)
  const [revPage, setRevPage] = useState(1)
  const [revAll, setRevAll] = useState(false)
  const revPageSize = 4
  const revItems = useMemo(() => {
    const arr = reviews || []
    if (revAll) return arr
    const start = (revPage - 1) * revPageSize
    return arr.slice(start, start + revPageSize)
  }, [reviews, revAll, revPage])
  const revTotalPages = useMemo(() => Math.max(1, Math.ceil((reviews?.length || 0) / revPageSize)), [reviews])

  // controlled tabs for smoother animation
  const [tab, setTab] = useState<'overview' | 'characters' | 'reviews' | 'streaming' | 'trailer' | 'recs'>('overview')

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-[95rem] p-6">
        <Skeleton className="mb-6 h-9 w-40 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <div className="md:col-span-2 space-y-3">
            <Skeleton className="h-10 w-2/3 rounded-xl" />
            <Skeleton className="h-6 w-56 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    toast.error('Detail failed', {
      description: String(error || 'Unknown error'),
      action: { label: 'Reload', onClick: () => window.location.reload() },
    })
    return (
      <div className="mx-auto max-w-[95rem] p-6">
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-destructive">
          <div className="font-semibold">Something went wrong</div>
          <div className="text-sm/6 opacity-90">{String(error)}</div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button asChild variant="secondary" className="rounded-xl">
            <Link to="/"><ArrowLeft className="mr-1 size-4" /> Back to posts</Link>
          </Button>
          <Button onClick={() => window.location.reload()} className="rounded-xl text-white">
            Reload
          </Button>
        </div>
      </div>
    )
  }

  if (!item) return null
  const { img, genres, themes, studios, producers } = derived

  const hasChars = charsStatus === 'success' && !!chars && chars.length > 0
  const hasReviews = reviewsStatus === 'success' && !!reviews && reviews.length > 0
  const hasStreams = streamsStatus === 'success' && !!streams && streams.length > 0
  const hasTrailer = !!item?.trailer?.embed_url
  const hasRecs = recsStatus === 'success' && !!recs && recs.length > 0

  const tabs = [
    { key: 'overview', label: 'Overview', show: true },
    { key: 'characters', label: 'Characters', show: hasChars || charsStatus === 'loading' },
    { key: 'reviews', label: 'Reviews', show: hasReviews || reviewsStatus === 'loading' },
    { key: 'streaming', label: 'Streaming', show: hasStreams || streamsStatus === 'loading' },
    { key: 'trailer', label: 'Trailer', show: hasTrailer },
    { key: 'recs', label: 'Recommendations', show: hasRecs || recsStatus === 'loading' },
  ] as const

  return (
    <div className="relative min-h-dvh">
      {img && (
        <div className="absolute inset-x-0 top-0 h-[22dvh] overflow-hidden">
          <img src={img} alt="" className="h-full w-full scale-110 object-cover opacity-20 blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background backdrop-blur-2xl" />
        </div>
      )}

      <div className={`relative mx-auto max-w-[95rem] p-6 ${img ? 'pt-[16dvh]' : ''}`}>
        <div className="mb-4 flex items-center justify-between">
          <Button asChild variant="secondary" className="rounded-xl active:scale-[.98]">
            <Link to="/"><ArrowLeft className="mr-1 size-4" /> Back to posts</Link>
          </Button>
          <div className="text-xs text-muted-foreground">eitvh journal</div>
        </div>

        <article className="rounded-3xl border bg-card/70 backdrop-blur animate-in fade-in-50 duration-300">
          <div className="grid gap-6 p-4 md:grid-cols-3 md:p-6">
            {/* Poster + CTAs */}
            <div className="md:col-span-1">
              <div className="overflow-hidden rounded-2xl border">
                <AspectRatio ratio={3 / 4}>
                  {img ? (
                    <img src={img} alt={item.title} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
                  ) : <div className="grid h-full w-full place-items-center text-muted-foreground">No Image</div>}
                </AspectRatio>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="secondary" className="rounded-xl text-foreground active:scale-[.98]">
                  <a href={item.url} target="_blank" rel="noreferrer">Open on MyAnimeList <ExternalLink className="ml-2 size-4" /></a>
                </Button>
                <Button variant="default" asChild className="rounded-xl text-white active:scale-[.98]">
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(item.title + ' anime')}`} target="_blank" rel="noreferrer">
                    More results <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Right */}
            <div className="md:col-span-2">
              <header className="space-y-3">
                <h1 className="pb-1 text-3xl font-extrabold leading-[1.15] tracking-tight md:text-4xl bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                  {item.title}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {chips.map((c, i) => (
                    <Badge key={i} variant="outline" className="rounded-full">{c.icon}{c.text}</Badge>
                  ))}
                </div>
              </header>

              <Separator className="my-4" />

              <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
                {/* LIGHT tabs, smooth selection, no blue */}
                <TabsList className="rounded-xl border bg-muted/20 p-1 backdrop-blur">
                  {tabs.filter(t => t.show).map(t => (
                    <TabsTrigger
                      key={t.key}
                      value={t.key}
                      className="rounded-lg px-3 py-1.5 text-sm text-foreground/70 transition
                                 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
                                 hover:text-foreground focus-visible:ring-0"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* OVERVIEW */}
                <TabsContent
                  value="overview"
                  className="mt-4 transition-[opacity,transform] duration-300 data-[state=inactive]:pointer-events-none
                             data-[state=inactive]:-translate-y-2 data-[state=inactive]:opacity-0
                             data-[state=active]:translate-y-0 data-[state=active]:opacity-100"
                >
                  <Card className="border-0 bg-popover/60 animate-in fade-in-50 duration-300">
                    <CardContent className="p-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><BookOpen className="size-4" /> Synopsis</h2>
                          <button
                            className="w-full rounded-xl border bg-muted/30 px-4 py-4 text-left backdrop-blur transition-colors hover:bg-muted/50 active:scale-[.99]"
                            onClick={() => setSynOpen(true)}
                          >
                            <p className="font-serif leading-7 tracking-[.005em] text-foreground">
                              {item.synopsis || 'No synopsis available.'}
                            </p>
                            <div className="mt-2 text-xs text-muted-foreground">Click to read full synopsis</div>
                          </button>
                        </div>

                        <div className="space-y-4">
                          {metaBadges.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {metaBadges.map((m, i) => (
                                <Badge key={i} variant="secondary" className="rounded-full">{m.icon}{m.label}</Badge>
                              ))}
                            </div>
                          )}
                          {genres.length > 0 && <MetaRow title="Genres" items={genres} />}
                          {themes.length > 0 && <MetaRow title="Themes" items={themes} />}
                          {studios.length > 0 && <MetaRow title="Studios" items={studios} />}
                          {producers.length > 0 && <MetaRow title="Producers" items={producers} />}

                          <div>
                            <div className="mb-2 text-sm font-semibold text-muted-foreground">Stats</div>
                            <div className="flex flex-wrap gap-2">
                              {typeof item.rank === 'number' && <Badge variant="outline" className="rounded-full"># Rank {item.rank}</Badge>}
                              {typeof item.popularity === 'number' && <Badge variant="outline" className="rounded-full"><Users className="mr-1 size-3.5" /> Pop {item.popularity}</Badge>}
                              {typeof item.favorites === 'number' && <Badge variant="outline" className="rounded-full"><Heart className="mr-1 size-3.5" /> Fav {item.favorites}</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* CHARACTERS */}
                <TabsContent
                  value="characters"
                  className="mt-4 transition-[opacity,transform] duration-300 data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-2
                             data-[state=active]:opacity-100 data-[state=active]:translate-y-0"
                >
                  {charsStatus === 'loading' && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-[220px] w-full rounded-2xl" />
                      ))}
                    </div>
                  )}

                  {charsStatus === 'success' && chars && (
                    <>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                          Showing {charAll ? chars.length : charItems.length} of {chars.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl active:scale-[.98]" onClick={() => setCharAll(v => !v)}>
                            {charAll ? 'Show pages' : 'Show all'}
                          </Button>
                          {!charAll && (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl active:scale-[.98]" onClick={() => setCharPage(p => Math.max(1, p - 1))} disabled={charPage === 1}>Prev</Button>
                              <div className="rounded-xl border bg-card/60 px-3 py-1 text-xs">Page {charPage} / {charTotalPages}</div>
                              <Button variant="outline" size="sm" className="rounded-xl active:scale-[.98]" onClick={() => setCharPage(p => Math.min(charTotalPages, p + 1))} disabled={charPage === charTotalPages}>Next</Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {charItems.map((c, i) => {
                          const src = c.character?.images?.jpg?.image_url
                          return (
                            <div key={`${c.character?.name}-${i}`} className="group relative overflow-hidden rounded-2xl">
                              <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 hidden flex-wrap items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 xl:flex">
                                {c.role && (
                                  <Badge variant="outline" className="rounded-xl border-white/15 bg-background/50 px-2 py-1 text-[11px] backdrop-blur">
                                    <Flame className="mr-1 size-3.5" /> {c.role}
                                  </Badge>
                                )}
                                {typeof c.favorites === 'number' && (
                                  <Badge variant="secondary" className="rounded-xl px-2 py-1 text-[11px]">
                                    <Heart className="mr-1 size-3.5" /> {c.favorites}
                                  </Badge>
                                )}
                              </div>

                              <AspectRatio ratio={2.6/4}>
                                {src
                                  ? <img src={src} alt={c.character?.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                                  : <div className="absolute inset-0 grid place-items-center text-muted-foreground">No Image</div>}
                              </AspectRatio>

                              <div className="absolute left-3 right-3 bottom-3 max-h-9 overflow-hidden rounded-xl border border-white/15 bg-background/60 px-3 py-2 backdrop-blur transition-all duration-300 group-hover:max-h-20">
                                <div className="line-clamp-1 text-sm font-medium">{c.character?.name}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* REVIEWS */}
                <TabsContent
                  value="reviews"
                  className="mt-4 transition-[opacity,transform] duration-300 data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-2
                             data-[state=active]:opacity-100 data-[state=active]:translate-y-0"
                >
                  {reviewsStatus === 'loading' && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-40 w-full rounded-2xl" />))}
                    </div>
                  )}

                  {reviewsStatus === 'success' && reviews && (
                    <>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                          Showing {revAll ? reviews.length : revItems.length} of {reviews.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl active:scale-[.98]" onClick={() => setRevAll(v => !v)}>
                            {revAll ? 'Show pages' : 'Show all'}
                          </Button>
                          {!revAll && (
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl active:scale-[.98]" onClick={() => setRevPage(p => Math.max(1, p - 1))} disabled={revPage === 1}>Prev</Button>
                              <div className="rounded-xl border bg-card/60 px-3 py-1 text-xs">Page {revPage} / {revTotalPages}</div>
                              <Button variant="outline" size="sm" className="rounded-xl active:scale-[.98]" onClick={() => setRevPage(p => Math.min(revTotalPages, p + 1))} disabled={revPage === revTotalPages}>Next</Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {revItems.map((r, i) => {
                          const preview = r.review.length > 260 ? r.review.slice(0, 260) + '…' : r.review
                          const who = r.user?.username || 'Anonymous'
                          const when = r.date ? new Date(r.date).toLocaleDateString() : null

                          return (
                            <Card key={i} className="relative overflow-hidden rounded-2xl border bg-card/70 transition hover:shadow-lg active:scale-[.99]">
                              <CardContent className="p-4">
                                <Dialog>
                                  <TooltipProvider delayDuration={120}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                          <button
                                            aria-label="Read full review"
                                            className="absolute right-2 top-2 inline-flex items-center rounded-lg border bg-background/70 p-1.5 text-muted-foreground backdrop-blur transition hover:text-foreground"
                                          >
                                            <ArrowUpRight className="size-4" />
                                          </button>
                                        </DialogTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent className="rounded-xl">Read full review</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-base">{who}{r.score != null ? ` • ${r.score}/10` : ''}{when ? ` • ${when}` : ''}</DialogTitle>
                                    </DialogHeader>
                                    <div className="max-h-[65vh] overflow-auto whitespace-pre-wrap text-[15px] leading-7">
                                      {r.review}
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <div className="mb-2">
                                  <div className="text-sm font-semibold">{who}{r.score != null ? ` • ${r.score}/10` : ''}</div>
                                  {when && <div className="text-xs text-muted-foreground">{when}</div>}
                                </div>

                                <p className="text-sm italic leading-6 text-foreground/90">{preview}</p>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* STREAMING */}
                <TabsContent
                  value="streaming"
                  className="mt-4 transition-[opacity,transform] duration-300 data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-2
                             data-[state=active]:opacity-100 data-[state=active]:translate-y-0"
                >
                  {streamsStatus === 'loading' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full rounded-2xl" />))}
                    </div>
                  )}

                  {streamsStatus === 'success' && streams && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {streams.map((s, i) => (
                        <div
                          key={`${s.name}-${i}`}
                          className="relative overflow-hidden rounded-2xl border bg-card/70 p-[1px]"
                          style={{
                            background:
                              'conic-gradient(from 0deg at 50% 50%, color-mix(in oklab, var(--ring) 45%, transparent), transparent 25%, color-mix(in oklab, var(--ring) 30%, transparent) 65%, transparent 100%)'
                          }}
                        >
                          <Card className="rounded-[calc(theme(borderRadius.2xl)-1px)] bg-background/70 backdrop-blur">
                            <CardContent className="flex items-center gap-3 p-4">
                              <div className="grid size-10 place-items-center rounded-full border bg-background/60 shadow-sm">
                                {providerLogo(s.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{s.name}</div>
                                <div className="text-xs text-muted-foreground">Official streaming link</div>
                              </div>
                              <Button asChild size="sm" variant="secondary" className="ml-auto rounded-xl text-foreground active:scale-[.98]">
                                <a href={s.url} target="_blank" rel="noreferrer">Open <ExternalLink className="ml-1 size-3.5" /></a>
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* TRAILER */}
                <TabsContent
                  value="trailer"
                  className="mt-4 transition-[opacity,transform] duration-300 data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-2
                             data-[state=active]:opacity-100 data-[state=active]:translate-y-0"
                >
                  <Card className="overflow-hidden rounded-2xl border bg-card/70">
                    <AspectRatio ratio={16 / 9}>
                      <iframe
                        src={item.trailer!.embed_url!}
                        title={`${item.title} Trailer`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </AspectRatio>
                  </Card>
                </TabsContent>

                {/* RECOMMENDATIONS */}
                <TabsContent
                  value="recs"
                  className="mt-4 transition-[opacity,transform] duration-300 data-[state=inactive]:opacity-0 data-[state=inactive]:translate-y-2
                             data-[state=active]:opacity-100 data-[state=active]:translate-y-0"
                >
                  {recsStatus === 'loading' && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      {Array.from({ length: 10 }).map((_, i) => (<Skeleton key={i} className="h-[220px] w-full rounded-2xl" />))}
                    </div>
                  )}

                  {recsStatus === 'success' && recs && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      {recs.slice(0, 15).map((r, i) => {
                        const e = r.entry; if (!e) return null
                        const src = e.images?.jpg?.image_url
                        return (
                          <div
                            key={`${e.mal_id}-${i}`}
                            className="group relative cursor-pointer select-none overflow-hidden rounded-2xl transition will-change-transform hover:scale-[1.02] active:scale-[.99]"
                            onClick={() => navigate(`/anime/${e.mal_id}`)}
                            title={`Open ${e.title}`}
                          >
                            <div className="absolute left-3 right-3 top-3 z-10">
                              <div className="max-h-9 overflow-hidden rounded-xl border border-white/15 bg-background/60 px-3 py-2 backdrop-blur transition-all duration-300 group-hover:max-h-20">
                                <div className="line-clamp-1 text-sm font-medium">{e.title}</div>
                              </div>
                            </div>
                            <AspectRatio ratio={3/4}>
                              {src
                                ? <img src={src} alt={e.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                                : <div className="absolute inset-0 grid place-items-center text-muted-foreground">No Image</div>}
                            </AspectRatio>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </article>
      </div>

      {/* Synopsis modal — sticky header (title + "Synopsis"), normal modal */}
      <Dialog open={synOpen} onOpenChange={setSynOpen}>
        <DialogContent className="max-w-3xl [&>button.absolute.right-4.top-4]:hidden">

          <div className="sticky top-0 z-10 rounded-t-xl bg-background/95 pb-2 pt-1 backdrop-blur">
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl font-bold">{item?.title}</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground">Synopsis</div>
          </div>

          <ScrollArea className="max-h[70vh] max-h-[70vh] rounded-md border bg-background/60 p-4">
            <div className="prose max-w-none leading-7 [text-wrap:pretty]">
              {item?.synopsis || 'No synopsis available.'}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- helpers ---------- */

function MetaRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((t) => (<Badge key={t} variant="outline" className="rounded-full">{t}</Badge>))}
      </div>
    </div>
  )
}

function providerLogo(name: string) {
  const n = name.toLowerCase()
  if (n.includes('crunch')) return (
    <svg viewBox="0 0 256 256" className="size-6" aria-label="Crunchyroll"><path fill="#F47521" d="M128 21c59 0 107 48 107 107s-48 107-107 107A107 107 0 0 1 73 57a90 90 0 0 1 125 125 75 75 0 1 0-53-128Z"/></svg>
  )
  if (n.includes('netflix')) return (
    <svg viewBox="0 0 512 512" className="size-6" aria-label="Netflix"><path fill="#E50914" d="M96 32h64l160 384V32h64v448h-64L160 96v384H96z"/></svg>
  )
  if (n.includes('prime') || n.includes('amazon')) return (
    <svg viewBox="0 0 448 448" className="size-6" aria-label="Prime Video"><path fill="#00A8E1" d="M224 64a160 160 0 1 1 0 320a160 160 0 0 1 0-320Z"/><path fill="#fff" d="M120 241c50 25 99 25 207 0l-26 29c-77 19-131 19-155 0l-26-29Z"/></svg>
  )
  if (n.includes('hulu')) return (
    <svg viewBox="0 0 512 512" className="size-6" aria-label="Hulu"><path fill="#1CE783" d="M64 192h64v192H64zm128 0h64v96h64v96h-64v-96h-64v96h-64V192h64zm192 0h64v192h-64z"/></svg>
  )
  if (n.includes('disney')) return (
    <svg viewBox="0 0 512 512" className="size-6" aria-label="Disney+"><path fill="#113CCF" d="M64 320c96-160 352-160 448 0c-96-80-352-80-448 0Z"/></svg>
  )
  if (n.includes('youtube')) return (
    <svg viewBox="0 0 576 512" className="size-6" aria-label="YouTube"><path fill="#FF0000" d="M549.7 124.1c-6.3-23.6-24.8-42.1-48.3-48.4C458.8 64 288 64 288 64S117.2 64 74.6 75.7c-23.6 6.3-42 24.8-48.3 48.4C14.7 166.7 14.7 256 14.7 256s0 89.3 11.6 131.9c6.3 23.6 24.8 42.1 48.3 48.4C117.2 448 288 448 288 448s170.8 0 213.4-11.7c23.6-6.3 42-24.8 48.3-48.4C561.3 345.3 561.3 256 561.3 256s0-89.3-11.6-131.9z"/><path fill="#fff" d="M232 338V174l142 82z"/></svg>
  )
  if (n.includes('tv') || n.includes('play')) return <TvMinimalPlay className="size-6" />
  if (n.includes('watch') || n.includes('video')) return <PlayCircle className="size-6" />
  return <LinkIcon className="size-6" />
}
