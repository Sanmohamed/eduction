import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/common/CourseCard'
import { getCatalog, getRecommendations } from '../../backend/services/course.service'
import { getResources } from '../../backend/services/resource.service'

export default function HomePage() {
  const [courses, setCourses] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [resources, setResources] = useState([])

  useEffect(() => {
    getCatalog().then((data) => setCourses(data.courses || [])).catch(() => {})
    getRecommendations().then((data) => setRecommendations(data.courses || [])).catch(() => {})
    getResources().then((data) => setResources(data.resources || [])).catch(() => {})
  }, [])

  const quickCards = [
    { title: 'Resources Hub', description: 'Scholarships, tools, and certificates.', to: '/resources' },
    { title: 'Support & Complaints', description: 'Submit issues and track your complaints.', to: '/complaints' },
    { title: 'User Notifications', description: 'Track course, payment, and certificate updates.', to: '/notifications' },
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-14 text-white">
        <h1 className="max-w-3xl text-5xl font-black leading-tight">Build skills with a full learning platform</h1>
        <p className="mt-4 max-w-2xl text-lg text-blue-100">Students, instructors, resources, complaints, notifications, payments, certificates, wishlist, AI recommendations, and cloud video architecture.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickCards.map((item) => (
          <Link key={item.title} to={item.to} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-slate-600">{item.description}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Featured Courses</h2>
          <Link to="/catalog" className="text-sm font-semibold text-blue-600">View all</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.slice(0,6).map((course) => <CourseCard key={course._id} course={course} />)}</div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
          <Link to="/catalog" className="text-sm font-semibold text-blue-600">See more</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{recommendations.slice(0,6).map((course) => <CourseCard key={course._id} course={course} />)}</div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Latest Resources</h2>
          <Link to="/resources" className="text-sm font-semibold text-blue-600">Open resources</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.slice(0,3).map((resource) => (
            <div key={resource._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-blue-700">{resource.type}</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{resource.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
