import { useEffect, useState } from 'react'
import {
    deleteAdminUser,
    getAdminUsers,
    toggleBanAdminUser,
} from '../../../backend/service api/admin.service'

export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState('')
    const [error, setError] = useState('')

    const loadUsers = async (searchValue = '') => {
        try {
            setLoading(true)
            setError('')
            const res = await getAdminUsers({ search: searchValue, page: 1, limit: 20 })
            setUsers(res?.users || [])
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
        loadUsers(search)
    }

    const handleDelete = async (id) => {
        const ok = window.confirm('Delete this user?')
        if (!ok) return

        try {
            setBusyId(id)
            await deleteAdminUser(id)
            setUsers((prev) => prev.filter((u) => u._id !== id))
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to delete user')
        } finally {
            setBusyId('')
        }
    }

    const handleToggleBan = async (id) => {
        try {
            setBusyId(id)
            const res = await toggleBanAdminUser(id)
            setUsers((prev) =>
                prev.map((u) => (u._id === id ? { ...u, isBanned: res.user.isBanned } : u))
            )
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to update user status')
        } finally {
            setBusyId('')
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                    Users Management
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Search users, ban or unban accounts, and remove users from the platform.
                </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
                <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                    Search
                </button>
            </form>

            {loading ? (
                <div>Loading users...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                                <th className="px-4 py-4 font-semibold text-slate-500">Name</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Email</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Role</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Status</th>
                                <th className="px-4 py-4 font-semibold text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{user.name}</td>
                                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                                    <td className="px-4 py-4">{user.role}</td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isBanned
                                                    ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                    : 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                                }`}
                                        >
                                            {user.isBanned ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleBan(user._id)}
                                                disabled={busyId === user._id}
                                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700"
                                            >
                                                {user.isBanned ? 'Unban' : 'Ban'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                disabled={busyId === user._id}
                                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                                            >
                                                Delete
                                            </button>
                                        </div>
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