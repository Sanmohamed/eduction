import Cart from "../models/Cart.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";


export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate("items.course");

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        return res.json({
            success: true,
            cart,
        });
    } catch {
        return res.status(500).json({ success: false });
    }
};


export const addToCart = async (req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);

        if (!course || course.status !== "published") {
            return res.status(400).json({
                success: false,
                message: "Course not available",
            });
        }

        if (course.instructor.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot add your own course",
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        // 🔥 لو مفيش cart
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [{ course: courseId }],
            });

            return res.json({
                success: true,
                message: "Added to cart",
            });
        }

        // 🔥 check exists
        const exists = cart.items.some(
            (item) => item.course.toString() === courseId.toString()
        );

        if (exists) {
            return res.json({
                success: true,
                message: "Already in cart",
            });
        }

        // 🔥 check enrollment
        const alreadyEnrolled = await Enrollment.findOne({
            user: req.user._id,
            course: courseId,
        });

        if (alreadyEnrolled) {
            return res.status(400).json({
                success: false,
                message: "Already enrolled in this course",
            });
        }

        // 🔥 add course
        cart.items.push({ course: courseId });
        await cart.save();

        return res.json({
            success: true,
            message: "Added to cart",
        });

    } catch {
        return res.status(500).json({ success: false });
    }
};

// ❌ remove from cart
export const removeFromCart = async (req, res) => {
    try {
        const { courseId } = req.params;

        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { items: { course: courseId } } }

        );

        return res.json({
            success: true,
            message: "Removed from cart",
        });

    } catch {
        return res.status(500).json({ success: false });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.json({ success: true });

        cart.items = [];
        await cart.save();
        return res.json({
            success: true,
            message: "Cart cleared",
        });
    } catch {
        return res.status(500).json({ success: false });
    }
};

export const getCartDetails = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.course");

        if (!cart) {
            return res.json({
                success: true,
                cart: { items: [] },
                total: 0,
            });
        }

        const total = cart.items.reduce((sum, item) => {
            const course = item.course;
            return sum + (course.discountPrice || course.price);
        }, 0);

        return res.json({
            success: true,
            cart,
            total,
        });

    } catch {
        return res.status(500).json({ success: false });
    }
};

export const updateCart = async (req, res) => {
    try {
        const { items } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });
        const validCourses = await Course.find({ _id: { $in: items }, status: "published" });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: validCourses.map(course => ({ course: course._id })),
            });
        } else {
            cart.items = validCourses.map(course => ({ course: course._id }));
        }
        await cart.save();

        return res.json({
            success: true,
            message: "Cart updated",
        });

    } catch {
        return res.status(500).json({ success: false });
    }
};
export const mergeCartOnLogin = async (req, res) => {
  try {
    const { items = [] } = req.body

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: items.map(id => ({ course: id }))
      })
    } else {
      const existing = cart.items.map(i => i.course.toString())

      const newItems = items.filter(
        id => !existing.includes(id.toString())
      )

      cart.items.push(...newItems.map(id => ({ course: id })))
      await cart.save()
    }

    const populatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.course')

    return res.json({
      success: true,
      cart: populatedCart,
      message: 'Cart merged successfully',
    })

  } catch (error) {
    console.error("Merge error:", error)

    return res.status(500).json({
      success: false,
      message: 'Failed to merge cart',
    })
  }
}