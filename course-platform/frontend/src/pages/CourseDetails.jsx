import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CourseDetails() {
  const { idOrSlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  const fetchCourse = () => {
    setLoading(true);
    api
      .get(`/courses/${idOrSlug}`)
      .then((res) => {
        setCourse(res.data.course);
        setIsEnrolled(res.data.isEnrolled);
      })
      .catch(() => setError('Course not found'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCourse, [idOrSlug]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${idOrSlug}` } });
      return;
    }
    setError('');
    setEnrolling(true);
    try {
      const { data } = await api.post('/enrollments/order', { courseId: course._id });

      if (data.free) {
        setIsEnrolled(true);
        navigate('/my-learning');
        return;
      }

      const ok = await loadRazorpayScript();
      if (!ok) {
        setError('Could not load payment gateway. Check your connection.');
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Course Platform',
        description: data.courseTitle,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await api.post('/enrollments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id
            });
            setIsEnrolled(true);
            navigate('/my-learning');
          } catch (err) {
            setError('Payment verification failed. Contact support if amount was deducted.');
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#4f46e5' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setError('Payment failed. Please try again.'));
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start enrollment');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="page-loader">Loading...</div>;
  if (error && !course) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;
  if (!course) return null;

  return (
    <div className="page-container course-details">
      <div className="course-details-header">
        <span className="badge">{course.category}</span>
        <h1>{course.title}</h1>
        <p className="muted">{course.description}</p>
        <div className="meta-row">
          <span>{course.level}</span>
          <span>{course.totalLessons} lessons</span>
          <span>By {course.instructor}</span>
        </div>
      </div>

      <div className="course-details-body">
        <div className="modules-preview">
          <h2>Course content</h2>
          {course.modules.length === 0 && <p className="muted">Content coming soon.</p>}
          {course.modules.map((m) => (
            <div key={m._id} className="module-block">
              <h3>{m.title}</h3>
              <ul>
                {m.lessons.map((l) => (
                  <li key={l._id}>
                    {l.title} {l.duration ? <span className="muted"> · {l.duration} min</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <aside className="enroll-card">
          <div className="price-large">{course.price > 0 ? `₹${course.price}` : 'Free'}</div>
          {error && <div className="alert alert-error">{error}</div>}
          {isEnrolled ? (
  <>
    <div className="stamp-pop badge" style={{ borderColor: 'var(--accent)', color: 'var(--accent-dark)', background: 'var(--accent-soft)' }}>
      ✓ Enrolled
    </div>
    <button className="btn btn-primary" onClick={() => navigate('/my-learning')}>
      Go to course
    </button>
  </>
) : (
            <button className="btn btn-primary" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Processing...' : 'Enroll Now'}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
