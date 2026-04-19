import User from "../models/User.js";

export async function getWishlist(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .populate("wishlist");

    return res.json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch {
    return res.status(500).json({ success: false });
  }
}

export async function toggleWishlist(req, res) {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID required" });
    }

    const user = await User.findById(req.user._id);

    const exists = user.wishlist.some(id => id.toString() === courseId);

    if (exists) {
      user.wishlist.pull(courseId);
    } else {
      user.wishlist.push(courseId);
    }

    await user.save();

    return res.json({
      success: true,
      message: exists ? "Removed from wishlist" : "Added to wishlist",
    });
  } catch {
    return res.status(500).json({ success: false });
  }
}