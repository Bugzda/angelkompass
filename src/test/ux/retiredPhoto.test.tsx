import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RetiredPhotoRoute } from '../../app/RetiredPhotoRoute'
import { SituationPage } from '../../features/situation/SituationPage'
import { removeRetiredPhotoData } from '../../app/removeRetiredPhotoData'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  sessionStorage.clear()
})
it('entfernt ausschließlich die Foto-Caches und den Foto-Wiederherstellungseintrag', async () => {
  sessionStorage.setItem('unrelated', 'keep')
  sessionStorage.setItem('angelkompass.photo-attempt.v1', 'old')
  const remove = vi.fn().mockResolvedValue(true)
  vi.stubGlobal('caches', { delete: remove })
  await removeRetiredPhotoData()
  expect(remove.mock.calls).toEqual([['angelkompass-photo-model-v1'], ['angelkompass-photo-runtime-v1']])
  expect(sessionStorage.getItem('unrelated')).toBe('keep')
  expect(sessionStorage.getItem('angelkompass.photo-attempt.v1')).toBeNull()
})
it('blockiert die App nicht, wenn ein Cache nicht gelöscht werden kann', async () => {
  vi.stubGlobal('caches', { delete: vi.fn().mockRejectedValue(new Error('Unavailable')) })
  await expect(removeRetiredPhotoData()).resolves.toBeUndefined()
})
it('führt alte Fotolinks zur passenden Bedingungseingabe ohne Foto-Einstieg', () => {
  render(
    <MemoryRouter initialEntries={['/neu/zander/foto']}>
      <Routes>
        <Route path="/neu/:fish/foto" element={<RetiredPhotoRoute />} />
        <Route path="/neu/:fish" element={<SituationPage />} />
      </Routes>
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'Was siehst du am Wasser?' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Uferfoto analysieren' })).not.toBeInTheDocument()
})
