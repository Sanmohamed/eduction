import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3},
  description: { type: String, default: '' },
  type: { type: String, enum: ['scholarship','course','certificate','article','tool'], default: 'article' },
  category: { type: String, default: 'General', trim: true },
  url: { type: String, default: '', match: [/^https?:\/\/.+/, 'Invalid URL'] },
  featured: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  audience: { type: [String], default: ['student'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

resourceSchema.index({ title: 'text', description: 'text', tags: 'text' })

export default mongoose.models.Resource || mongoose.model('Resource', resourceSchema)
