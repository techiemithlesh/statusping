import { Link, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MonitorDetail from './pages/MonitorDetail';
import Incidents from './pages/Incidents';
import AlertChannels from './pages/AlertChannels';
import StatusPage from './pages/StatusPage';
import Login from './pages/Login';

export default function App() {
  return (
    <Routes>
      {/* Public page, no top bar, no login */}
      <Route path="/status/:slug" element={<StatusPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/monitors/:id" element={<MonitorDetail />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/alert-channels" element={<AlertChannels />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <div className="empty">
              Page not found. <Link to="/">Go to monitors</Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
