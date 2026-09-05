import { Navigate, useLocation, useParams } from 'react-router-dom'

export function RetiredPhotoRoute() {
  const { fish } = useParams()
  const { state } = useLocation()
  return <Navigate to={`/neu/${fish}`} state={state} replace/>
}
