import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminCourseContent() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [lessonForms, setLessonForms] = useState({}); // moduleId -> {title, videoUrl, duration}

  const load = () => {
    setLoading(true);
    api.get(`/courses/${id}`).then((res) => setCourse(res.data.course)).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const addModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    await api.post(`/admin/courses/${id}/modules`, { title: newModuleTitle });
    setNewModuleTitle('');
    load();
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    await api.delete(`/admin/courses/${id}/modules/${moduleId}`);
    load();
  };

  const addLesson = async (moduleId) => {
    const form = lessonForms[moduleId] || {};
    if (!form.title || !form.videoUrl) return;
    await api.post(`/admin/courses/${id}/modules/${moduleId}/lessons`, {
      title: form.title,
      videoUrl: form.videoUrl,
      duration: Number(form.duration) || 0
    });
    setLessonForms({ ...lessonForms, [moduleId]: { title: '', videoUrl: '', duration: '' } });
    load();
  };

  const deleteLesson = async (moduleId, lessonId) => {
    await api.delete(`/admin/courses/${id}/modules/${moduleId}/lessons/${lessonId}`);
    load();
  };

  const updateLessonForm = (moduleId, field, value) => {
    setLessonForms({ ...lessonForms, [moduleId]: { ...lessonForms[moduleId], [field]: value } });
  };

  if (loading) return <div className="page-loader">Loading...</div>;
  if (!course) return null;

  return (
    <div className="page-container">
      <Link to="/admin" className="btn btn-link">&larr; Back to admin</Link>
      <h1>{course.title}</h1>
      <p className="muted">Manage modules and lessons for this course.</p>

      <form className="admin-form" onSubmit={addModule}>
        <input placeholder="New module title" value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)} />
        <button className="btn btn-primary" type="submit">Add module</button>
      </form>

      {course.modules.map((m) => (
        <div key={m._id} className="module-block admin-module">
          <div className="module-header">
            <h3>{m.title}</h3>
            <button className="btn btn-link btn-danger" onClick={() => deleteModule(m._id)}>Delete module</button>
          </div>
          <ul>
            {m.lessons.map((l) => (
              <li key={l._id}>
                {l.title} <span className="muted">({l.duration} min)</span>{' '}
                <button className="btn btn-link btn-danger" onClick={() => deleteLesson(m._id, l._id)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="lesson-form">
            <input placeholder="Lesson title" value={lessonForms[m._id]?.title || ''}
              onChange={(e) => updateLessonForm(m._id, 'title', e.target.value)} />
            <input placeholder="Video URL" value={lessonForms[m._id]?.videoUrl || ''}
              onChange={(e) => updateLessonForm(m._id, 'videoUrl', e.target.value)} />
            <input placeholder="Duration (min)" type="number" value={lessonForms[m._id]?.duration || ''}
              onChange={(e) => updateLessonForm(m._id, 'duration', e.target.value)} />
            <button className="btn btn-secondary" onClick={() => addLesson(m._id)} type="button">Add lesson</button>
          </div>
        </div>
      ))}
    </div>
  );
}
