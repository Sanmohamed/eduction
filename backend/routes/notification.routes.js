import { Router } from "express";
import {
    getMyNotifications,
    markNotificationRead,
    markAllRead,
} from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/", getMyNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllRead);

export default router;