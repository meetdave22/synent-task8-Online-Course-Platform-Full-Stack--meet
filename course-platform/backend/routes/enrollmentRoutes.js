const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, verifyPayment, getMyEnrollments } = require('../controllers/enrollmentController');

router.use(protect);
router.post('/order', createOrder);
router.post('/verify', verifyPayment);
router.get('/my', getMyEnrollments);

module.exports = router;
