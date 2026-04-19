
import api from './api'

export async function fetchCart() {
  const { data } = await api.get('/cart')
  return data
}

export async function addCartItem(courseId) {
  const { data } = await api.post('/cart/add', { courseId })
  return data
}

export async function removeCartItem(courseId) {
  const { data } = await api.delete(`/cart/remove/${courseId}`)
  return data
}

export async function clearCartRequest() {
  const { data } = await api.delete('/cart/clear')
  return data
}

export async function mergeCartRequest(items) {
  const { data } = await api.post('/cart/merge', { items })
  return data
}