/**
 * APIs used on this page:
 *   GET /api/v1/incidents?status=ongoing|resolved
 *   GET /api/v1/incidents/{id}
 */
import { useEffect, useRef, useState } from 'react';
import { api, errorMessage } from '../api/client';
import { toIncident } from '../api/normalize';
import { date } from '../lib/format';
import { Notice, Skeleton, StatusPill } from '../components/ui';

export default function Incidents() {
  const [filter, setFilter] = useState('ongoing');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelected(null);
    const query = filter === 'all' ? '' : `?status=${filter}`;
    api
      .get(`/incidents${query}`)
      .then((list) => setIncidents((list || []).map(toIncident)))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (selected) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selected]);

  async function open(i) {
    setDetailError(null);
    try {
      setSelected(toIncident(await api.get(`/incidents/${i.id}`)));
    } catch (e) {
      setSelected(i);
      setDetailError(errorMessage(e));
    }
  }

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Incidents</h1>
        <p className="page-sub">An incident opens when a monitor goes down and closes when it comes back up.</p>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Incident history</h2>
          <label htmlFor="inc-filter" className="inline-label">
            Show
            <select id="inc-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ongoing">Ongoing</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>

        {loading && <Skeleton rows={2} />}
        {!loading && error && <Notice error>{error}</Notice>}
        {!loading && !error && incidents.length === 0 && (
          <div className="empty">{filter === 'ongoing' ? 'Nothing is down right now.' : 'No incidents for this filter.'}</div>
        )}

        {!loading && incidents.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Monitor</th><th>Status</th><th>Started</th><th>Duration</th><th>Cause</th></tr></thead>
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.id} className="click" onClick={() => open(i)}>
                    <td className="num">{i.id}</td>
                    <td className="name">{i.monitorName ?? `Monitor #${i.monitorId}`}</td>
                    <td><StatusPill status={i.status} /></td>
                    <td className="num">{date(i.startedAt)}</td>
                    <td className="num">{i.duration}</td>
                    <td className="url">{i.cause || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <section className="panel" ref={detailRef}>
          <div className="panel-head">
            <h2>Incident #{selected.id}</h2>
            <StatusPill status={selected.status} />
          </div>
          <Notice>{detailError}</Notice>
          <div className="row">
            <div><h3>Monitor</h3>{selected.monitorName ?? `#${selected.monitorId}`}</div>
            <div><h3>Cause</h3>{selected.cause || '–'}</div>
            <div><h3>Started</h3><span className="num">{date(selected.startedAt)}</span></div>
            <div><h3>Ended</h3><span className="num">{selected.endedAt ? date(selected.endedAt) : 'Still ongoing'}</span></div>
          </div>
          {selected.alerts.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <h3>Alerts sent</h3>
              {selected.alerts.map((a, idx) => (
                <div className="hint" key={idx}>
                  {a.channel?.name ?? a.channel ?? 'Channel'} · {a.status ?? ''}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
