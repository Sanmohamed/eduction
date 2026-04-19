import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCourseById } from '../../backend/service api/course.service'
import { enrollInCourse } from '../../backend/service api/enrollment.service'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import api from '../../backend/service api/api'

export default function CourseDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const { addToCart } = useCart()
  const { toggleWishlist } = useWishlist()

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const [courseRes, enrollmentRes] = await Promise.all([
          getCourseById(id),
          api.get('/enrollments/mine').catch(() => ({ data: { enrollments: [] } })),
        ])

        if (!mounted) return

        setCourse(courseRes?.course || null)

        const mine = enrollmentRes?.data?.enrollments || []
        const enrolled = mine.some(
          (e) => String(e.course?._id || e.course) === String(id)
        )
        setIsEnrolled(enrolled)
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

  const firstLectureId = course?.sections?.[0]?.lectures?.[0]?._id || null

  const handleStartLearning = async () => {
    try {
      setEnrolling(true)

      if (!isEnrolled) {
        await enrollInCourse(id)
        setIsEnrolled(true)
      }

      if (firstLectureId) {
        navigate(`/courses/${id}/learn?lecture=${firstLectureId}`)
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to start learning')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!course) return <div>Course not found</div>

  const price = course.discountPrice || course.price

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            {course.title}
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            {course.subtitle || course.description}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Course Content
          </h2>

          <div className="space-y-4">
            {course.sections?.map((section) => (
              <div key={section._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {section.lectures?.map((lecture) => (
                    <li key={lecture._id}>▶ {lecture.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <img
          src={course.thumbnail || 'https://placehold.co/600x350?text=Course'}
          alt={course.title}
          className="aspect-video w-full rounded-2xl object-cover"
        />

        <div className="mt-5 space-y-4">
          <p className="text-3xl font-black text-blue-700 dark:text-blue-400">
            ${price}
          </p>

          <button
            onClick={handleStartLearning}
            disabled={enrolling || !firstLectureId}
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enrolling
              ? 'Starting...'
              : isEnrolled
                ? 'Continue Learning'
                : 'Start Learning'}
          </button>

          {!isEnrolled && (
            <>
              <button
                onClick={() => addToCart(course)}
                className="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white"
              >
                Add to cart
              </button>

              <button
                onClick={() => toggleWishlist(course)}
                className="w-full rounded-xl border border-slate-200 p-3 font-semibold dark:border-slate-800"
              >
                Add to wishlist
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}