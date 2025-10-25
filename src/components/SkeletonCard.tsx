import { Card } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { AspectRatio } from './ui/aspect-ratio'

export default function SkeletonCard() {
  return (
    <Card className="overflow-hidden rounded-2xl border bg-card/80 backdrop-blur">
      <div className="relative p-3">
        <AspectRatio ratio={3 / 4}>
          <div className="absolute inset-0 rounded-2xl border border-border/70 ring-1 ring-border/40 overflow-hidden bg-background/40">
            <Skeleton className="h-full w-full" />
          </div>
        </AspectRatio>

        <div className="absolute left-4 right-4 top-4 flex gap-2">
          <Skeleton className="h-6 w-14 rounded-xl" />
          <Skeleton className="h-6 w-16 rounded-xl" />
          <Skeleton className="h-6 w-12 rounded-xl" />
        </div>

        <div className="absolute left-4 right-4 bottom-4">
          <div className="rounded-xl border border-white/15 bg-background/55 px-3 py-2 backdrop-blur">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        </div>
      </div>
    </Card>
  )
}
