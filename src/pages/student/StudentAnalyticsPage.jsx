import { useEffect, useMemo, useState } from 'react'
import api from '../../../backend/service api/api'

export default function StudentAnalyticsPage() {
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    api.get('/enrollments/mine').then((res) => {
      setEnrollments(res.data.enrollments || [])
    })
  }, [])

  const avgProgress = useMemo(() => {
    if (!enrollments.length) return 0
    return Math.round(
      enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
    )
  }, [enrollments])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Student Analytics
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Track your courses, completion, and overall consistency.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Enrolled Courses</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {enrollments.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Average Progress</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {avgProgress}%
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Completed Courses</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {enrollments.filter((e) => e.progress === 100).length}
          </h2>
        </div>
      </div>
    </div>
  )
}