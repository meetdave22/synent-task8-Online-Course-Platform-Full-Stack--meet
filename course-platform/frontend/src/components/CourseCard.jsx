import { Link } from 'react-router-dom';

const LEVEL_ICON = {
  Beginner: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22c0-6-4-8-4-13a4 4 0 118 0c0 5-4 7-4 13z" stroke="#1f6b4c" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  Intermediate: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22V10M12 10c0-3-2-5-6-5 0 4 2 6 6 5zM12 10c0-3 2-5 6-5 0 4-2 6-6 5z" stroke="#1f6b4c" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  Advanced: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22V4M12 4c0-1 3-2 5-1-1 3-3 4-5 3zM12 9c0-1-3-2-5-1 1 3 3 4 5 3zM12 15c0-1 4-2 6-1-1 3-4 4-6 3zM12 19c0-1-4-2-6-1 1 3 4 4 6 3z" stroke="#1f6b4c" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
};

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`} className="course-card">
      <div className="course-card-thumb" style={{ backgroundImage: `url(${course.thumbnail || ''})` }}>
        {!course.thumbnail && <span className="thumb-fallback">{course.title.charAt(0)}</span>}
      </div>
      <div className="course-card-body">
        <span className="badge">{course.category}</span>
        <h3>{course.title}</h3>
        <p>{course.shortDescription || course.description?.slice(0, 90)}</p>
        <div className="course-card-footer">
          <span className="level-badge">
            {LEVEL_ICON[course.level] || null}
            {course.level}
          </span>
          <span className="price">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
        </div>
      </div>
    </Link>
  );
}