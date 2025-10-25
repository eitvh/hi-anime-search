import { Button } from '../components/ui/button'

type Props = {
  page: number
  totalPages: number
  onPage: (p: number) => void
  className?: string
}

export default function Pagination({ page, totalPages, onPage, className = '' }: Props) {
  if (totalPages <= 1) return null
  const go = (p: number) => { if (p >= 1 && p <= totalPages && p !== page) onPage(p) }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl active:scale-[.98]"
        disabled={page === 1}
        onClick={() => go(page - 1)}
      >
        Prev
      </Button>

      <div className="rounded-xl border bg-card/60 px-3 py-1 text-xs">
        Page <span className="font-semibold">{page}</span> / {totalPages}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="rounded-xl active:scale-[.98]"
        disabled={page === totalPages}
        onClick={() => go(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
