import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { Anime, SearchResponse } from '../../api/jikan'

export type SearchState = {
  q: string
  page: number
  items: Anime[]
  totalPages: number
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string
}

const initialState: SearchState = {
  q: '',
  page: 1,
  items: [],
  totalPages: 1,
  status: 'idle',
}

/** Abortable search thunk (uses thunkAPI.signal) */
export const fetchSearch = createAsyncThunk<
  SearchResponse,
  { q: string; page: number }
>(
  'search/fetchSearch',
  async ({ q, page }, thunkAPI) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    params.set('page', String(page))

    const res = await fetch(`https://api.jikan.moe/v4/anime?${params.toString()}`, {
      signal: thunkAPI.signal,
    })
    if (!res.ok) throw new Error(String(res.status))

    const json = (await res.json()) as SearchResponse
    return json
  }
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.q = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    reset() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearch.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(fetchSearch.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data ?? []
        state.totalPages = Math.max(
          1,
          action.payload.pagination?.last_visible_page ?? 1
        )
      })
      .addCase(fetchSearch.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          (action.error?.message && `Search failed: ${action.error.message}`) ||
          'Search failed'
      })
  },
})

export const { setQuery, setPage, reset } = searchSlice.actions
export const selectSearch = (state: RootState) => state.search
export default searchSlice.reducer
