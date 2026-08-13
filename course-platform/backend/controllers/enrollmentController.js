const crypto = require('crypto');
const Razorpay = require('razorpay');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route POST /api/enrollments/order  { courseId }
// Creates a Razorpay order for the course price (or auto-enrolls free courses)
exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled in this course' });

    // Free course: enroll immediately, no payment needed
    if (course.price <= 0) {
      const enrollment = await Enrollment.create({ user: req.user._id, course: courseId });
      await sendEnrollmentEmail(req.user, course);
      return res.status(201).json({ free: true, enrollment });
    }

    const amountInPaise = Math.round(course.price * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${courseId}_${Date.now()}`
    });

    await Payment.create({
      user: req.user._id,
      course: courseId,
      razorpayOrderId: order.id,
      amount: course.price,
      status: 'created'
    });

    res.json({
      free: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      courseTitle: course.title
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/enrollments/verify
// Verifies Razorpay payment signature, then creates the enrollment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: 'failed' });
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' },
      { new: true }
    );

    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
      payment: payment ? payment._id : undefined
    });

    const course = await Course.findById(courseId);
    await sendEnrollmentEmail(req.user, course);

    res.status(201).json({ message: 'Payment verified, enrollment complete', enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/enrollments/my
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate('course');
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function sendEnrollmentEmail(user, course) {
  await sendEmail({
    to: user.email,
    subject: `You're enrolled in ${course.title}`,
    html: `<p>Hi ${user.name},</p><p>You've successfully enrolled in <strong>${course.title}</strong>. Head to your dashboard to start learning.</p>`
  });
}
