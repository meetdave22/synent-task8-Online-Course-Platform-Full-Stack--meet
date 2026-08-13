const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, getCategories } = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

// Optional-auth middleware: attaches req.user if a valid token is present, else continues
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (e) {
      /* ignore invalid token for public routes */
    }
  }
  next();
};

router.get('/', getCourses);
router.get('/categories', getCategories);
router.get('/:idOrSlug', optionalAuth, getCourseById);

module.exports = router;
