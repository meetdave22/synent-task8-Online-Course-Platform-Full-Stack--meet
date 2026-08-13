const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @route GET /api/courses  (public: list + search + filter)
// query params: search, category, level, minPrice, maxPrice, page, limit
exports.getCourses = async (req, res) => {
  try {
    const { search, category, level, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (level) query.level = level;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const courses = await Course.find(query)
      .select('-modules')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({ courses, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/courses/:idOrSlug
exports.getCourseById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const course = await Course.findOne({
      $or: [{ _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null }, { slug: idOrSlug }]
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
      isEnrolled = !!enrollment;
    }

    // Hide video URLs / lesson detail from non-enrolled, non-admin users (preview only)
    const courseObj = course.toObject();
    if (!isEnrolled && (!req.user || req.user.role !== 'admin')) {
      courseObj.modules = courseObj.modules.map((m) => ({
        _id: m._id,
        title: m.title,
        order: m.order,
        lessons: m.lessons.map((l) => ({ _id: l._id, title: l.title, duration: l.duration, order: l.order }))
      }));
    }

    res.json({ course: courseObj, isEnrolled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
