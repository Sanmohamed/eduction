import mongoose from 'mongoose'
const orderSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], amount: { type: Number, required: true }, method: { type: String, enum: ['card','paymob','vodafone'], required: true }, status: { type: String, enum: ['pending','paid','failed'], default: 'pending' }, gatewayReference: { type: String, default: '' } }, { timestamps: true })
export default mongoose.models.Order || mongoose.model('Order', orderSchema)
