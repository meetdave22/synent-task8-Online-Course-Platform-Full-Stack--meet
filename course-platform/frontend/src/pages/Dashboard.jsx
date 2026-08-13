import { useEffect, useState } from 'react';
import api from '../services/api';
import CourseCard from '../components/CourseCard';
import useCountUp from '../hooks/useCountUp';

function HeroDoodles() {
  return (
    <div className="hero-doodles">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20l3-9 9-9 3 3-9 9-6 3z" stroke="#e0a530" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" stroke="#1f6b4c" strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="#1c2b3a" strokeWidth="1.6"/>
        <path d="M8 9h8M8 13h5" stroke="#1c2b3a" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-thumb" />
          <div className="skeleton-body">
            <div className="skeleton-line w40" />
            <div className="skeleton-line w60" />
            <div className="skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const animatedTotal = useCountUp(total);

  useEffect(() => {
    api.get('/courses/categories').then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (search) params.search = search;
    if (category) params.category = category;
    if (level) params.level = level;

    const timeout = setTimeout(() => {
      api
        .get('/courses', { params })
        .then((res) => {
          setCourses(res.data.courses);
          setPages(res.data.pages || 1);
          setTotal(res.data.total || 0);
        })
        .finally(() => setLoading(false));
    }, 300); // debounce search

    return () => clearTimeout(timeout);
  }, [search, category, level, page]);

  return (
    <div className="page-container">
      <div className="hero-band">
        <HeroDoodles />
        <div>
          <p className="eyebrow">Course catalog</p>
          <h1><span className="doodle-underline">Explore courses</span></h1>
          <p>Search, filter, and pick up right where you left off — everything you enroll in shows up under My Learning.</p>
        </div>
        <div className="hero-tally">
          <strong>{animatedTotal}</strong>
          {total === 1 ? 'course available' : 'courses available'}
        </div>
      </div>

      <div className="filters">
        <input
          className="search-input"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
          <option value="">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : courses.length === 0 ? (
        <div className="empty-state-illustrated">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="18" width="52" height="40" rx="3" stroke="#1f6b4c" strokeWidth="2.5"/>
            <path d="M10 26h52" stroke="#1f6b4c" strokeWidth="2.5"/>
            <path d="M22 38l8 8 20-16" stroke="#e0a530" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
            <circle cx="20" cy="22" r="1.6" fill="#1f6b4c"/>
            <circle cx="26" cy="22" r="1.6" fill="#1f6b4c"/>
          </svg>
          <h3>No matches on this page</h3>
          <p>Try a different search term, or clear a filter to see more of the catalog.</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((c) => <CourseCard key={c._id} course={c} />)}
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}