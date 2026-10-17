import { label } from '../lib/format';

export function StatusPill({ status, text }) {
  const cls = status === 'up' ? 'up' : status === 'down' || status === 'ongoing' ? 'down' : '';
  return <span className={`pill ${cls}`}>{text ?? label(status)}</span>;
}

export function Notice({ children, error = false }) {
  if (!children) return null;
  return <p className={`notice ${error ? 'error' : ''}`}>{children}</p>;
}

export function Skeleton({ rows = 3 }) {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}

export function FieldError({ errors, name }) {
  const msg = errors?.[name]?.[0];
  return msg ? <small className="err">{msg}</small> : null;
}

/** Response-time bars, oldest on the left. Red bar = failed check. */
export function ResponseChart({ pings }) {
  if (!pings.length) return null;
  const list = [...pings].reverse();
  const max = Math.max(1, ...list.map((p) => p.responseMs || 0));
  const w = 300 / list.length;
  return (
    <svg className="spark" viewBox="0 0 300 70" preserveAspectRatio="none" role="img" aria-label="Response time per check">
      {list.map((p, i) => {
        const h = p.responseMs ? Math.max(3, (p.responseMs / max) * 64) : 64;
        return (
          <rect
            key={p.id ?? i}
            x={i * w + 1}
            y={70 - h}
            width={Math.max(1, w - 2)}
            height={h}
            rx="1.5"
            fill={p.status === 'up' ? 'var(--accent)' : 'var(--down)'}
          >
            <title>{p.responseMs ? `${p.responseMs} ms` : 'Failed'}</title>
          </rect>
        );
      })}
    </svg>
  );
}
