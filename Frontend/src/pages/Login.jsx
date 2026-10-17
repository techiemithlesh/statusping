/**
 * APIs used on this page (Phase 4, Sanctum):
 *   POST /api/v1/auth/login     { email, password }  -> { token, user }
 *   POST /api/v1/auth/register  { name, email, password, password_confirmation }
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage, fieldErrors, setToken } from '../api/client';
import { FieldError, Notice } from '../components/ui';

const EMPTY = { name: '', email: '', password: '', password_confirmation: '' };

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isLogin = mode === 'login';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError(null);
    try {
      const body = isLogin ? { email: form.email, password: form.password } : form;
      const res = await api.post(isLogin ? '/auth/login' : '/auth/register', body);
      const token = res?.token ?? res?.access_token ?? res?.data?.token;
      if (!token) throw new Error('No token in the response. Return { "token": "..." } from the API.');
      setToken(token);
      navigate('/');
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    }
    setBusy(false);
  }

  function switchMode() {
    setMode(isLogin ? 'register' : 'login');
    setErrors({});
    setError(null);
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <section className="panel auth-card">
      <h1 className="page-title">{isLogin ? 'Log in' : 'Create your account'}</h1>
      <p className="page-sub">Monitor your websites and get alerted when they go down.</p>

      <form onSubmit={submit}>
        {!isLogin && (
          <label htmlFor="a-name">
            Name
            <input id="a-name" value={form.name} onChange={update('name')} autoComplete="name" required />
            <FieldError errors={errors} name="name" />
          </label>
        )}
        <label htmlFor="a-email">
          Email
          <input id="a-email" type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
          <FieldError errors={errors} name="email" />
        </label>
        <label htmlFor="a-password">
          Password
          <input
            id="a-password"
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />
          <FieldError errors={errors} name="password" />
        </label>
        {!isLogin && (
          <label htmlFor="a-confirm">
            Confirm password
            <input
              id="a-confirm"
              type="password"
              value={form.password_confirmation}
              onChange={update('password_confirmation')}
              autoComplete="new-password"
              required
            />
          </label>
        )}

        <Notice error>{error}</Notice>

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
        </button>
      </form>

      <p style={{ margin: '16px 0 0' }}>
        <button className="btn" type="button" onClick={switchMode}>
          {isLogin ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
      </p>
    </section>
  );
}
