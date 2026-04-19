import { useEffect, useState } from 'react'
import CourseCard from '../components/common/CourseCard'
import { getCatalog } from '../../backend/service api/course.service'

export default function CatalogPage() {
  const [courses, setCourses] = useState([])
  useEffect(() => { getCatalog().then((data) => setCourses(data.courses || [])) }, [])
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Course Catalog</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map((course) => <CourseCard key={course._id} course={course} />)}</div>
    </div>
  )
}
