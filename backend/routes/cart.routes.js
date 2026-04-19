import { Router } from 'express'
import { protect } from '../middleware/authMiddleware.js'

import {
    getCart,
    addToCart,
    updateCart,
    removeFromCart,
    clearCart,
    mergeCartOnLogin
} from '../controllers/cart.controller.js'

const router = Router()

router.get("/", protect, getCart)
router.post("/add", protect, addToCart)
router.put("/update", protect, updateCart)
router.delete("/remove/:courseId", protect, removeFromCart)
router.delete("/clear", protect, clearCart)
router.post("/merge", protect, mergeCartOnLogin)

export default router