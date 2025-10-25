import { useRef, type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Anime } from '../api/jikan'
import { AspectRatio } from '../components/ui/aspect-ratio'
import { Star, Clapperboard, Calendar } from 'lucide-react'

export default function AnimeCard({ anime }: { anime: Anime }) {
  const img = anime.images?.jpg?.image_url
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement | null>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    const rx = ((y / r.height) - 0.5) * -7
    const ry = ((x / r.width) - 0.5) * 7
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }
  const onLeave = () => { if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0)' }

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = ref.current
    if (!el) return navigate(`/anime/${anime.mal_id}`)
    const r = el.getBoundingClientRect()
    const ghost = el.cloneNode(true) as HTMLElement
    Object.assign(ghost.style, {
      position: 'fixed', top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px`,
      margin: '0', transform: 'translate3d(0,0,0) scale(1)', transition: 'transform 260ms cubic-bezier(.2,.8,.2,1), opacity 260ms',
      zIndex: '60', pointerEvents: 'none', opacity: '1', willChange: 'transform',
    } as CSSStyleDeclaration)
    document.body.appendChild(ghost)
    const cx = innerWidth / 2, cy = innerHeight / 2
    const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2)
    requestAnimationFrame(() => { ghost.style.transform = `translate3d(${dx}px,${dy}px,0) scale(1.06)`; ghost.style.opacity = '0.96' })
    ghost.addEventListener('transitionend', () => { ghost.remove(); navigate(`/anime/${anime.mal_id}`) }, { once: true })
  }

  const chips: { icon: JSX.Element; text: string }[] = []
  if (typeof anime.score === 'number') chips.push({ icon: <Star className="size-3.5" />, text: anime.score.toString() })
  if (typeof anime.episodes === 'number') chips.push({ icon: <Clapperboard className="size-3.5" />, text: `${anime.episodes} ep` })
  if (typeof anime.year === 'number') chips.push({ icon: <Calendar className="size-3.5" />, text: `${anime.year}` })

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="group relative cursor-pointer select-none will-change-transform"
      title="Open details"
    >
      {/* conic neon ring (thin) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 50%, color-mix(in oklab, var(--ring) 55%, transparent), transparent 30%, color-mix(in oklab, var(--ring) 35%, transparent) 60%, transparent 100%)',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      {/* borderless — pure image with overlays */}
      <div className="relative rounded-2xl">
        <AspectRatio ratio={3 / 4}>
          {img
            ? <img src={img} alt={anime.title} className="absolute inset-0 h-full w-full rounded-2xl object-cover transition duration-500 group-hover:scale-[1.03]" />
            : <div className="absolute inset-0 grid place-items-center rounded-2xl bg-muted text-muted-foreground">No Image</div>
          }
        </AspectRatio>

        {/* top glass chips */}
        {chips.length > 0 && (
          <div className="absolute left-3 right-3 top-3 z-10 flex flex-wrap items-center gap-2">
            {chips.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-background/45 px-2 py-1 text-[11px] backdrop-blur"
              >
                {c.icon}{c.text}
              </span>
            ))}
          </div>
        )}

        {/* expanding title panel with hint */}
        <div
          className="absolute left-3 right-3 bottom-3 z-10 max-h-9 overflow-hidden rounded-xl border border-white/15
                     bg-background/60 px-3 py-2 backdrop-blur transition-all duration-300 group-hover:max-h-24"
        >
          <div className="line-clamp-1 text-sm font-semibold leading-5 group-hover:line-clamp-3">
            {anime.title}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Click to see details ↗
          </div>
        </div>
      </div>
    </div>
  )
}
