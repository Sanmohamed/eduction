import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import { createNotification } from "../services/notification.service.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function generateCertificateNo(userId, courseId) {
  return `CERT-${String(userId).slice(-4)}-${String(courseId).slice(-4)}-${Date.now()}`;
}

async function updateLearningStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = startOfDay(new Date());
  const lastActive = user.lastActiveAt ? startOfDay(user.lastActiveAt) : null;

  if (!lastActive) {
    user.learningStreak = 1;
  } else {
    const diffDays = Math.floor(
      (today - lastActive) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      user.learningStreak = (user.learningStreak || 0) + 1;
    } else if (diffDays > 1) {
      user.learningStreak = 1;
    }
  }

  user.lastActiveAt = new Date();
  await user.save();
  return user;
}

export async function markLectureComplete(req, res) {
  try {
    const userId = req.user._id;
    const { courseId, lectureId } = req.body;

    if (!courseId || !lectureId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and lecture ID are required",
      });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const flatLectures = course.sections.flatMap((section) => section.lectures);

    const currentIndex = flatLectures.findIndex(
      (lecture) => String(lecture._id) === String(lectureId)
    );

    if (currentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found in this course",
      });
    }

    const alreadyCompleted = enrollment.completedLectures.includes(String(lectureId));

    if (alreadyCompleted) {
      const nextLectureId =
        flatLectures[currentIndex + 1]?._id || null;

      return res.json({
        success: true,
        message: "Lecture already completed",
        enrollment,
        progress: enrollment.progress,
        completed: enrollment.progress === 100,
        nextStep: enrollment.progress === 100 ? "certificate" : "nextLecture",
        nextLectureId,
      });
    }

    enrollment.completedLectures.push(String(lectureId));

    const totalLectures = course.totalLectures || 0;
    const completedCount = enrollment.completedLectures.length;

    const progress =
      totalLectures > 0
        ? Math.min(100, Math.round((completedCount / totalLectures) * 100))
        : 0;

    if (progress !== enrollment.progress) {
      enrollment.progress = progress;
    }

    enrollment.lastAccessedAt = new Date();

    let createdCertificate = null;

    if (progress === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();

      const existingCertificate = await Certificate.findOne({
        user: userId,
        course: courseId,
      });

      if (!existingCertificate) {
        createdCertificate = await Certificate.create({
          user: userId,
          course: courseId,
          certificateNo: generateCertificateNo(userId, courseId),
        });

        await createNotification({
          user: userId,
          title: "Certificate earned 🎓",
          message: `You have earned a certificate for: ${course.title}`,
          type: "certificate",
        });
      }
    }

    await enrollment.save();

    const user = await updateLearningStreak(userId);

    const nextLectureId =
      flatLectures[currentIndex + 1]?._id || null;

    return res.json({
      success: true,
      message:
        progress === 100
          ? "Lecture completed and course finished successfully"
          : "Lecture marked as completed",
      enrollment,
      progress,
      completed: progress === 100,
      nextStep: progress === 100 ? "certificate" : "nextLecture",
      nextLectureId,
      learningStreak: user?.learningStreak || 0,
      certificate: createdCertificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark lecture as completed",
      error: error.message,
    });
  }
}