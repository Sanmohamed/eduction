import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOverview } from '../../../backend/service api/admin.service'

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  )
}

function AdminCard({ title, text, to }) {
  return (
    <Link
      to={to}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{text}</p>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    publishedCourses: 0,
    enrollments: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    getAdminOverview()
      .then((res) => {
        if (!mounted) return
        setStats(res?.stats || {})
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load admin overview')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div>Loading dashboard...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Monitor users, courses, enrollments, and total platform revenue.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Users" value={stats.users} subtitle="Platform accounts" />
        <StatCard title="Courses" value={stats.courses} subtitle="All courses" />
        <StatCard title="Published" value={stats.publishedCourses} subtitle="Visible courses" />
        <StatCard title="Enrollments" value={stats.enrollments} subtitle="Student enrollments" />
        <StatCard title="Revenue" value={`$${Number(stats.revenue || 0).toLocaleString()}`} subtitle="Paid orders" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <AdminCard
          title="Users"
          text="Manage platform users, search accounts, ban/unban, and remove accounts."
          to="/admin/users"
        />
        <AdminCard
          title="Courses"
          text="Review, search, and delete courses with full moderation control."
          to="/admin/courses"
        />
        <AdminCard
          title="Payments"
          text="Track platform performance and revenue from paid orders."
          to="/admin/payments"
        />
      </div>
    </div>
  )
}