import { useEffect, useState } from 'react'
import {
    deleteAdminCourse,
    getAdminCourses,
} from '../../../backend/service api/admin.service'

export default function CoursesAdminPage() {
    const [courses, setCourses] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState('')
    const [error, setError] = useState('')

    const loadCourses = async (searchValue = '') => {
        try {
            setLoading(true)
            setError('')
            const res = await getAdminCourses({ search: searchValue, page: 1, limit: 20 })
            setCourses(res?.courses || [])
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load courses')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCourses()
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
        loadCourses(search)
    }

    const handleDelete = async (id) => {
        const ok = window.confirm('Delete this course?')
        if (!ok) return

        try {
            setBusyId(id)
            await deleteAdminCourse(id)
            setCourses((prev) => prev.filter((c) => c._id !== id))
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to delete course')
        } finally {
            setBusyId('')
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    Courses Moderation
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Review courses, inspect instructors, and remove content when needed.
                </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by course title"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                    Search
                </button>
            </form>

            {loading ? (
                <div>Loading courses...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                                <th className="px-4 py-4 font-semibold text-slate-500">Course</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Instructor</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Status</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Price</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course._id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                                        {course.title}
                                    </td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                                        {course.instructor?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-4">{course.status}</td>
                                    <td className="px-4 py-4">${course.discountPrice || course.price || 0}</td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            disabled={busyId === course._id}
                                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}