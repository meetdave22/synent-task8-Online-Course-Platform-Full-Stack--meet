import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAdminLogin = !!location.state?.adminLogin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (isAdminLogin && user.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }
      const dest = location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-split">
      <div className="auth-cover">
        <div className="auth-cover-mark" />
        <h2>{isAdminLogin ? 'Back for another shift.' : 'Pick up where you left off.'}</h2>
        <p>
          {isAdminLogin
            ? 'Manage courses, review enrollments, and keep the catalog fresh.'
            : 'Your courses, progress, and notes are exactly where you left them.'}
        </p>
        <div className="auth-cover-tags">
          <span>Modules & Lessons</span>
          <span>Progress tracking</span>
          <span>Certificates soon</span>
        </div>
      </div>
      <div className="auth-page">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>{isAdminLogin ? 'Admin Log in' : 'Log in'}</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <label>Email
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>Password
            <input type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          <p className="auth-switch">No account? <Link to="/register">Sign up</Link></p>
        </form>
      </div>
    </div>
  );
}