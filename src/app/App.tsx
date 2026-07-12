import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { RecommendationPage } from '../features/recommendations/RecommendationPage'
import { SituationPage } from '../features/situation/SituationPage'
import { InventoryPage } from '../features/inventory/InventoryPage'
import { Layout } from '../ui/components/Layout'
import { SessionPage } from '../features/sessions/SessionPage'
import { SessionsPage } from '../features/sessions/SessionsPage'
import { SpeciesPage } from '../features/situation/SpeciesPage'
import { WaterCardPage } from '../features/sessions/WaterCardPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'neu', element: <SpeciesPage /> },
      { path: 'neu/:fish', element: <SituationPage /> },
      { path: 'empfehlung', element: <RecommendationPage /> },
      { path: 'bestand', element: <InventoryPage /> },
      { path: 'session/:id', element: <SessionPage /> },
      { path: 'session/:id/karte', element: <WaterCardPage /> },
      { path: 'verlauf', element: <SessionsPage /> },
    ],
  },
], { basename: import.meta.env.BASE_URL })

export function App() {
  return <RouterProvider router={router} />
}
