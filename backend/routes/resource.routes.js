import { Router } from 'express'
import { getResources } from '../controllers/resource.controller.js'

const router = Router()
router.get('/', getResources)
export default router
