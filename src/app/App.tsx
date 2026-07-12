import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { RecommendationPage } from '../features/recommendations/RecommendationPage'
import { SituationPage } from '../features/situation/SituationPage'
import { InventoryPage } from '../features/inventory/InventoryPage'
import { Layout } from '../ui/components/Layout'
import { SessionPage } from '../features/sessions/SessionPage'
import { SessionsPage } from '../features/sessions/SessionsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'neu', element: <SituationPage /> },
      { path: 'empfehlung', element: <RecommendationPage /> },
      { path: 'bestand', element: <InventoryPage /> },
      { path: 'session/:id', element: <SessionPage /> },
      { path: 'verlauf', element: <SessionsPage /> },
    ],
  },
], { basename: import.meta.env.BASE_URL })

export function App() {
  return <RouterProvider router={router} />
}
