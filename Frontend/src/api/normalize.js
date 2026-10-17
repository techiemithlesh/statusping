/**
 * Map API responses to the shape the UI uses.
 * If your Laravel Resources use different keys, change them here only.
 */
import { duration } from '../lib/format';

export function toMonitor(m = {}) {
  const isActive = !(m.is_active === false || m.is_active === 0 || m.status === 'paused');
  return {
    id: m.id,
    name: m.name ?? m.url,
    url: m.url,
    status: isActive ? m.status ?? m.last_status ?? 'unknown' : 'paused',
    isActive,
    uptime: m.uptime_24h ?? m.uptime_percentage ?? m.uptime ?? null,
    responseMs: m.last_response_ms ?? m.response_time_ms ?? m.response_ms ?? null,
    interval: m.interval_seconds ?? m.check_interval ?? m.interval ?? null,
    channels: m.alert_channels ?? m.alertChannels ?? [],
  };
}

export function toPing(p = {}) {
  const up = p.status ? p.status === 'up' : p.is_up ?? (p.status_code >= 200 && p.status_code < 400);
  return {
    id: p.id,
    status: up ? 'up' : 'down',
    statusCode: p.status_code ?? p.http_status ?? null,
    responseMs: p.response_time_ms ?? p.response_ms ?? null,
    checkedAt: p.checked_at ?? p.created_at ?? null,
  };
}

export function toIncident(i = {}) {
  const startedAt = i.started_at ?? i.created_at ?? null;
  const endedAt = i.ended_at ?? i.resolved_at ?? null;
  return {
    id: i.id,
    status: i.status ?? (endedAt ? 'resolved' : 'ongoing'),
    monitorId: i.monitor_id ?? i.monitor?.id ?? null,
    monitorName: i.monitor?.name ?? i.monitor_name ?? (typeof i.monitor === 'string' ? i.monitor : null),
    cause: i.cause ?? i.error_message ?? i.reason ?? '',
    startedAt,
    endedAt,
    duration: i.duration ?? duration(startedAt, endedAt),
    alerts: i.alerts_sent ?? i.alert_logs ?? [],
  };
}

export function toChannel(c = {}) {
  return {
    id: c.id,
    type: c.type ?? c.driver ?? 'email',
    name: c.name ?? c.type,
    target: c.target ?? c.config?.email ?? c.config?.url ?? c.config?.webhook_url ?? '',
  };
}
