import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getCourseById } from '../../backend/service api/course.service'
import { markLectureComplete } from '../../backend/service api/enrollment.service'
import api from '../../backend/service api/api'

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className}`} />
}

export default function CoursePlayerPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const lectureId = searchParams.get('lecture')

  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const autoCompletedRef = useRef(false)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const [courseRes, enrollmentsRes] = await Promise.all([
          getCourseById(id),
          api.get('/enrollments/mine').catch(() => ({ data: { enrollments: [] } })),
        ])

        if (!mounted) return

        const loadedCourse = courseRes?.course || null
        const allEnrollments = enrollmentsRes?.data?.enrollments || []
        const myEnrollment =
          allEnrollments.find((e) => String(e.course?._id || e.course) === String(id)) || null

        setCourse(loadedCourse)
        setEnrollment(myEnrollment)
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load course player')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id])

  const flatLectures = useMemo(() => {
    if (!course?.sections) return []
    return course.sections.flatMap((section) =>
      (section.lectures || []).map((lecture) => ({
        ...lecture,
        sectionId: section._id,
        sectionTitle: section.title,
      }))
    )
  }, [course])

  const currentLecture = useMemo(() => {
    if (!flatLectures.length) return null
    return (
      flatLectures.find((lecture) => String(lecture._id) === String(lectureId)) ||
      flatLectures[0]
    )
  }, [flatLectures, lectureId])

  const currentLectureId = currentLecture?._id || null
  const completedLectures = enrollment?.completedLectures || []
  const isCurrentCompleted = currentLectureId
    ? completedLectures.includes(String(currentLectureId))
    : false

  const localProgress = useMemo(() => {
    if (!flatLectures.length) return 0
    return Math.min(
      100,
      Math.round((completedLectures.length / flatLectures.length) * 100)
    )
  }, [completedLectures, flatLectures])

  const effectiveProgress = enrollment?.progress ?? localProgress

  useEffect(() => {
    autoCompletedRef.current = false
  }, [currentLectureId])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const goToLecture = (nextId) => {
    if (!nextId) return
    navigate(`/courses/${id}/learn?lecture=${nextId}`)
  }

  const handleComplete = async (fromVideoEnd = false) => {
    if (!currentLectureId || completing) return
    if (isCurrentCompleted && fromVideoEnd) return
    if (isCurrentCompleted && !fromVideoEnd) {
      setToast('Lecture already completed')
      return
    }

    try {
      setCompleting(true)

      const res = await markLectureComplete({
        courseId: id,
        lectureId: currentLectureId,
      })

      setEnrollment((prev) => {
        if (!prev) return prev
        const nextCompleted = prev.completedLectures?.includes(String(currentLectureId))
          ? prev.completedLectures
          : [...(prev.completedLectures || []), String(currentLectureId)]

        return {
          ...prev,
          completedLectures: nextCompleted,
          progress: res.progress ?? prev.progress,
          completedAt: res.completed ? new Date().toISOString() : prev.completedAt,
        }
      })

      if (res.completed && res.certificate?._id) {
        setToast('Course completed! Redirecting to certificate...')
        setTimeout(() => {
          navigate(`/certificate/${res.certificate._id}`)
        }, 700)
        return
      }

      if (res.nextLectureId) {
        setToast('Lecture completed. Opening next lecture...')
        setTimeout(() => {
          goToLecture(res.nextLectureId)
        }, 500)
      } else {
        setToast('Lecture completed')
      }
    } catch (err) {
      setToast(err?.response?.data?.message || 'Failed to complete lecture')
    } finally {
      setCompleting(false)
    }
  }

  const handleVideoEnded = async () => {
    if (autoCompletedRef.current || isCurrentCompleted) return
    autoCompletedRef.current = true
    await handleComplete(true)
  }

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!course || !currentLecture) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        Lecture not found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-20 z-[80] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-slate-700">
          {toast}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
            {currentLecture.videoUrl ? (
              <video
                key={currentLectureId}
                src={currentLecture.videoUrl}
                controls
                onEnded={handleVideoEnded}
                className="aspect-video w-full"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-sm text-white/70">
                No video available
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-blue-600">
              {currentLecture.sectionTitle}
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {currentLecture.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {currentLecture.description || 'No lecture description available.'}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Course Progress
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {effectiveProgress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${effectiveProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => handleComplete(false)}
                disabled={completing || isCurrentCompleted}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCurrentCompleted
                  ? 'Completed'
                  : completing
                    ? 'Saving...'
                    : 'Mark as Completed'}
              </button>

              {isCurrentCompleted && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                  <CheckIcon />
                  This lecture is completed
                </span>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            Course Content
          </h2>

          <div className="max-h-[75vh] space-y-5 overflow-auto pr-1">
            {course.sections?.map((section) => (
              <div key={section._id} className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h3>

                <div className="space-y-2">
                  {section.lectures?.map((lecture) => {
                    const done = completedLectures.includes(String(lecture._id))
                    const active = String(lecture._id) === String(currentLectureId)

                    return (
                      <button
                        key={lecture._id}
                        onClick={() => goToLecture(lecture._id)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                            done
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {done ? <CheckIcon /> : <PlayIcon />}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {lecture.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {done ? 'Completed' : 'Not completed'}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}