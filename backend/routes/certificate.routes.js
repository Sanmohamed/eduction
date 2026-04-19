import { Router } from 'express'
import {
  createCertificate,
  getCertificate,
  getCertificateById,
  getUserCertificates,
  getCourseCertificates
} from '../controllers/certificate.controller.js'
import { protect, authorize } from '../middleware/auth.js'

const router = Router()

router.post('/', protect, authorize('admin', 'instructor'), createCertificate)

router.get('/by-id/:id', protect, getCertificateById)

router.get('/:userId/:courseId', protect, getCertificate)

router.get('/user/:userId', protect, getUserCertificates)

router.get('/course/:courseId', protect, authorize('admin', 'instructor'), getCourseCertificates)

export default router