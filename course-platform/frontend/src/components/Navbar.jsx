import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => (isActive ? 'active-link' : '');

  return (
    <nav className="navbar">
      <Link to="/" className="brand">CoursePlatform</Link>
      <div className="nav-links">
        <NavLink to="/dashboard" className={linkClass}>Courses</NavLink>
        {user && <NavLink to="/my-learning" className={linkClass}>My Learning</NavLink>}
        {user && user.role === 'admin' && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn btn-link" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            <Link to="/login" state={{ adminLogin: true }} className="btn btn-secondary btn-sm">Admin Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}