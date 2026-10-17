export const pct = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? '–' : `${Number(v).toFixed(2)}%`);

export const ms = (v) => (v === null || v === undefined ? '–' : `${Math.round(v)} ms`);

export const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '–');

export function date(value) {
  if (!value) return '–';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function duration(start, end) {
  if (!start) return '–';
  const a = new Date(start);
  const b = end ? new Date(end) : new Date();
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return '–';
  const mins = Math.max(0, Math.round((b - a) / 60000));
  const text = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`;
  return end ? text : `${text} (still down)`;
}
