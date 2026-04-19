import api from './api'

export const createCertificate = async (payload) =>
  (await api.post('/certificates', payload)).data

export const getCertificate = async (userId, courseId) =>
  (await api.get(`/certificates/${userId}/${courseId}`)).data

export const getCertificateById = async (id) =>
  (await api.get(`/certificates/by-id/${id}`)).data

export const getUserCertificates = async (userId) =>
  (await api.get(`/certificates/user/${userId}`)).data

export const getCourseCertificates = async (courseId) =>
  (await api.get(`/certificates/course/${courseId}`)).data