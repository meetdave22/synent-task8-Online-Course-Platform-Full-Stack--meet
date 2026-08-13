const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// ---- Courses ----

exports.createCourse = async (req, res) => {
  try {
    const { title, description, shortDescription, thumbnail, category, level, price } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

    let slug = slugify(title);
    const existing = await Course.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const course = await Course.create({
      title,
      slug,
      description,
      shortDescription,
      thumbnail,
      category,
      level,
      price,
      modules: [],
      createdBy: req.user._id
    });
    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.modules; // modules managed via dedicated endpoints
    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await Enrollment.deleteMany({ course: course._id });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Modules & Lessons ----

exports.addModule = async (req, res) => {
  try {
    const { title } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.modules.push({ title, order: course.modules.length });
    await course.save();
    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    if (req.body.title) mod.title = req.body.title;
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.modules.pull({ _id: moduleId });
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addLesson = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { title, videoUrl, duration } = req.body;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    mod.lessons.push({ title, videoUrl, duration, order: mod.lessons.length });
    await course.save();
    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const { id, moduleId, lessonId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    const lesson = mod.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    Object.assign(lesson, req.body);
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const { id, moduleId, lessonId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    mod.lessons.pull({ _id: lessonId });
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Users & Enrollments ----

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 });
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
