import api from "./api";

export async function fetchWishlist() {
  const { data } = await api.get('/wishlist')
  return data
}

export async function toggleWishlistItem(courseId) {
  const { data } = await api.post('/wishlist', { courseId })
  return data
}
 