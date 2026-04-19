import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["student", "instructor", "admin"],
            default: "student",
        },

        avatar: {
            type: String,
            default: "",
        },

        bio: {
            type: String,
            default: "",
            maxlength: 500,
        },

        interests: {
            type: [String],
            default: [],
        },

        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],

        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],

        notifications: [
            {
                title: String,
                message: String,
                isRead: {
                    type: Boolean,
                    default: false,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        isVerified: {
            type: Boolean,
            default: false,
        },
        isBanned: {
           type: Boolean,
           default: false,
        },
        learningStreak: {
            type: Number,
            default: 0,
        },

        lastActiveAt: {
            type: Date,
            default: null,
        },

    },
    { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});



userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const User =
    mongoose.models.User || mongoose.model("User", userSchema);

export default User;