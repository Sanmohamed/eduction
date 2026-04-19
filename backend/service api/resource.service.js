import api from './api'

export async function getResources(params = {}) {
  const { data } = await api.get('/resources', { params })
  return data
}
