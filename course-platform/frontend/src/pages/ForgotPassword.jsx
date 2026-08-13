import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDevResetUrl('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.devResetUrl) setDevResetUrl(res.data.devResetUrl);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Forgot password</h2>
        {message && <div className="alert alert-info">{message}</div>}
        {devResetUrl && (
          <div className="alert alert-info" style={{ wordBreak: 'break-all' }}>
            <strong>Dev mode</strong> — email isn't configured, so here's your link directly:
            <br />
            <Link to={devResetUrl.replace(window.location.origin, '')}>{devResetUrl}</Link>
          </div>
        )}
        <label>Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
        <p className="auth-switch"><Link to="/login">Back to login</Link></p>
      </form>
    </div>
  );
}
