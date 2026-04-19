import { Router } from 'express'
import {
    addLecture,
    addSection,
    createCourse,
    getInstructorCourses,
    getInstructorStats,
    publishCourse
} from '../controllers/instructor.controller.js'
import { authorize, protect } from '../middleware/auth.js'
import uploadVideo from '../middleware/uploadVideo.js'

const router = Router()

router.use(protect, authorize('instructor', 'admin'))

router.get('/', getInstructorCourses)
router.get('/stats', getInstructorStats)

router.post('/', createCourse)
router.post('/:courseId/sections', addSection)
router.post('/:courseId/sections/:sectionId/lectures', uploadVideo.single('video'), addLecture)
router.patch('/:courseId/publish', publishCourse)

export default router