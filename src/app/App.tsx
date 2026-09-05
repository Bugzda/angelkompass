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
import { NotFoundPage, RouteError } from '../ui/components/RouteError'
import { RetiredPhotoRoute } from './RetiredPhotoRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'neu', element: <SpeciesPage /> },
      { path: 'neu/:fish', element: <SituationPage /> },
      { path: 'neu/:fish/foto', element: <RetiredPhotoRoute /> },
      { path: 'empfehlung', element: <RecommendationPage /> },
      { path: 'bestand', element: <InventoryPage /> },
      { path: 'session/:id', element: <SessionPage /> },
      { path: 'session/:id/karte', element: <WaterCardPage /> },
      { path: 'verlauf', element: <SessionsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
], { basename: import.meta.env.BASE_URL })

export function App() {
  return <RouterProvider router={router} />
}
