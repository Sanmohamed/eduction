import api from './api'

export const getAdminOverview = async () =>
    (await api.get('/admin/overview')).data

export const getAdminUsers = async (params = {}) =>
    (await api.get('/admin/users', { params })).data

export const getAdminCourses = async (params = {}) =>
    (await api.get('/admin/courses', { params })).data

export const getAdminPayments = async (params = {}) =>
    (await api.get('/admin/payments', { params })).data

export const deleteAdminUser = async (id) =>
    (await api.delete(`/admin/users/${id}`)).data

export const deleteAdminCourse = async (id) =>
    (await api.delete(`/admin/courses/${id}`)).data

export const toggleBanAdminUser = async (id) =>
    (await api.patch(`/admin/users/${id}/toggle-ban`)).data