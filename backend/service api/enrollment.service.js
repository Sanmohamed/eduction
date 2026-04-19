import api from './api'

export const enrollInCourse = async (courseId) =>
  (await api.post('/enrollments', { courseId })).data

export const markLectureComplete = async (payload) =>
  (await api.patch('/enrollments/complete-lecture', payload)).data