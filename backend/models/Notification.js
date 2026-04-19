import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['system','course','payment','certificate','complaint','wishlist'], default: 'system' },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
