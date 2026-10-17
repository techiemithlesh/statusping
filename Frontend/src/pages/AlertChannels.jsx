/**
 * APIs used on this page:
 *   GET    /api/v1/alert-channels
 *   POST   /api/v1/alert-channels             { type, name, target }
 *   DELETE /api/v1/alert-channels/{id}
 *   POST   /api/v1/alert-channels/{id}/test   (AlertChannelFactory picks the class)
 */
import { useEffect, useState } from 'react';
import { api, errorMessage, fieldErrors, unwrap } from '../api/client';
import { toChannel } from '../api/normalize';
import { label } from '../lib/format';
import { FieldError, Notice, Skeleton } from '../components/ui';
import { useToast } from '../components/Toast';

const EMPTY_FORM = { type: 'email', name: '', target: '' };
const TARGET_LABEL = { email: 'Email address', slack: 'Slack webhook URL', webhook: 'Webhook URL' };

export default function AlertChannels() {
  const toast = useToast();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [armed, setArmed] = useState(null);

  useEffect(() => {
    api
      .get('/alert-channels')
      .then((list) => setChannels((list || []).map(toChannel)))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  async function add(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const created = unwrap(await api.post('/alert-channels', form));
      setChannels((list) => [...list, toChannel(created)]);
      setForm(EMPTY_FORM);
      toast('Alert channel added.');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(errorMessage(err), 'error');
    }
    setSaving(false);
  }

  async function test(c) {
    try {
      await api.post(`/alert-channels/${c.id}/test`);
      toast(`Test alert sent to ${c.name}.`);
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  async function remove(c) {
    if (armed !== c.id) {
      setArmed(c.id);
      return;
    }
    try {
      await api.delete(`/alert-channels/${c.id}`);
      setChannels((list) => list.filter((x) => x.id !== c.id));
      toast(`${c.name} removed.`);
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
    setArmed(null);
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Alert channels</h1>
        <p className="page-sub">Where StatusPing sends a message when a monitor goes down or comes back up.</p>
      </div>

      <section className="panel">
        <div className="panel-head"><h2>Your channels</h2></div>
        {loading && <Skeleton rows={2} />}
        {!loading && error && <Notice error>{error}</Notice>}
        {!loading && !error && channels.length === 0 && (
          <div className="empty">No channels yet. Add an email, Slack or webhook channel below.</div>
        )}
        {!loading && channels.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Sends to</th><th>Actions</th></tr></thead>
              <tbody>
                {channels.map((c) => (
                  <tr key={c.id}>
                    <td className="name">{c.name}</td>
                    <td>{label(c.type)}</td>
                    <td className="url">{c.target || '–'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn" type="button" onClick={() => test(c)}>Send test</button>
                        <button className={`btn danger ${armed === c.id ? 'armed' : ''}`} type="button" onClick={() => remove(c)}>
                          {armed === c.id ? 'Click again' : 'Remove'}
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

      <section className="panel">
        <div className="panel-head"><h2>Add channel</h2></div>
        <form className="form-grid" onSubmit={add}>
          <label htmlFor="c-type">
            Type
            <select id="c-type" value={form.type} onChange={update('type')}>
              <option value="email">Email</option>
              <option value="slack">Slack</option>
              <option value="webhook">Webhook</option>
            </select>
          </label>
          <label htmlFor="c-name">
            Name
            <input id="c-name" value={form.name} onChange={update('name')} placeholder="On-call team" required />
            <FieldError errors={errors} name="name" />
          </label>
          <label htmlFor="c-target">
            {TARGET_LABEL[form.type]}
            <input id="c-target" type={form.type === 'email' ? 'email' : 'url'} value={form.target} onChange={update('target')} required />
            <FieldError errors={errors} name="target" />
          </label>
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? 'Adding…' : 'Add channel'}
          </button>
        </form>
      </section>
    </div>
  );
}
