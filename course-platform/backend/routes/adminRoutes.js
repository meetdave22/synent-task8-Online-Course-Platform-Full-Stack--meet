const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(protect, adminOnly);

// Courses
router.get('/courses', admin.getAllCoursesAdmin);
router.post('/courses', admin.createCourse);
router.put('/courses/:id', admin.updateCourse);
router.delete('/courses/:id', admin.deleteCourse);

// Modules
router.post('/courses/:id/modules', admin.addModule);
router.put('/courses/:id/modules/:moduleId', admin.updateModule);
router.delete('/courses/:id/modules/:moduleId', admin.deleteModule);

// Lessons
router.post('/courses/:id/modules/:moduleId/lessons', admin.addLesson);
router.put('/courses/:id/modules/:moduleId/lessons/:lessonId', admin.updateLesson);
router.delete('/courses/:id/modules/:moduleId/lessons/:lessonId', admin.deleteLesson);

// Users & enrollments
router.get('/users', admin.getAllUsers);
router.get('/enrollments', admin.getAllEnrollments);

module.exports = router;
