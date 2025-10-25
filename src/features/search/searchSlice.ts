import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { searchAnime, type SearchResponse } from '../../api/jikan'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

export const fetchSearch = createAsyncThunk<
  SearchResponse,
  { q: string; page: number }
>(
  'search/fetch',
  async ({ q, page }, thunkAPI) => {
    // RTK wires abort -> thunkAPI.signal
    return await searchAnime(q, page, thunkAPI.signal)
  }
)

type SearchState = {
  q: string
  page: number
  status: Status
  error?: string
  items: SearchResponse['data']
  totalPages: number
  hasNext: boolean
  lastRequestId?: string
}

const initialState: SearchState = {
  q: '',
  page: 1,
  status: 'idle',
  items: [],
  totalPages: 1,
  hasNext: false,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.q = action.payload
      state.page = 1 // reset page when query changes
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    reset(state) {
      Object.assign(state, initialState)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSearch.pending, (state, action) => {
        state.status = 'loading'
        state.error = undefined
        state.lastRequestId = action.meta.requestId
      })
      .addCase(fetchSearch.fulfilled, (state, action) => {
        if (state.lastRequestId !== action.meta.requestId) return
        state.status = 'succeeded'
        state.items = action.payload.data
        const p = action.payload.pagination
        state.totalPages = p.last_visible_page ?? 1
        state.hasNext = !!p.has_next_page
      })
      .addCase(fetchSearch.rejected, (state, action) => {
        if (action.error.name === 'AbortError') return // ignore aborted
        state.status = 'failed'
        state.error = action.error.message || 'Unknown error'
      })
  }
})

export const { setQuery, setPage, reset } = searchSlice.actions
export default searchSlice.reducer

export const selectSearch = (s: RootState) => s.search
