import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  category: { type: String, enum: ['technical','payment','course','account','feedback','other'], default: 'other' },
  message: { type: String, required: true },
  status: { type: String, enum: ['open','in_review','resolved','rejected'], default: 'open' },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  adminReply: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema)
