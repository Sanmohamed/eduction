import Complaint from '../models/Complaint.js'
import Notification from '../models/Notification.js'
import User from '../models/User.js'

function sanitizeComplaint(value) {
  return  String(value || "") 
  .trim()
  .replace(/[]/g, "")
  .replace(/\s+/g, " ");
}

export async function createComplaint(req, res) {
 let { subject, category, message, priority } = req.body

  const lastComplaint = await Complaint.findOne({
    user: req.user._id,
  }).sort({ createdAt: -1 });
  const oneMinute = 60 * 1000;
  if (lastComplaint && Date.now() - lastComplaint.createdAt.getTime() < oneMinute) {
    return res.status(429).json({
      success: false,
      message: "Please wait before submitting another complaint",
    });
  }
  try {
    subject = sanitizeComplaint(subject)
    message = sanitizeComplaint(message)
    if (!subject || subject.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Subject must be at least 5 characters",
      });
    }

    if (!message || message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters",
      });
    }
    const complaint = await Complaint.create({
      user: req.user._id,
      subject,
      category: category || 'other',
      message,
      priority: priority || 'medium',
    })

    await Notification.create({
      user: req.user._id,
      title: 'Complaint submitted',
      message: 'Your complaint was received and is now under review.',
      type: 'complaint',
      actionUrl: '/complaints',
    })
    const admin = await User.findOne({ role: 'admin' }).select('_id');
    if (admin) {
      await Notification.create({
        user: admin._id,
        title: "New Complaint",
        message: subject,
        type: "complaint",
      });
    }

    res.status(201).json({ success: true, complaint })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit complaint', error: err.message })
  }
}

export async function getMyComplaints(req, res) {
  const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json({ success: true, complaints })
}

export async function getAllComplaints(req, res) {
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;

  const total = await Complaint.countDocuments();

  const complaints = await Complaint.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    complaints,
  });
}

export async function updateComplaint(req, res) {
  const allowedStatuses = ['open', 'in_review', 'resolved', 'rejected'];
  const { status, adminReply } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be one of: open, in_review, resolved, rejected"
    });
  }

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status, adminReply },
    { new: true }
  );

  if (!complaint) {
    return res.status(404).json({ success: false, message: "Complaint not found" });
  }

  await Notification.create({
    user: complaint.user,
    title: `Complaint ${status.replace('_', ' ').toUpperCase()}`,
    message: adminReply || `Your complaint status was updated to ${status.replace('_', ' ').toUpperCase()}`,
    type: 'complaint',
    actionUrl: '/complaints',
  });

  res.json({ success: true, complaint });
}

export async function getComplaintStats(req, res) {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        }
      }

    ]);

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaint stats', error: err.message });
  }
}