const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { markLessonComplete, markLessonIncomplete } = require('../controllers/progressController');

router.use(protect);
router.post('/:courseId/lessons/:lessonId/complete', markLessonComplete);
router.post('/:courseId/lessons/:lessonId/uncomplete', markLessonIncomplete);

module.exports = router;
