import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MonitorDetail from './pages/MonitorDetail';
import Incidents from './pages/Incidents';
import AlertChannels from './pages/AlertChannels';
import StatusPage from './pages/StatusPage';
import Login from './pages/Login';
import Landing from './pages/Landing';
import { getToken } from './api/client';

function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/status/:slug" element={<StatusPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login />} />
      <Route path="/forgot-password" element={<Login />} />
      <Route path="/reset-password" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/monitors/:id" element={<MonitorDetail />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/alert-channels" element={<AlertChannels />} />
      </Route>

      <Route path="*" element={<div className="not-found">Page not found. <Link to="/">Go home</Link></div>} />
    </Routes>
  );
}
