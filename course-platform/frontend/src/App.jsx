import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import MyLearning from './pages/MyLearning';
import LessonPlayer from './pages/LessonPlayer';
import AdminPanel from './pages/AdminPanel';
import AdminCourseContent from './pages/AdminCourseContent';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses/:idOrSlug" element={<CourseDetails />} />

        <Route path="/my-learning" element={<PrivateRoute><MyLearning /></PrivateRoute>} />
        <Route path="/learn/:courseId" element={<PrivateRoute><LessonPlayer /></PrivateRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/admin/courses/:id" element={<AdminRoute><AdminCourseContent /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />

        <Route path="*" element={<div className="page-container">Page not found</div>} />
      </Routes>
    </AuthProvider>
  );
}
