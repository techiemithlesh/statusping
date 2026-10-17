/**
 * Public page. No login, no top bar.
 * API: GET /api/v1/status/{slug}
 *
 * Expected response:
 * { data: { page: "Example Co", services: [ { name, status, uptime_90d, history: ["up","down","warn", ...] } ] } }
 * `history` (one entry per day, oldest first) is optional.
 */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, errorMessage } from '../api/client';
import { label, pct } from '../lib/format';
import { Notice, Skeleton, StatusPill } from '../components/ui';

const DAY_CLASS = { up: '', down: 'down', warn: 'warn', degraded: 'warn' };

export default function StatusPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get(`/status/${encodeURIComponent(slug)}`)
        .then((d) => {
          if (!alive) return;
          setPage(d);
          setError(null);
          setRefreshedAt(new Date());
        })
        .catch((e) => alive && setError(errorMessage(e)))
        .finally(() => alive && setLoading(false));

    load();
    const timer = setInterval(load, 60000); // matches the 60s Redis cache
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [slug]);

  const services = (page?.services || []).map((s) => ({
    name: s.name,
    status: s.status ?? 'unknown',
    uptime: s.uptime_90d ?? s.uptime ?? null,
    history: Array.isArray(s.history) ? s.history.slice(-90) : [],
  }));
  const allUp = services.length > 0 && services.every((s) => s.status === 'up');

  return (
    <div className="status-wrap">
      <h1 className="page-title">{page?.page ?? 'System status'}</h1>
      <p className="page-sub">Live status of our services, updated every minute.</p>

      {loading && <section className="panel"><Skeleton rows={2} /></section>}
      {!loading && error && !page && <Notice error>{error}</Notice>}

      {page && (
        <>
          <div className={`banner ${allUp ? 'up' : 'down'}`}>
            {allUp ? 'All systems operational' : 'Some systems are having problems'}
          </div>

          <section className="panel">
            {services.length === 0 && <p className="muted">No services on this page yet.</p>}
            {services.map((s) => (
              <div className="svc" key={s.name}>
                <div className="svc-head">
                  <b>{s.name}</b>
                  <StatusPill status={s.status} text={s.status === 'up' ? 'Operational' : label(s.status)} />
                </div>
                {s.history.length > 0 && (
                  <div className="days" aria-label={`Daily status for the last ${s.history.length} days`}>
                    {s.history.map((day, idx) => (
                      <i key={idx} className={DAY_CLASS[day] ?? 'none'} />
                    ))}
                  </div>
                )}
                <div className="svc-foot">
                  <span>{s.history.length ? `${s.history.length} days ago` : ''}</span>
                  <span>{pct(s.uptime)} uptime</span>
                  <span>{s.history.length ? 'Today' : ''}</span>
                </div>
              </div>
            ))}
          </section>

          {refreshedAt && <p className="hint" style={{ marginTop: 12 }}>Last refreshed {refreshedAt.toLocaleTimeString()}</p>}
        </>
      )}
    </div>
  );
}
