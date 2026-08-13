import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Email verification</h2>
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status !== 'verifying' && (
          <div className={`alert ${status === 'success' ? 'alert-info' : 'alert-error'}`}>{message}</div>
        )}
        <p className="auth-switch"><Link to="/login">Go to login</Link></p>
      </div>
    </div>
  );
}
