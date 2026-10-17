/**
 * APIs used on this page:
 *   GET    /api/v1/dashboard/summary   (falls back to counting the list if not built)
 *   GET    /api/v1/monitors
 *   POST   /api/v1/monitors
 *   POST   /api/v1/monitors/{id}/check
 *   PATCH  /api/v1/monitors/{id}/pause | resume
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage, fieldErrors, unwrap } from '../api/client';
import { toMonitor } from '../api/normalize';
import { ms, pct } from '../lib/format';
import { FieldError, Notice, Skeleton, StatusPill } from '../components/ui';
import { useToast } from '../components/Toast';

const EMPTY_FORM = { name: '', url: '', interval_seconds: 60 };

function countFromList(monitors) {
  const count = (s) => monitors.filter((m) => m.status === s).length;
  return { up: count('up'), down: count('down'), paused: count('paused'), ongoing_incidents: null };
}

export default function Dashboard() {
  const toast = useToast();
  const navigate = useNavigate();

  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiSummary, setApiSummary] = useState(null); // null = endpoint not built yet

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/monitors')
      .then((list) => setMonitors((list || []).map(toMonitor)))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));

    api
      .get('/dashboard/summary')
      .then(setApiSummary)
      .catch(() => setApiSummary(null));
  }, []);

  const summary = apiSummary ?? countFromList(monitors);

  async function addMonitor(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const created = unwrap(await api.post('/monitors', form));
      setMonitors((list) => [toMonitor(created), ...list]);
      setForm(EMPTY_FORM);
      setShowAdd(false);
      toast('Monitor created. The first check is queued.');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(errorMessage(err), 'error');
    }
    setSaving(false);
  }

  async function checkNow(m) {
    try {
      await api.post(`/monitors/${m.id}/check`);
      toast(`Check queued for ${m.name}.`);
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  async function togglePause(m) {
    const action = m.isActive ? 'pause' : 'resume';
    try {
      const updated = await api.patch(`/monitors/${m.id}/${action}`);
      const next = updated
        ? toMonitor(updated)
        : { ...m, isActive: action === 'resume', status: action === 'pause' ? 'paused' : 'unknown' };
      setMonitors((list) => list.map((x) => (x.id === m.id ? next : x)));
      toast(action === 'pause' ? `${m.name} paused.` : `${m.name} resumed.`);
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: field === 'interval_seconds' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Monitors</h1>
        <p className="page-sub">Every website and API you are watching, checked on a schedule by your queue workers.</p>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Overview</h2>
          {!apiSummary && <span className="hint">Counted from the list (GET /dashboard/summary is not built yet)</span>}
        </div>
        <div className="tiles">
          <div className="tile up"><b>{summary.up ?? '–'}</b><span>Up</span></div>
          <div className="tile down"><b>{summary.down ?? '–'}</b><span>Down</span></div>
          <div className="tile idle"><b>{summary.paused ?? '–'}</b><span>Paused</span></div>
          <div className="tile"><b>{summary.ongoing_incidents ?? '–'}</b><span>Ongoing incidents</span></div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>All monitors</h2>
          <button className="btn primary" type="button" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? 'Cancel' : '+ Add monitor'}
          </button>
        </div>

        {showAdd && (
          <form className="form-grid" onSubmit={addMonitor}>
            <label htmlFor="m-name">
              Name
              <input id="m-name" value={form.name} onChange={update('name')} placeholder="Main website" required />
              <FieldError errors={errors} name="name" />
            </label>
            <label htmlFor="m-url">
              URL
              <input id="m-url" type="url" value={form.url} onChange={update('url')} placeholder="https://example.com" required />
              <FieldError errors={errors} name="url" />
            </label>
            <label htmlFor="m-interval">
              Check every
              <select id="m-interval" value={form.interval_seconds} onChange={update('interval_seconds')}>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={900}>15 minutes</option>
              </select>
              <FieldError errors={errors} name="interval_seconds" />
            </label>
            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save monitor'}
            </button>
          </form>
        )}

        {loading && <Skeleton />}
        {!loading && error && <Notice error>{error}</Notice>}
        {!loading && !error && monitors.length === 0 && (
          <div className="empty">No monitors yet. Click “Add monitor” to watch your first website.</div>
        )}

        {!loading && monitors.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Monitor</th><th>Status</th><th>Uptime 24h</th><th>Response</th><th>Every</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {monitors.map((m) => (
                  <tr key={m.id} className="click" onClick={() => navigate(`/monitors/${m.id}`)}>
                    <td>
                      <div className="name">{m.name}</div>
                      <div className="url">{m.url}</div>
                    </td>
                    <td><StatusPill status={m.status} /></td>
                    <td className="num">{pct(m.uptime)}</td>
                    <td className="num">{ms(m.responseMs)}</td>
                    <td className="num">{m.interval ? `${m.interval}s` : '–'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="actions">
                        <button className="btn" type="button" onClick={() => checkNow(m)}>Check now</button>
                        <button className="btn" type="button" onClick={() => togglePause(m)}>
                          {m.isActive ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
