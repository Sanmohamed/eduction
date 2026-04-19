import { useEffect, useMemo, useState } from 'react'
import {
  addLecture,
  addSection,
  createCourse,
  getInstructorCourses,
  publishCourse
} from './../../../backend/service api/instructor.service'

const initialCourseForm = {
  title: '',
  subtitle: '',
  description: '',
  category: '',
  level: 'Beginner',
  language: 'Arabic',
  price: 0,
  discountPrice: 0,
  thumbnail: '',
}

const initialLectureForm = {
  title: '',
  description: '',
  durationInMinutes: 0,
  isPreview: false,
  video: null,
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  )
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

function StatusMessage({ type, message }) {
  if (!message) return null

  const styles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
      : 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400'

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles}`}>
      {message}
    </div>
  )
}

export default function CreateCoursePage() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')

  const [courseForm, setCourseForm] = useState(initialCourseForm)
  const [sectionTitle, setSectionTitle] = useState('')
  const [lectureForm, setLectureForm] = useState(initialLectureForm)

  const [loadingCourses, setLoadingCourses] = useState(true)
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [addingSection, setAddingSection] = useState(false)
  const [addingLecture, setAddingLecture] = useState(false)
  const [publishingId, setPublishingId] = useState('')

  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const inputCls =
    'w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50'

  const loadCourses = async () => {
    try {
      setLoadingCourses(true)
      const data = await getInstructorCourses()
      setCourses(data?.courses || [])
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load instructor courses.' })
    } finally {
      setLoadingCourses(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId),
    [courses, selectedCourseId]
  )

  const resetFeedback = () => setFeedback({ type: '', message: '' })

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    resetFeedback()

    if (!courseForm.title.trim() || !courseForm.description.trim() || !courseForm.category.trim()) {
      setFeedback({
        type: 'error',
        message: 'Title, description, and category are required.',
      })
      return
    }

    if (courseForm.description.trim().length < 20) {
      setFeedback({
        type: 'error',
        message: 'Description should be at least 20 characters.',
      })
      return
    }

    if (Number(courseForm.discountPrice) > Number(courseForm.price)) {
      setFeedback({
        type: 'error',
        message: 'Discount price cannot be greater than the original price.',
      })
      return
    }

    try {
      setCreatingCourse(true)
      const res = await createCourse({
        ...courseForm,
        price: Number(courseForm.price) || 0,
        discountPrice: Number(courseForm.discountPrice) || 0,
      })

      setCourseForm(initialCourseForm)
      setFeedback({
        type: 'success',
        message: res?.message || 'Course created successfully.',
      })
      await loadCourses()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to create course.',
      })
    } finally {
      setCreatingCourse(false)
    }
  }

  const handleAddSection = async (e) => {
    e.preventDefault()
    resetFeedback()

    if (!selectedCourseId) {
      setFeedback({ type: 'error', message: 'Please select a course first.' })
      return
    }

    if (!sectionTitle.trim()) {
      setFeedback({ type: 'error', message: 'Section title is required.' })
      return
    }

    try {
      setAddingSection(true)
      const res = await addSection(selectedCourseId, { title: sectionTitle.trim() })
      setSectionTitle('')
      setFeedback({
        type: 'success',
        message: res?.message || 'Section added successfully.',
      })
      await loadCourses()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to add section.',
      })
    } finally {
      setAddingSection(false)
    }
  }

  const handleAddLecture = async (e) => {
    e.preventDefault()
    resetFeedback()

    if (!selectedCourseId || !selectedSectionId) {
      setFeedback({
        type: 'error',
        message: 'Please select both a course and a section.',
      })
      return
    }

    if (!lectureForm.title.trim() || !lectureForm.video) {
      setFeedback({
        type: 'error',
        message: 'Lecture title and video are required.',
      })
      return
    }

    try {
      setAddingLecture(true)

      const fd = new FormData()
      Object.entries(lectureForm).forEach(([k, v]) => {
        if (k === 'video') {
          if (v) fd.append('video', v)
        } else {
          fd.append(k, v)
        }
      })

      const res = await addLecture(selectedCourseId, selectedSectionId, fd)
      setLectureForm(initialLectureForm)
      setFeedback({
        type: 'success',
        message: res?.message || 'Lecture added successfully.',
      })
      await loadCourses()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to add lecture.',
      })
    } finally {
      setAddingLecture(false)
    }
  }

  const handlePublish = async (courseId) => {
    resetFeedback()

    try {
      setPublishingId(courseId)
      const res = await publishCourse(courseId)
      setFeedback({
        type: 'success',
        message: res?.message || 'Course published successfully.',
      })
      await loadCourses()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to publish course.',
      })
    } finally {
      setPublishingId('')
    }
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Create & Manage Courses"
        subtitle="Create a new course, organize sections, upload lectures, and publish when ready."
      >
        <StatusMessage type={feedback.type} message={feedback.message} />
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Create Course" subtitle="Set the core course details first.">
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <Field label="Title">
              <input
                className={inputCls}
                placeholder="Course title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              />
            </Field>

            <Field label="Subtitle">
              <input
                className={inputCls}
                placeholder="Short subtitle"
                value={courseForm.subtitle}
                onChange={(e) => setCourseForm({ ...courseForm, subtitle: e.target.value })}
              />
            </Field>

            <Field label="Category">
              <input
                className={inputCls}
                placeholder="Category"
                value={courseForm.category}
                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
              />
            </Field>

            <Field label="Language">
              <input
                className={inputCls}
                placeholder="Language"
                value={courseForm.language}
                onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })}
              />
            </Field>

            <Field label="Thumbnail URL">
              <input
                className={inputCls}
                placeholder="https://..."
                value={courseForm.thumbnail}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
              />
            </Field>

            <Field label="Description">
              <textarea
                className={inputCls}
                rows="5"
                placeholder="Course description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Level">
                <select
                  className={inputCls}
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </Field>

              <Field label="Price">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="0"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                />
              </Field>

              <Field label="Discount Price">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="0"
                  value={courseForm.discountPrice}
                  onChange={(e) => setCourseForm({ ...courseForm, discountPrice: e.target.value })}
                />
              </Field>
            </div>

            <button
              disabled={creatingCourse}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingCourse ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </Panel>

        <Panel title="Sections & Lectures" subtitle="Build the course structure and upload content.">
          <div className="space-y-4">
            <Field label="Select Course">
              <select
                className={inputCls}
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value)
                  setSelectedSectionId('')
                }}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </Field>

            <form onSubmit={handleAddSection} className="flex flex-col gap-3 sm:flex-row">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Section title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
              />
              <button
                disabled={addingSection || !selectedCourseId}
                className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingSection ? 'Adding...' : 'Add Section'}
              </button>
            </form>

            <Field label="Select Section">
              <select
                className={inputCls}
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={!selectedCourseId}
              >
                <option value="">Select section</option>
                {selectedCourse?.sections?.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </Field>

            <form onSubmit={handleAddLecture} className="space-y-3">
              <input
                className={inputCls}
                placeholder="Lecture title"
                value={lectureForm.title}
                onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
              />

              <textarea
                className={inputCls}
                rows="4"
                placeholder="Lecture description"
                value={lectureForm.description}
                onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
              />

              <input
                type="number"
                className={inputCls}
                placeholder="Duration in minutes"
                value={lectureForm.durationInMinutes}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, durationInMinutes: e.target.value })
                }
              />

              <input
                type="file"
                accept="video/*"
                className={inputCls}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, video: e.target.files?.[0] || null })
                }
              />

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={lectureForm.isPreview}
                  onChange={(e) =>
                    setLectureForm({ ...lectureForm, isPreview: e.target.checked })
                  }
                />
                <span>Preview lecture</span>
              </label>

              <button
                disabled={addingLecture || !selectedCourseId || !selectedSectionId}
                className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingLecture ? 'Uploading...' : 'Add Lecture'}
              </button>
            </form>
          </div>
        </Panel>
      </div>

      <Panel title="My Courses" subtitle="Review current status and publish when ready.">
        {loadingCourses ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No courses created yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 lg:flex-row lg:items-center"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Status: {course.status} • Sections: {course.sections?.length || 0} • Lectures:{' '}
                    {course.totalLectures || 0}
                  </p>
                </div>

                <button
                  onClick={() => handlePublish(course._id)}
                  disabled={publishingId === course._id || course.status === 'published'}
                  className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {course.status === 'published'
                    ? 'Published'
                    : publishingId === course._id
                      ? 'Publishing...'
                      : 'Publish'}
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}