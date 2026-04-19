import mongoose from 'mongoose'
const certificateSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, certificateNo: { type: String, required: true }, issuedAt: { type: Date, default: Date.now } }, { timestamps: true })
export default mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema)
