import api from './api'
export const getCatalog = async () => (await api.get('/courses')).data
export const getCourseById = async (id) => (await api.get(`/courses/${id}`)).data
export const getRecommendations = async () => (await api.get('/recommendations')).data
