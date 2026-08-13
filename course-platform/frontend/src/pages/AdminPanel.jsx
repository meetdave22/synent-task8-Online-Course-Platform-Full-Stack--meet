import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminPanel() {
  const [tab, setTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', shortDescription: '', category: '', level: 'Beginner', price: 0, thumbnail: '' });
  const [creating, setCreating] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([api.get('/admin/courses'), api.get('/admin/users'), api.get('/admin/enrollments')])
      .then(([c, u, e]) => {
        setCourses(c.data.courses);
        setUsers(u.data.users);
        setEnrollments(e.data.enrollments);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/courses', newCourse);
      setNewCourse({ title: '', description: '', shortDescription: '', category: '', level: 'Beginner', price: 0, thumbnail: '' });
      loadAll();
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await api.delete(`/admin/courses/${id}`);
    loadAll();
  };

  if (loading) return <div className="page-loader">Loading admin panel...</div>;

  return (
    <div className="page-container">
      <h1>Admin panel</h1>
      <div className="tabs">
        <button className={tab === 'courses' ? 'active' : ''} onClick={() => setTab('courses')}>Courses</button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'enrollments' ? 'active' : ''} onClick={() => setTab('enrollments')}>Enrollments</button>
      </div>

      {tab === 'courses' && (
        <div>
          <form className="admin-form" onSubmit={handleCreateCourse}>
            <h3>Add a new course</h3>
            <div className="form-grid">
              <input placeholder="Title" required value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} />
              <input placeholder="Category" value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} />
              <select value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
              <input type="number" min="0" placeholder="Price (₹, 0 = free)" value={newCourse.price}
                onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })} />
              <input placeholder="Thumbnail URL" value={newCourse.thumbnail}
                onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })} />
            </div>
            <input placeholder="Short description" value={newCourse.shortDescription}
              onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })} />
            <textarea placeholder="Full description" required value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} />
            <button className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create course'}</button>
          </form>

          <table className="admin-table">
            <thead><tr><th>Title</th><th>Category</th><th>Price</th><th>Lessons</th><th></th></tr></thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>{c.price > 0 ? `₹${c.price}` : 'Free'}</td>
                  <td>{c.totalLessons}</td>
                  <td>
                    <Link to={`/admin/courses/${c._id}`}>Manage content</Link>{' '}
                    <button className="btn btn-link btn-danger" onClick={() => handleDeleteCourse(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.isEmailVerified ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'enrollments' && (
        <table className="admin-table">
          <thead><tr><th>User</th><th>Course</th><th>Progress</th><th>Status</th></tr></thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e._id}>
                <td>{e.user?.name}</td><td>{e.course?.title}</td><td>{e.progressPercent}%</td><td>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
