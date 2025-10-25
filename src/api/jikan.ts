const BASE = 'https://api.jikan.moe/v4'

export type Anime = {
  mal_id: number
  url: string
  images: { jpg?: { image_url?: string } }
  title: string
  score?: number
  episodes?: number
  synopsis?: string
  year?: number
}

export type SearchResponse = {
  data: Anime[]
  pagination: {
    last_visible_page: number
    has_next_page: boolean
    current_page?: number
    items?: { count: number; total: number; per_page: number }
  }
}

export async function searchAnime(q: string, page = 1, signal?: AbortSignal): Promise<SearchResponse> {
  const url = new URL(`${BASE}/anime`)
  if (q) url.searchParams.set('q', q)
  url.searchParams.set('page', String(page))
  url.searchParams.set('limit', '12') // server-side pagination
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}

export async function getAnimeById(id: string, signal?: AbortSignal): Promise<{ data: Anime }> {
  const res = await fetch(`${BASE}/anime/${id}`, { signal })
  if (!res.ok) throw new Error(`Detail failed: ${res.status}`)
  return res.json()
}
