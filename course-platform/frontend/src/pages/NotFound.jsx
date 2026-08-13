import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="torn-card">
        <h1>404</h1>
        <h2>This page got torn out.</h2>
        <p>Whatever you were looking for isn't on this page of the notebook.</p>
        <Link to="/dashboard" className="btn btn-primary">Back to courses</Link>
      </div>
    </div>
  );
}