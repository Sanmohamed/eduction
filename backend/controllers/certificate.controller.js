import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

function generateCertificateNo(userId, courseId) {
  return `CERT-${String(userId).slice(-4)}-${String(courseId).slice(-4)}-${Date.now()}`;
}

export const createCertificate = async (req, res) => {
  try {
    const { courseId, userId } = req.body;

    if (!courseId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID and User ID are required',
      });
    }

    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const existingCertificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (existingCertificate) {
      return res.status(409).json({
        success: false,
        message: 'Certificate already exists for this user and course',
        certificate: existingCertificate,
      });
    }

    const certificate = await Certificate.create({
      user: userId,
      course: courseId,
      certificateNo: generateCertificateNo(userId, courseId),
    });

    return res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      certificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating certificate',
      error: error.message,
    });
  }
};

export const getCertificate = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    const certificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    })
      .populate('user', 'name email')
      .populate('course', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    return res.json({
      success: true,
      certificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error.message,
    });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id)
      .populate('user', 'name email')
      .populate('course', 'title slug');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    return res.json({
      success: true,
      certificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching certificate by ID',
      error: error.message,
    });
  }
};

export const getUserCertificates = async (req, res) => {
  try {
    const { userId } = req.params;

    const certificates = await Certificate.find({ user: userId })
      .populate('course', 'title slug')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      certificates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error.message,
    });
  }
};

export const getCourseCertificates = async (req, res) => {
  try {
    const { courseId } = req.params;

    const certificates = await Certificate.find({ course: courseId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      certificates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error.message,
    });
  }
};