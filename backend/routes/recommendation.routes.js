import { Router } from 'express'
import { getRecommendations } from '../controllers/recommendation.controller.js'
import { protect } from '../middleware/auth.js'
const router = Router();
router.get('/', (req, res, next) => { const auth = req.headers.authorization; if (!auth) return getRecommendations({ ...req, user: null }, res); return protect(req, res, () => getRecommendations(req, res, next)) })
export default router
