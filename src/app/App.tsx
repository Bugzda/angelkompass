import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { RecommendationPage } from '../features/recommendations/RecommendationPage'
import { SituationPage } from '../features/situation/SituationPage'
import { InventoryPage } from '../features/inventory/InventoryPage'
import { Layout } from '../ui/components/Layout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'neu', element: <SituationPage /> },
      { path: 'empfehlung', element: <RecommendationPage /> },
      { path: 'bestand', element: <InventoryPage /> },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}
