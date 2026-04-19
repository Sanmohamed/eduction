import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getInstructorCourses,
  getInstructorStats
} from '../../../backend/service api/instructor.service'

function formatMonthLabel(monthValue) {
  if (!monthValue) return ''
  const [year, month] = String(monthValue).split('-')
  if (!year || !month) return monthValue
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      {subtitle && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  )
}

function RevenueCard({ revenue }) {
  return (
    <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm dark:border-green-500/20 dark:from-green-500/10 dark:to-emerald-500/10 dark:bg-slate-900">
      <p className="text-sm font-medium text-green-700 dark:text-green-400">
        Total Revenue
      </p>
      <h2 className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
        ${Number(revenue || 0).toLocaleString()}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Revenue generated from paid orders across your courses.
      </p>
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {course.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {course.status} • {course.totalLectures || 0} lectures
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${course.status === 'published'
              ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
            }`}
        >
          {course.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400">
        <div>Sections: {course.sections?.length || 0}</div>
        <div>Students: {course.enrolledCount || 0}</div>
      </div>
    </div>
  )
}

function SimpleBarChart({
  title,
  data,
  valueKey = 'revenue',
  labelKey = 'month',
  colorClass = 'bg-blue-600',
  formatLabel,
}) {
  const maxValue = Math.max(...data.map((item) => item[valueKey] || 0), 1)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No data yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map((item, index) => {
            const width = `${Math.max(((item[valueKey] || 0) / maxValue) * 100, 6)}%`
            return (
              <div key={`${item[labelKey]}-${index}`} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-slate-700 dark:text-slate-300">
                    {formatLabel ? formatLabel(item[labelKey]) : item[labelKey]}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${Number(item[valueKey] || 0).toLocaleString()}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${colorClass}`}
                    style={{ width }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TopCoursesTable({ items }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Courses</h3>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No top courses yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                <th className="pb-3 pr-4 font-semibold text-slate-500 dark:text-slate-400">Course</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500 dark:text-slate-400">Revenue</th>
                <th className="pb-3 pr-4 font-semibold text-slate-500 dark:text-slate-400">Students</th>
                <th className="pb-3 font-semibold text-slate-500 dark:text-slate-400">Lectures</th>
              </tr>
            </thead>
            <tbody>
              {items.map((course) => (
                <tr key={course.courseId} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">{course.title}</td>
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                    ${Number(course.revenue || 0).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{course.students || 0}</td>
                  <td className="py-3 text-slate-700 dark:text-slate-300">{course.lectures || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    revenue: 0,
    revenueByCourse: [],
    topCourses: [],
    monthlyRevenue: [],
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const [coursesRes, statsRes] = await Promise.all([
          getInstructorCourses(),
          getInstructorStats(),
        ])

        if (!mounted) return

        setCourses(coursesRes?.courses || [])
        setStats(
          statsRes?.stats || {
            totalCourses: 0,
            totalStudents: 0,
            revenue: 0,
            revenueByCourse: [],
            topCourses: [],
            monthlyRevenue: [],
          }
        )
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      mounted = false
    }
  }, [])

  const derivedStats = useMemo(() => {
    const publishedCourses = courses.filter((c) => c.status === 'published').length
    const draftCourses = courses.filter((c) => c.status !== 'published').length
    const totalLectures = courses.reduce((sum, c) => sum + (c.totalLectures || 0), 0)

    return {
      publishedCourses,
      draftCourses,
      totalLectures,
    }
  }, [courses])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Instructor Revenue Dashboard
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Track your courses, students, lectures, revenue trends, and top-performing content.
            </p>
          </div>

          <Link
            to="/instructor/create-course"
            className="inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Create New Course
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <>
          <RevenueCard revenue={stats.revenue} />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              subtitle="All created courses"
            />
            <StatCard
              title="Published"
              value={derivedStats.publishedCourses}
              subtitle="Visible to students"
            />
            <StatCard
              title="Students"
              value={stats.totalStudents}
              subtitle="Across all your courses"
            />
            <StatCard
              title="Lectures"
              value={derivedStats.totalLectures}
              subtitle="Across all courses"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SimpleBarChart
              title="Monthly Revenue"
              data={stats.monthlyRevenue || []}
              valueKey="revenue"
              labelKey="month"
              colorClass="bg-blue-600"
              formatLabel={formatMonthLabel}
            />

            <SimpleBarChart
              title="Revenue by Course"
              data={stats.revenueByCourse || []}
              valueKey="revenue"
              labelKey="title"
              colorClass="bg-emerald-600"
            />
          </div>

          <TopCoursesTable items={stats.topCourses || []} />

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Courses
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {courses.length} course{courses.length > 1 ? 's' : ''}
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No courses yet
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Start by creating your first course and building its sections and lectures.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}