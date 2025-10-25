import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SearchPage from '../src/features/search/SearchPage'
import DetailPage from '../src/features/detail/DetailPage'

const router = createBrowserRouter([
  { path: '/', element: <SearchPage /> },
  { path: '/anime/:id', element: <DetailPage /> },
])

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
