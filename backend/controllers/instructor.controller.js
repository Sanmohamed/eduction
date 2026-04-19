import slugify from "slugify";
import Course from "../models/Course.js";
import Order from "../models/Order.js";

export async function createCourse(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      title,
      subtitle,
      description,
      category,
      level,
      language,
      thumbnail,
      price,
      discountPrice,
      tags,
      requirements,
      learningOutcomes,
    } = req.body;

    if (!title || !String(title).trim() || !description || !String(description).trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const priceNum = Number(price || 0);
    const discountPriceNum = Number(discountPrice || 0);

    if (Number.isNaN(priceNum) || Number.isNaN(discountPriceNum)) {
      return res.status(400).json({
        success: false,
        message: "Price values must be valid numbers",
      });
    }

    if (priceNum < 0 || discountPriceNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Price values cannot be negative",
      });
    }

    if (discountPriceNum > priceNum) {
      return res.status(400).json({
        success: false,
        message: "Discount price cannot be higher than the original price",
      });
    }

    const payload = {
      title: String(title).trim(),
      subtitle: subtitle ? String(subtitle).trim() : "",
      description: String(description).trim(),
      category: category ? String(category).trim() : "General",
      level: level || "Beginner",
      language: language ? String(language).trim() : "Arabic",
      thumbnail: thumbnail ? String(thumbnail).trim() : "",
      tags: Array.isArray(tags) ? tags.map(String) : [],
      requirements: Array.isArray(requirements) ? requirements.map(String) : [],
      learningOutcomes: Array.isArray(learningOutcomes)
        ? learningOutcomes.map(String)
        : [],
      instructor: req.user._id,
      price: priceNum,
      discountPrice: discountPriceNum,
    };

    const course = await Course.create(payload);

    course.slug =
      slugify(course.title, { lower: true, strict: true }) +
      "-" +
      course._id.toString().slice(-6);

    await course.save();

    return res.status(201).json({
      success: true,
      course,
      message: "Course created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
}

export async function getInstructorCourses(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses",
      error: error.message,
    });
  }
}

export async function getInstructorStats(req, res) {
  try {
    const instructorId = req.user._id;

    const fullCourses = await Course.find({ instructor: instructorId })
      .select("_id title price discountPrice enrolledCount status totalLectures")
      .lean();

    const courseIds = fullCourses.map((c) => c._id);

    const orders = await Order.find({
      status: "paid",
      courses: { $in: courseIds },
    })
      .select("courses amount createdAt")
      .sort({ createdAt: 1 })
      .lean();

    let totalRevenue = 0;
    let totalStudents = 0;

    const revenueMap = {};
    const monthlyRevenueMap = {};

    for (const course of fullCourses) {
      totalStudents += course.enrolledCount || 0;

      revenueMap[String(course._id)] = {
        courseId: course._id,
        title: course.title,
        revenue: 0,
        students: course.enrolledCount || 0,
        lectures: course.totalLectures || 0,
        status: course.status,
      };
    }

    for (const order of orders) {
      if (!order.courses?.length) continue;

      const share = order.amount / order.courses.length;

      const matchedCourseIds = order.courses.filter((courseId) =>
        courseIds.some((id) => id.toString() === courseId.toString())
      );

      if (!matchedCourseIds.length) continue;

      const orderRevenueForInstructor = share * matchedCourseIds.length;
      totalRevenue += orderRevenueForInstructor;

      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(
        orderDate.getMonth() + 1
      ).padStart(2, "0")}`;

      monthlyRevenueMap[monthKey] =
        (monthlyRevenueMap[monthKey] || 0) + orderRevenueForInstructor;

      for (const courseId of matchedCourseIds) {
        const key = String(courseId);
        if (revenueMap[key]) {
          revenueMap[key].revenue += share;
        }
      }
    }

    const revenueByCourse = Object.values(revenueMap)
      .map((item) => ({
        ...item,
        revenue: Math.round(item.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const topCourses = revenueByCourse.slice(0, 5);

    const monthlyRevenue = Object.entries(monthlyRevenueMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month,
        revenue: Math.round(revenue),
      }));

    return res.json({
      success: true,
      stats: {
        totalCourses: fullCourses.length,
        totalStudents,
        revenue: Math.round(totalRevenue),
        revenueByCourse,
        topCourses,
        monthlyRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor stats",
      error: error.message,
    });
  }
}

export async function addSection(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { title } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Section title is required",
      });
    }

    const course = await Course.findOne({
      _id: req.params.courseId,
      instructor: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    course.sections.push({
      title: String(title).trim(),
      order: course.sections.length + 1,
      lectures: [],
    });

    await course.save();

    return res.json({
      success: true,
      course,
      message: "Section added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add section",
      error: error.message,
    });
  }
}

export async function addLecture(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const course = await Course.findOne({
      _id: req.params.courseId,
      instructor: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const section = course.sections.id(req.params.sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    if (!req.body.title || !String(req.body.title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Lecture title is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Lecture video file is required",
      });
    }

    section.lectures.push({
      title: String(req.body.title).trim(),
      description: req.body.description ? String(req.body.description).trim() : "",
      durationInMinutes: Number(req.body.durationInMinutes || 0),
      isPreview: req.body.isPreview === "true" || req.body.isPreview === true,
      order: section.lectures.length + 1,
      videoUrl: req.file?.path || "",
      videoPublicId: req.file?.filename || "",
    });

    course.recalculateStats();
    await course.save();

    return res.json({
      success: true,
      course,
      message: "Lecture added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add lecture",
      error: error.message,
    });
  }
}

export async function publishCourse(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const course = await Course.findOne({
      _id: req.params.courseId,
      instructor: req.user._id,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!course.sections.length) {
      return res.status(400).json({
        success: false,
        message: "Course must contain at least one section before publishing",
      });
    }

    const hasLectures = course.sections.some(
      (section) => section.lectures && section.lectures.length > 0
    );

    if (!hasLectures) {
      return res.status(400).json({
        success: false,
        message: "Course must contain at least one lecture before publishing",
      });
    }

    if (!course.thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Please upload a thumbnail image before publishing the course",
      });
    }

    if (course.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Course price must be greater than zero before publishing",
      });
    }

    if (!course.description || course.description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Course description must be at least 20 characters before publishing",
      });
    }

    course.status = "published";
    course.recalculateStats();
    await course.save();

    return res.json({
      success: true,
      course,
      message: "Course published successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to publish course",
      error: error.message,
    });
  }
}