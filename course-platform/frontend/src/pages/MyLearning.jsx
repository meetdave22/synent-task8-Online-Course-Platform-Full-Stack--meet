import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then((res) => setEnrollments(res.data.enrollments)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader">Loading...</div>;

  return (
    <div className="page-container">
      <h1>My learning</h1>
      {enrollments.length === 0 ? (
        <div className="empty-state">
          You haven't enrolled in any courses yet. <Link to="/dashboard">Browse courses</Link>
        </div>
      ) : (
        <div className="learning-list">
          {enrollments.map((e) => (
            <Link key={e._id} to={`/learn/${e.course._id}`} className="learning-item">
              <div className="learning-item-info">
                <h3>{e.course.title}</h3>
                <span className="muted">{e.status === 'completed' ? 'Completed' : 'In progress'}</span>
              </div>
              <ProgressBar percent={e.progressPercent} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
