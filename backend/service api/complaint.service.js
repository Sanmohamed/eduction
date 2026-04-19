import api from './api'

export async function getMyComplaints() {
  const { data } = await api.get('/complaints')
  return data
}

export async function createComplaint(payload) {
  const { data } = await api.post('/complaints', payload)
  return data
}
