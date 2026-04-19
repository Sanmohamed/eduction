import { Router } from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
    enrollInCourse,
    markLectureComplete
} from '../controllers/enrollment.controller.js'

const router = Router()

router.post('/', protect, enrollInCourse)
router.patch('/complete-lecture', protect, markLectureComplete)

export default router