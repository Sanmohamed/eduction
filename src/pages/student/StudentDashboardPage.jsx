import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getRecommendations } from '../../../backend/service api/course.service'
import api from '../../../backend/service api/api'

const SchoolIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
)

const CertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
)

const BadgeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.6L12 15l-4.9 2.5.9-5.6L4 8l5.6-1.2z" />
  </svg>
)

const FireIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A5.5 5.5 0 1 0 19 18c0-1.5-.5-2.5-1.5-3.5-1.1-1.1-1.5-2.2-1.5-3.5 0-1.9.8-3.4 1-4-.9.4-3 1.4-4.2 3.1-1-1.9-.8-4.1-.8-5.1-1.6 1-5 4.1-5 9 0 .7.1 1.4.3 2" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const ForumIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

function StatCard({ icon, label, value, iconBg, iconColor }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
      </div>
      <p className="text-4xl font-bold text-slate-900 dark:text-slate-50">
        {value ?? '—'}
      </p>
    </div>
  )
}

function ProgressRing({ pct = 0 }) {
  const safePct = Math.max(0, Math.min(100, pct))
  const dash = `${safePct}, 100`

  return (
    <div className="relative h-40 w-40">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="stroke-slate-200 dark:stroke-slate-700"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeWidth="3"
        />
        <path
          className="stroke-blue-600"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          strokeDasharray={dash}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{safePct}%</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Overall</p>
      </div>
    </div>
  )
}

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className}`} />
}

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [enrollments, setEnrollments] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.all([
      api.get('/enrollments/mine').catch(() => ({ data: { enrollments: [] } })),
      getRecommendations().catch(() => ({ courses: [] })),
      api.get('/notifications?limit=3').catch(() => ({ data: { notifications: [] } })),
      api.get('/users/stats').catch(() => ({ data: null })),
      user?._id
        ? api.get(`/certificates/user/${user._id}`).catch(() => ({ data: { certificates: [] } }))
        : Promise.resolve({ data: { certificates: [] } }),
    ])
      .then(([enrRes, recRes, notifRes, statsRes, certRes]) => {
        if (!mounted) return

        setEnrollments(enrRes.data.enrollments ?? [])
        setRecommendations(recRes.courses ?? [])
        setNotifications(notifRes.data.notifications ?? [])
        setStats(statsRes.data)
        setCertificates(certRes.data.certificates ?? [])
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [user?._id])

  const learningStreak = stats?.learningStreak ?? user?.learningStreak ?? 0
  const coursesInProgress =
    stats?.coursesInProgress ??
    enrollments.filter((e) => (e.progress ?? 0) < 100).length
  const certificatesEarned = stats?.certificatesEarned ?? certificates.length
  const badgesUnlocked = stats?.badgesUnlocked ?? 0
  const overallProgress =
    stats?.overallProgress ??
    (enrollments.length
      ? Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0) /
            enrollments.length
        )
      : 0)

  const activeCourses = useMemo(
    () =>
      [...enrollments]
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 3),
    [enrollments]
  )

  const notifIcon = (type) => {
    if (type === 'grade') {
      return { icon: <CheckIcon />, bg: 'bg-green-500/20', text: 'text-green-500' }
    }
    if (type === 'deadline') {
      return { icon: <CalIcon />, bg: 'bg-blue-500/20', text: 'text-blue-500' }
    }
    return { icon: <ForumIcon />, bg: 'bg-purple-500/20', text: 'text-purple-500' }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50">
          Welcome back, {user?.name?.split(' ')[0] ?? 'Student'}!
        </h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-400">
          Here's your personal dashboard to track your learning journey and stay on top of your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<SchoolIcon />}
              label="Courses in Progress"
              value={loading ? '…' : coursesInProgress}
              iconBg="bg-blue-600/10"
              iconColor="text-blue-600"
            />
            <StatCard
              icon={<CertIcon />}
              label="Certificates Earned"
              value={loading ? '…' : certificatesEarned}
              iconBg="bg-green-500/20"
              iconColor="text-green-500"
            />
            <StatCard
              icon={<BadgeIcon />}
              label="Badges Unlocked"
              value={loading ? '…' : badgesUnlocked}
              iconBg="bg-amber-500/20"
              iconColor="text-amber-500"
            />
            <StatCard
              icon={<FireIcon />}
              label="Learning Streak"
              value={loading ? '…' : `${learningStreak} days`}
              iconBg="bg-purple-500/20"
              iconColor="text-purple-500"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Certificates
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              to="/student/certificates"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View Certificates
            </Link>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Continue Learning</h3>
              <Link to="/catalog" className="text-sm font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                    <Skeleton className="h-16 w-24 flex-shrink-0 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-10 w-20 flex-shrink-0 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : activeCourses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  You haven't enrolled in any courses yet.
                </p>
                <Link
                  to="/catalog"
                  className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
                >
                  Browse catalog
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeCourses.map((enr) => (
                  <div key={enr._id} className="flex items-center gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                    {enr.course?.thumbnail ? (
                      <div
                        className="h-16 w-24 flex-shrink-0 rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${enr.course.thumbnail})` }}
                      />
                    ) : (
                      <div className="h-16 w-24 flex-shrink-0 rounded-md bg-slate-200 dark:bg-slate-700" />
                    )}

                    <div className="min-w-0 flex-1 flex-col gap-1.5">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                        {enr.course?.title ?? 'Untitled Course'}
                      </p>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${enr.progress ?? 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {enr.progress ?? 0}% complete
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/courses/${enr.course?._id}`)}
                      className="flex h-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Recommended Courses</h3>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No recommendations yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {recommendations.slice(0, 2).map((course) => (
                  <div key={course._id} className="flex flex-col gap-3">
                    {course.thumbnail ? (
                      <div
                        className="h-32 w-full rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${course.thumbnail})` }}
                      />
                    ) : (
                      <div className="h-32 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
                    )}

                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {course.title}
                    </h4>
                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                      {course.description}
                    </p>
                    <button
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="flex h-9 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Enroll Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">My Progress</h3>
            <div className="flex items-center justify-center py-4">
              {loading ? <Skeleton className="h-40 w-40 rounded-full" /> : <ProgressRing pct={overallProgress} />}
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Great job! You're making excellent progress. Keep up the momentum to reach your learning goals.
            </p>
            <Link
              to="/student/certificates"
              className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              View Certificates
            </Link>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Notifications</h3>
              <Link to="/notifications" className="text-sm font-medium text-blue-600 hover:underline">
                See all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No notifications yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {notifications.map((n) => {
                  const { icon, bg, text } = notifIcon(n.type)
                  return (
                    <div key={n._id} className="flex gap-4">
                      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
                        {icon}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {n.timeAgo ?? n.createdAt}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}