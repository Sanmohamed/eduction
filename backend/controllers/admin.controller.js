import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

export async function getAdminOverview(req, res) {
    try {
        const [users, courses, publishedCourses, enrollments, revenueData] =
            await Promise.all([
                User.countDocuments(),
                Course.countDocuments(),
                Course.countDocuments({ status: "published" }),
                Enrollment.countDocuments(),
                Order.aggregate([
                    { $match: { status: "paid" } },
                    { $group: { _id: null, total: { $sum: "$amount" } } },
                ]),
            ]);

        const totalRevenue = revenueData[0]?.total || 0;

        return res.json({
            success: true,
            stats: {
                users,
                courses,
                publishedCourses,
                enrollments,
                revenue: totalRevenue,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch overview",
            error: error.message,
        });
    }
}

export async function getUsers(req, res) {
    try {
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
        const search = String(req.query.search || "").trim();

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments(query);

        return res.json({
            success: true,
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });
    }
}

export async function getCoursesAdmin(req, res) {
    try {
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
        const search = String(req.query.search || "").trim();

        const query = search
            ? { title: { $regex: search, $options: "i" } }
            : {};

        const courses = await Course.find(query)
            .populate("instructor", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Course.countDocuments(query);

        return res.json({
            success: true,
            courses,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
            error: error.message,
        });
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Cannot delete admin user",
            });
        }

        await Enrollment.deleteMany({ user: user._id });
        await Cart.deleteMany({ user: user._id });
        await Order.deleteMany({ user: user._id });
        await user.deleteOne();

        return res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message,
        });
    }
}

export async function deleteCourse(req, res) {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        await Course.findByIdAndDelete(courseId);
        await Enrollment.deleteMany({ course: courseId });
        await Cart.updateMany(
            { "items.course": courseId },
            { $pull: { items: { course: courseId } } }
        );

        return res.json({
            success: true,
            message: "Course deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete course",
            error: error.message,
        });
    }
}

export async function toggleBanUser(req, res) {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Cannot ban admin user",
            });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        return res.json({
            success: true,
            message: user.isBanned ? "User banned successfully" : "User unbanned successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to toggle user status",
            error: error.message,
        });
    }
}
export async function getAdminPayments(req, res) {
    try {
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);

        const search = String(req.query.search || "").trim();
        const status = String(req.query.status || "").trim();
        const sort = String(req.query.sort || "newest").trim();

        const baseMatch = {};
        if (status) {
            baseMatch.status = status;
        }

        let sortStage = { createdAt: -1 };

        if (sort === "oldest") sortStage = { createdAt: 1 };
        if (sort === "amountAsc") sortStage = { amount: 1 };
        if (sort === "amountDesc") sortStage = { amount: -1 };
        if (sort === "status") sortStage = { status: 1, createdAt: -1 };

        const pipeline = [
            { $match: baseMatch },

            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $lookup: {
                    from: "courses",
                    localField: "courses",
                    foreignField: "_id",
                    as: "courses",
                },
            },

            // تجهيز حقول searchable
            {
                $addFields: {
                    searchUserName: { $ifNull: ["$user.name", ""] },
                    searchUserEmail: { $ifNull: ["$user.email", ""] },
                    searchStatus: { $ifNull: ["$status", ""] },
                    searchAmount: { $toString: { $ifNull: ["$amount", 0] } },
                    searchOrderId: { $toString: "$_id" },
                    searchCourseTitles: {
                        $reduce: {
                            input: {
                                $map: {
                                    input: "$courses",
                                    as: "course",
                                    in: { $ifNull: ["$$course.title", ""] },
                                },
                            },
                            initialValue: "",
                            in: {
                                $concat: [
                                    "$$value",
                                    " ",
                                    "$$this",
                                ],
                            },
                        },
                    },
                },
            },
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { searchUserName: { $regex: search, $options: "i" } },
                        { searchUserEmail: { $regex: search, $options: "i" } },
                        { searchCourseTitles: { $regex: search, $options: "i" } },
                        { searchStatus: { $regex: search, $options: "i" } },
                        { searchAmount: { $regex: search, $options: "i" } },
                        { searchOrderId: { $regex: search, $options: "i" } },
                    ],
                },
            });
        }

        const dataPipeline = [
            ...pipeline,
            { $sort: sortStage },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    amount: 1,
                    status: 1,
                    createdAt: 1,
                    user: {
                        _id: "$user._id",
                        name: "$user.name",
                        email: "$user.email",
                    },
                    courses: {
                        $map: {
                            input: "$courses",
                            as: "course",
                            in: {
                                _id: "$$course._id",
                                title: "$$course.title",
                            },
                        },
                    },
                },
            },
        ];

        const countPipeline = [
            ...pipeline,
            { $count: "total" },
        ];

        const revenuePipeline = [
            { $match: { status: "paid" } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                    totalPaidOrders: { $sum: 1 },
                    averageOrderValue: { $avg: "$amount" },
                },
            },
        ];

        const statusBreakdownPipeline = [
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    amount: { $sum: "$amount" },
                },
            },
            { $sort: { count: -1 } },
        ];

        const [orders, countResult, revenueData, statusBreakdown] = await Promise.all([
            Order.aggregate(dataPipeline),
            Order.aggregate(countPipeline),
            Order.aggregate(revenuePipeline),
            Order.aggregate(statusBreakdownPipeline),
        ]);

        const total = countResult[0]?.total || 0;
        const totalRevenue = revenueData[0]?.totalRevenue || 0;
        const totalPaidOrders = revenueData[0]?.totalPaidOrders || 0;
        const averageOrderValue = revenueData[0]?.averageOrderValue || 0;

        return res.json({
            success: true,
            orders,
            summary: {
                totalRevenue,
                totalPaidOrders,
                averageOrderValue: Math.round(averageOrderValue),
                statusBreakdown,
            },
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message,
        });
    }
}