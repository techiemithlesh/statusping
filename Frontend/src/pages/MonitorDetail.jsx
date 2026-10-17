/**
 * APIs used on this page:
 *   GET    /api/v1/monitors/{id}
 *   PUT    /api/v1/monitors/{id}
 *   DELETE /api/v1/monitors/{id}
 *   GET    /api/v1/monitors/{id}/uptime
 *   GET    /api/v1/monitors/{id}/pings?per_page=24
 *   GET    /api/v1/monitors/{id}/incidents
 *   POST   /api/v1/monitors/{id}/check
 *   GET    /api/v1/alert-channels
 *   POST   /api/v1/monitors/{id}/alert-channels   { alert_channel_ids: [] }
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorMessage, fieldErrors } from '../api/client';
import { toChannel, toIncident, toMonitor, toPing } from '../api/normalize';
import { date, ms, pct } from '../lib/format';
import { FieldError, Notice, ResponseChart, Skeleton, StatusPill } from '../components/ui';
import { useToast } from '../components/Toast';

/** Loads one section independently, so one missing endpoint doesn't break the page. */
function useSection(loader, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let alive = true;
    loader()
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((e) => alive && setState({ data: null, error: errorMessage(e), loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export default function MonitorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [monitor, setMonitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selected, setSelected] = useState([]);

  const uptime = useSection(async () => {
    const d = await api.get(`/monitors/${id}/uptime`);
    return d?.uptime_percentage ?? d?.uptime ?? d?.percentage ?? (typeof d === 'number' ? d : null);
  }, [id]);
  const pings = useSection(async () => ((await api.get(`/monitors/${id}/pings?per_page=24`)) || []).map(toPing), [id]);
  const incidents = useSection(async () => ((await api.get(`/monitors/${id}/incidents`)) || []).map(toIncident), [id]);
  const channels = useSection(async () => ((await api.get('/alert-channels')) || []).map(toChannel), []);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/monitors/${id}`)
      .then((d) => {
        const m = toMonitor(d);
        setMonitor(m);
        setForm({ name: m.name, url: m.url, interval_seconds: m.interval ?? 60 });
        setSelected((m.channels || []).map((c) => c.id));
      })
      .catch((e) => setFatal(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      const updated = await api.put(`/monitors/${id}`, form);
      setMonitor((m) => ({ ...m, ...toMonitor(updated) }));
      setEditing(false);
      toast('Monitor updated.');
    } catch (err) {
      setFormErrors(fieldErrors(err));
      toast(errorMessage(err), 'error');
    }
    setSaving(false);
  }

  async function remove() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await api.delete(`/monitors/${id}`);
      toast('Monitor deleted.');
      navigate('/');
    } catch (err) {
      setConfirmDelete(false);
      toast(errorMessage(err), 'error');
    }
  }

  async function checkNow() {
    try {
      await api.post(`/monitors/${id}/check`);
      toast('Check queued. Refresh in a few seconds to see the result.');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  async function saveChannels(e) {
    e.preventDefault();
    try {
      await api.post(`/monitors/${id}/alert-channels`, { alert_channel_ids: selected });
      toast('Alert channels saved.');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  const toggleChannel = (channelId) =>
    setSelected((list) => (list.includes(channelId) ? list.filter((x) => x !== channelId) : [...list, channelId]));

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: field === 'interval_seconds' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="stack">
      <Link to="/" className="btn" style={{ alignSelf: 'flex-start' }}>← All monitors</Link>

      {loading && <section className="panel"><Skeleton rows={2} /></section>}
      {fatal && <Notice error>{fatal}</Notice>}

      {monitor && (
        <>
          <section className="panel">
            <div className="panel-head">
              <div>
                <h1 className="page-title">{monitor.name}</h1>
                <div className="url mono">
                  {monitor.url}
                  {monitor.interval ? ` · every ${monitor.interval}s` : ''}
                </div>
              </div>
              <StatusPill status={monitor.status} />
            </div>
            <div className="actions">
              <button className="btn" type="button" onClick={checkNow}>Check now</button>
              <button className="btn" type="button" onClick={() => setEditing((v) => !v)}>
                {editing ? 'Cancel edit' : 'Edit'}
              </button>
              <button className={`btn danger ${confirmDelete ? 'armed' : ''}`} type="button" onClick={remove}>
                {confirmDelete ? 'Click again to delete' : 'Delete'}
              </button>
            </div>

            {editing && (
              <form className="form-grid" style={{ marginTop: 14 }} onSubmit={save}>
                <label htmlFor="e-name">
                  Name
                  <input id="e-name" value={form.name} onChange={update('name')} required />
                  <FieldError errors={formErrors} name="name" />
                </label>
                <label htmlFor="e-url">
                  URL
                  <input id="e-url" type="url" value={form.url} onChange={update('url')} required />
                  <FieldError errors={formErrors} name="url" />
                </label>
                <label htmlFor="e-interval">
                  Check every (seconds)
                  <input id="e-interval" type="number" min="30" value={form.interval_seconds} onChange={update('interval_seconds')} />
                  <FieldError errors={formErrors} name="interval_seconds" />
                </label>
                <button className="btn primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            )}
          </section>

          <div className="row">
            <section className="panel">
              <h3>Uptime, last 24 hours</h3>
              {uptime.error ? <Notice>{uptime.error}</Notice> : <div className="big">{uptime.loading ? '…' : pct(uptime.data)}</div>}
            </section>
            <section className="panel">
              <h3>Response time, last 24 checks</h3>
              {pings.error && <Notice>{pings.error}</Notice>}
              {!pings.error && !pings.loading && !pings.data?.length && <p className="muted">No checks recorded yet.</p>}
              {pings.data?.length > 0 && (
                <>
                  <ResponseChart pings={pings.data} />
                  <p className="hint">Blue = response time · Red = failed check</p>
                </>
              )}
            </section>
          </div>

          <section className="panel">
            <h3>Recent checks</h3>
            {pings.error && <Notice>{pings.error}</Notice>}
            {pings.data?.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Checked at</th><th>Status</th><th>HTTP</th><th>Response</th></tr></thead>
                  <tbody>
                    {pings.data.slice(0, 10).map((p) => (
                      <tr key={p.id}>
                        <td className="num">{date(p.checkedAt)}</td>
                        <td><StatusPill status={p.status} /></td>
                        <td className="num">{p.statusCode ?? '–'}</td>
                        <td className="num">{ms(p.responseMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="row">
            <section className="panel">
              <h3>Incidents</h3>
              {incidents.error && <Notice>{incidents.error}</Notice>}
              {!incidents.error && !incidents.loading && !incidents.data?.length && (
                <p className="muted">No incidents. This monitor has been healthy.</p>
              )}
              {incidents.data?.map((i) => (
                <div className="svc" key={i.id}>
                  <div className="svc-head">
                    <b>#{i.id}{i.cause ? ` · ${i.cause}` : ''}</b>
                    <StatusPill status={i.status} />
                  </div>
                  <div className="hint">{date(i.startedAt)} · {i.duration}</div>
                </div>
              ))}
            </section>

            <section className="panel">
              <h3>Send alerts for this monitor to</h3>
              {channels.error && <Notice>{channels.error}</Notice>}
              {!channels.error && !channels.loading && !channels.data?.length && (
                <p className="muted">No alert channels yet. <Link to="/alert-channels">Add one</Link>.</p>
              )}
              {channels.data?.length > 0 && (
                <form className="checks" onSubmit={saveChannels}>
                  {channels.data.map((c) => (
                    <label key={c.id} htmlFor={`ch-${c.id}`}>
                      <input type="checkbox" id={`ch-${c.id}`} checked={selected.includes(c.id)} onChange={() => toggleChannel(c.id)} />
                      {c.name} <span className="muted">({c.type})</span>
                    </label>
                  ))}
                  <div><button className="btn primary" type="submit">Save channels</button></div>
                </form>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
