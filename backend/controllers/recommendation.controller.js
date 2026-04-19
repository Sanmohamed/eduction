import Course from '../models/Course.js'
import { rankCoursesForUser } from '../services/recommendation.service.js'
export async function getRecommendations(req, res) { const courses = await Course.find({ status: 'published' }); const ranked = rankCoursesForUser(req.user || null, courses); res.json({ success: true, courses: ranked.slice(0, 12) }) }
