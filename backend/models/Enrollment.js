import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        progress: {
            type: Number,
            default: 0
        },
        completedLectures: {
            type: [String],
            default: []
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now
        },
        startedAt: {
            type: Date,
            default: Date.now
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
)

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true })

export default mongoose.models.Enrollment ||
    mongoose.model('Enrollment', enrollmentSchema)