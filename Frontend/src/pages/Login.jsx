import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api, errorMessage, fieldErrors, setToken, setUser } from '../api/client';
import { FieldError, Notice } from '../components/ui';

const EMPTY = { name: '', email: '', password: '', password_confirmation: '' };

function Brand() {
  return (
    <Link to="/" className="brand-mark">
      <span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span>
      <span>statusping</span>
    </Link>
  );
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ ...EMPTY, email: searchParams.get('email') || '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(location.state?.message || null);
  const [busy, setBusy] = useState(false);

  const mode = location.pathname === '/register'
    ? 'register'
    : location.pathname === '/forgot-password'
      ? 'forgot'
      : location.pathname === '/reset-password'
        ? 'reset'
        : 'login';
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError(null);
    setSuccess(null);
    try {
      if (isForgot) {
        await api.post('/auth/forgot-password', { email: form.email });
        setSuccess('If an account exists for that email, we’ve sent a password reset link.');
      } else if (isReset) {
        await api.post('/auth/reset-password', {
          email: form.email,
          token: searchParams.get('token') || '',
          password: form.password,
          password_confirmation: form.password_confirmation,
        });
        setSuccess('Your password has been reset. You can now log in.');
        navigate('/login', { replace: true, state: { message: 'Your password has been reset. Please log in.' } });
      } else {
        const body = isLogin
          ? { email: form.email, password: form.password }
          : form;
        const response = await api.post(isLogin ? '/auth/login' : '/auth/register', body);
        const data = response?.data ?? response;
        const token = data?.token ?? data?.access_token;
        if (!token) throw new Error('The API response did not include an authentication token.');
        setToken(token);
        setUser(data?.user || null);
        const destination = isLogin ? location.state?.from || '/dashboard' : '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const update = (field) => (e) => setForm((current) => ({ ...current, [field]: e.target.value }));
  const heading = isLogin ? 'Welcome back' : isRegister ? 'Create your account' : isForgot ? 'Reset your password' : 'Choose a new password';
  const subheading = isLogin
    ? 'Sign in to check in on everything you’ve got running.'
    : isRegister
      ? 'A clearer view of your uptime starts here.'
      : isForgot
        ? 'Enter your email and we’ll send you a link to reset your password.'
        : 'Choose a new password for your StatusPing account.';

  return (
    <div className="auth-page">
      <header className="auth-header"><Brand /><Link to="/" className="auth-home">Back to home <span aria-hidden="true">↗</span></Link></header>
      <main className="auth-layout">
        <section className="auth-promo">
          <span className="section-kicker">THE SIGNAL IN THE NOISE</span>
          <h1>Keep the<br />important things<br /><span>running.</span></h1>
          <p>Simple, dependable monitoring for the websites and APIs your business relies on.</p>
          <div className="auth-promo-status"><span className="live-dot" /><span><b>All systems operational</b><small>Your next check is just around the corner.</small></span></div>
          <div className="auth-promo-lines" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        </section>

        <section className="auth-form-wrap">
          <div className="auth-form-card">
            <span className="auth-kicker">{isLogin ? 'YOUR WORKSPACE IS WAITING' : isRegister ? 'START WITH A CLEAR SIGNAL' : 'ACCOUNT RECOVERY'}</span>
            <h2>{heading}</h2>
            <p className="auth-description">{subheading}</p>

            <form onSubmit={submit} className="auth-form">
              {isRegister && (
                <label htmlFor="a-name">Your name
                  <input id="a-name" value={form.name} onChange={update('name')} autoComplete="name" placeholder="Jamie Smith" required />
                  <FieldError errors={errors} name="name" />
                </label>
              )}
              <label htmlFor="a-email">Email address
                <input id="a-email" type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="you@company.com" required />
                <FieldError errors={errors} name="email" />
              </label>
              {!isForgot && (
                <label htmlFor="a-password">{isReset ? 'New password' : 'Password'}
                  <input id="a-password" type="password" value={form.password} onChange={update('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder={isLogin ? 'Enter your password' : 'At least 8 characters'} required />
                  <FieldError errors={errors} name="password" />
                </label>
              )}
              {(isRegister || isReset) && (
                <label htmlFor="a-confirm">Confirm password
                  <input id="a-confirm" type="password" value={form.password_confirmation} onChange={update('password_confirmation')} autoComplete="new-password" placeholder="Enter your password again" required />
                  <FieldError errors={errors} name="password_confirmation" />
                </label>
              )}
              {isLogin && <div className="auth-forgot"><Link to="/forgot-password">Forgot password?</Link></div>}
              <Notice error>{error}</Notice>
              <Notice>{success}</Notice>
              <button className="button button-dark auth-submit" type="submit" disabled={busy}>
                {busy ? 'Please wait…' : isLogin ? 'Sign in' : isRegister ? 'Create account' : isForgot ? 'Send reset link' : 'Reset password'}
                {!busy && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="auth-switch">
              {isLogin ? <>New to StatusPing? <Link to="/register">Create an account</Link></> : isRegister ? <>Already have an account? <Link to="/login">Sign in</Link></> : <>Remembered your password? <Link to="/login">Back to sign in</Link></>}
            </div>
            <p className="auth-legal">By continuing, you agree to our <a href="#terms">Terms of service</a> and <a href="#privacy">Privacy policy</a>.</p>
          </div>
        </section>
      </main>
      <footer className="auth-footer"><span>© {new Date().getFullYear()} StatusPing</span><span>Thoughtful monitoring, for everyone.</span></footer>
    </div>
  );
}
