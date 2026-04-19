import api from './api'
export const getInstructorCourses = async () => (await api.get('/instructor/courses')).data
export const getInstructorStats = async () => (await api.get('/instructor/stats')).data
export const createCourse = async (payload) => (await api.post('/instructor/courses', payload)).data
export const addSection = async (courseId, payload) => (await api.post(`/instructor/courses/${courseId}/sections`, payload)).data
export const addLecture = async (courseId, sectionId, formData) =>
  (await api.post(`/instructor/courses/${courseId}/sections/${sectionId}/lectures`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data
export const publishCourse = async (courseId) => (await api.patch(`/instructor/courses/${courseId}/publish`)).data