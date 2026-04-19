import mongoose from "mongoose";
import slugify from "slugify";

const lectureSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        videoUrl: { type: String, default: "" },
        videoPublicId: { type: String, default: "" },
        durationInMinutes: { type: Number, default: 0 },
        isPreview: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
    },
    { _id: true }
);

const sectionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        order: { type: Number, default: 0 },
        lectures: [lectureSchema],
    },
    { _id: true }
);

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, minlength: 3 },
        slug: { type: String, unique: true },

        subtitle: { type: String, default: "" },
        description: { type: String, default: "" },

        category: { type: String, default: "General", index: true },
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
            index: true,
        },

        language: { type: String, default: "Arabic" },

        thumbnail: { type: String, default: "" },

        price: { type: Number, default: 0 },
        discountPrice: { type: Number, default: 0 },

        tags: { type: [String], default: [] },

        requirements: { type: [String], default: [] },
        learningOutcomes: { type: [String], default: [] },

        sections: { type: [sectionSchema], default: [] },

        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        totalLectures: { type: Number, default: 0 },
        totalDurationInMinutes: { type: Number, default: 0 },

        enrolledCount: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        reviewsCount: { type: Number, default: 0 },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
            index: true,
        },
    },
    { timestamps: true }
);


// 🔍 text search
courseSchema.index({
    title: "text",
    subtitle: "text",
    description: "text",
    tags: "text",
});


// ⚡ generate slug
courseSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});


// 📊 stats
courseSchema.methods.recalculateStats = function () {
    let totalLectures = 0;
    let totalDuration = 0;

    for (const section of this.sections) {
        for (const lecture of section.lectures) {
            totalLectures += 1;
            totalDuration += lecture.durationInMinutes || 0;
        }
    }

    this.totalLectures = totalLectures;
    this.totalDurationInMinutes = totalDuration;
};


export default mongoose.models.Course ||
    mongoose.model("Course", courseSchema);