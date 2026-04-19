import { Router } from "express";
import {
  getAdminOverview,
  getCoursesAdmin,
  getUsers,
  deleteUser,
  deleteCourse,
  toggleBanUser,
  getAdminPayments,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/overview", getAdminOverview);
router.get("/users", getUsers);
router.get("/courses", getCoursesAdmin);
router.get("/payments", getAdminPayments);

router.patch("/users/:id/toggle-ban", toggleBanUser);

router.delete("/users/:id", deleteUser);
router.delete("/courses/:id", deleteCourse);

export default router;