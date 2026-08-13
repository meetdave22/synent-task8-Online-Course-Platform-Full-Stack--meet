import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProgressBar from '../components/ProgressBar';

export default function LessonPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/courses/${courseId}`), api.get('/enrollments/my')])
      .then(([courseRes, enrollRes]) => {
        if (!courseRes.data.isEnrolled) {
          setError('You are not enrolled in this course.');
          return;
        }
        setCourse(courseRes.data.course);
        const found = enrollRes.data.enrollments.find((e) => e.course._id === courseId);
        setEnrollment(found);
        const firstLesson = courseRes.data.course.modules[0]?.lessons[0];
        if (firstLesson) setActiveLesson(firstLesson);
      })
      .catch(() => setError('Could not load course'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const isCompleted = (lessonId) =>
    enrollment?.completedLessons?.some((id) => id === lessonId || id?.toString?.() === lessonId);

  const toggleComplete = async (lesson) => {
    const done = isCompleted(lesson._id);
    const endpoint = done ? 'uncomplete' : 'complete';
    const { data } = await api.post(`/progress/${courseId}/lessons/${lesson._id}/${endpoint}`);
    setEnrollment((prev) => ({ ...prev, ...data.enrollment }));
  };

  if (loading) return <div className="page-loader">Loading...</div>;
  if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;
  if (!course) return null;

  return (
    <div className="learn-layout">
      <aside className="learn-sidebar">
        <button className="btn btn-link" onClick={() => navigate('/my-learning')}>&larr; My learning</button>
        <h3>{course.title}</h3>
        <ProgressBar percent={enrollment?.progressPercent || 0} />
        {course.modules.map((m) => (
          <div key={m._id} className="learn-module">
            <h4>{m.title}</h4>
            <ul>
              {m.lessons.map((l) => (
                <li
                  key={l._id}
                 className={`learn-lesson ${activeLesson?._id === l._id ? 'active' : ''} ${isCompleted(l._id) ? 'completed' : ''}`}
                  onClick={() => setActiveLesson(l)}
                >
                  <input
                    type="checkbox"
                    checked={!!isCompleted(l._id)}
                    onChange={(e) => { e.stopPropagation(); toggleComplete(l); }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{l.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <main className="learn-main">
        {activeLesson ? (
          <>
            <div className="video-wrapper">
              <video key={activeLesson._id} controls src={activeLesson.videoUrl} width="100%" />
            </div>
            <div className="lesson-controls">
              <h2>{activeLesson.title}</h2>
              <button className="btn btn-primary" onClick={() => toggleComplete(activeLesson)}>
                {isCompleted(activeLesson._id) ? 'Mark as incomplete' : 'Mark as complete'}
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">No lessons available yet.</div>
        )}
      </main>
    </div>
  );
}
