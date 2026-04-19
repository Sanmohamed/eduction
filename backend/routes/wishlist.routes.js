import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getWishlist,
  toggleWishlist,
} from "../controllers/wishlist.controller.js";

const router = Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/", toggleWishlist);

export default router;