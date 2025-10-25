import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { getAnimeById, type Anime } from '../../api/jikan'

type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

export const fetchDetail = createAsyncThunk<{ data: Anime }, { id: string }>(
  'detail/fetch',
  async ({ id }, thunkAPI) => getAnimeById(id, thunkAPI.signal)
)

type DetailState = {
  status: Status
  error?: string
  item?: Anime
}

const initialState: DetailState = { status: 'idle' }

const detailSlice = createSlice({
  name: 'detail',
  initialState,
  reducers: { clear: () => initialState },
  extraReducers: builder => {
    builder
      .addCase(fetchDetail.pending, s => { s.status = 'loading'; s.error = undefined })
      .addCase(fetchDetail.fulfilled, (s, a) => { s.status = 'succeeded'; s.item = a.payload.data })
      .addCase(fetchDetail.rejected, (s, a) => {
        if (a.error.name === 'AbortError') return
        s.status = 'failed'; s.error = a.error.message || 'Unknown error'
      })
  }
})

export const { clear } = detailSlice.actions
export default detailSlice.reducer
export const selectDetail = (s: RootState) => s.detail
