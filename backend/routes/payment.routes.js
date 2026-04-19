import { Router } from 'express'
import { createPayment, confirmPayment, paymobWebhook } from '../controllers/payment.controller.js'
import { protect } from '../middleware/auth.js'
const router = Router();
router.post('/create', protect, createPayment);
router.post('/confirm', protect, confirmPayment);
router.post('/webhook', paymobWebhook);
export default router
