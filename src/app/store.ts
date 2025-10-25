import { configureStore } from '@reduxjs/toolkit'
import searchReducer from '../features/search/searchSlice'
import detailReducer from '../features/detail/detailSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    detail: detailReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
