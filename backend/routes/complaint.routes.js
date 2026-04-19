import { Router } from 'express'
import { createComplaint, getMyComplaints,getAllComplaints,updateComplaint } from '../controllers/complaint.controller.js'
import { authRequired } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()
router.use(authRequired)
router.get('/', getMyComplaints)
router.get('/stats', authorize('admin'), getAllComplaints)
router.post('/', createComplaint)
router.put('/:id', authorize('admin'), updateComplaint)
export default router
