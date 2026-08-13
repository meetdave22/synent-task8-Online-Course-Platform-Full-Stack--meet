const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @route POST /api/progress/:courseId/lessons/:lessonId/complete
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

    if (!enrollment.completedLessons.some((id) => id.toString() === lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    const course = await Course.findById(courseId);
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    enrollment.progressPercent = totalLessons
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;
    enrollment.status = enrollment.progressPercent >= 100 ? 'completed' : 'active';

    await enrollment.save();
    res.json({ enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/progress/:courseId/lessons/:lessonId/uncomplete
exports.markLessonIncomplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

    enrollment.completedLessons = enrollment.completedLessons.filter((id) => id.toString() !== lessonId);

    const course = await Course.findById(courseId);
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    enrollment.progressPercent = totalLessons
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;
    enrollment.status = 'active';

    await enrollment.save();
    res.json({ enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
