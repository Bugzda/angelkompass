// Remove only disposable data belonging to the retired feature.
export async function removeRetiredPhotoData() {
  try {
    sessionStorage.removeItem('angelkompass.photo-attempt.v1')
  } catch {
    /* Storage can be unavailable. */
  }
  if (typeof caches === 'undefined') return
  await Promise.allSettled(
    ['angelkompass-photo-model-v1', 'angelkompass-photo-runtime-v1'].map(name => caches.delete(name)),
  )
}
