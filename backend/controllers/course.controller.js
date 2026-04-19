import Course from "../models/Course.js";

export async function getCourses(req, res) {
  try {
    let { search, page = 1, limit = 10, category, level, sort } = req.query;

    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const query = { status: "published" };

    if (search && String(search).trim()) {
      query.$text = { $search: String(search).trim() };
    }

    if (category) query.category = String(category).trim();
    if (level) query.level = String(level).trim();

    let sortOption = { createdAt: -1 };

    if (sort === "price") sortOption = { price: 1 };
    if (sort === "-price") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { averageRating: -1 };
    if (sort === "popular") sortOption = { enrolledCount: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const findQuery = Course.find(query)
      .populate("instructor", "name")
      .skip((page - 1) * limit)
      .limit(limit);

    if (query.$text) {
      findQuery.select({ score: { $meta: "textScore" } });

      if (!sort || sort === "relevance") {
        findQuery.sort({ score: { $meta: "textScore" } });
      } else {
        findQuery.sort(sortOption);
      }
    } else {
      findQuery.sort(sortOption);
    }

    const courses = await findQuery;
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
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
}