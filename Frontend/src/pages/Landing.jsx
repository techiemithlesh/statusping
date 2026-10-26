import { Link } from 'react-router-dom';

const HISTORY = [
  'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up',
  'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up',
  'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up', 'up',
];

function Brand() {
  return (
    <Link to="/" className="brand-mark">
      <span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span>
      <span>statusping</span>
    </Link>
  );
}

function UptimeBars() {
  return (
    <div className="preview-bars" aria-label="36 successful status checks">
      {HISTORY.map((status, index) => <i className={status} key={index} />)}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <nav className="site-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <div className="site-actions">
            <Link className="site-login" to="/login">Log in</Link>
            <Link className="button button-dark button-small" to="/register">Start monitoring <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="live-dot" /> Simple, reliable uptime monitoring</div>
              <h1>Know when it’s<br />down. <span>Before they do.</span></h1>
              <p className="hero-description">
                Keep an eye on every website and API that matters. Get a clear signal when something changes, and get back to building.
              </p>
              <div className="hero-actions">
                <Link className="button button-dark" to="/register">Get started for free <span aria-hidden="true">→</span></Link>
                <a className="text-link" href="#features">See how it works <span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack" aria-hidden="true"><i>J</i><i>M</i><i>A</i><i>+</i></div>
                <span>Built for the people who keep the internet running.</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="Example StatusPing monitoring dashboard">
              <div className="visual-glow" />
              <div className="dashboard-preview">
                <div className="preview-topbar">
                  <div className="preview-brand"><span className="brand-symbol"><i /><i /><i /></span> statusping <span className="preview-workspace">/ workspace</span></div>
                  <span className="preview-avatar">JD</span>
                </div>
                <div className="preview-content">
                  <div className="preview-heading">
                    <div><span className="preview-overline">MONDAY, OCTOBER 26</span><h2>Good morning, Jamie <span>✳</span></h2></div>
                    <span className="preview-range">Last 24 hours⌄</span>
                  </div>
                  <div className="preview-stats">
                    <div><span>HEALTHY MONITORS</span><b>12 <em>of 12</em></b><small className="positive">↗ All systems operational</small></div>
                    <div><span>AVERAGE UPTIME</span><b>99.98<em>%</em></b><small>Across all monitors</small></div>
                    <div><span>AVG. RESPONSE</span><b>184<em>ms</em></b><small>↓ 12ms from yesterday</small></div>
                  </div>
                  <div className="preview-list-head"><b>Your monitors</b><span>View all <i>→</i></span></div>
                  <div className="preview-monitor">
                    <span className="preview-check">✓</span><span className="preview-service"><b>Acme storefront</b><small>acme.store</small></span>
                    <UptimeBars /><span className="preview-uptime">99.99%</span><span className="preview-pill">Operational</span>
                  </div>
                  <div className="preview-monitor">
                    <span className="preview-check">✓</span><span className="preview-service"><b>Core API</b><small>api.acme.store</small></span>
                    <UptimeBars /><span className="preview-uptime">99.97%</span><span className="preview-pill">Operational</span>
                  </div>
                  <div className="preview-monitor">
                    <span className="preview-check">✓</span><span className="preview-service"><b>Customer portal</b><small>app.acme.store</small></span>
                    <UptimeBars /><span className="preview-uptime">99.98%</span><span className="preview-pill">Operational</span>
                  </div>
                </div>
              </div>
              <div className="floating-alert"><span className="alert-check">✓</span><span><b>You’re all clear</b><small>Every service is responding</small></span><i className="live-dot" /></div>
              <div className="visual-caption"><span className="caption-line" /> Your infrastructure, at a glance</div>
            </div>
          </div>
          <div className="hero-bottom">
            <span>THE SIGNAL IN THE NOISE</span>
            <span className="hero-bottom-line" />
            <span>Monitoring made refreshingly simple</span>
          </div>
        </section>

        <section className="trust-strip">
          <span>PEACE OF MIND FOR YOUR DIGITAL WORLD</span>
          <div><b>WEBSITE</b><b>API</b><b>STORE</b><b>SAAS</b><b>OPEN SOURCE</b></div>
        </section>

        <section className="features-section" id="features">
          <div className="section-intro">
            <span className="section-kicker">THE IMPORTANT THINGS, COVERED</span>
            <h2>Less wondering.<br /><span>More knowing.</span></h2>
            <p>Everything you need to spot a problem, understand what happened, and keep the people who count in the loop.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card feature-wide">
              <div className="feature-graphic response-graphic"><div className="graphic-axis"><span>1.2s</span><span>600ms</span><span>0ms</span></div><div className="response-line"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="graphic-time"><span>10:00</span><span>10:15</span><span>10:30</span><span>10:45</span></div><span className="graph-tooltip">184 ms <i /> responding</span></div>
              <span className="feature-number">01 / VISIBILITY</span>
              <h3>A clear picture, at a glance.</h3>
              <p>See uptime, response times, and recent check history for every service in one calm, focused dashboard.</p>
            </article>
            <article className="feature-card">
              <div className="feature-graphic alert-graphic"><div className="alert-card"><span className="alert-icon">!</span><span><b>Checkout API is down</b><small>We’ll let you know when it’s back.</small></span><span className="alert-time">just now</span></div><div className="alert-card alert-card-muted"><span className="alert-icon">✓</span><span><b>We’re on it</b><small>Recovery notification sent</small></span></div></div>
              <span className="feature-number">02 / ALERTS</span>
              <h3>Be the first to know.</h3>
              <p>Get notified when a monitor needs your attention and when it’s healthy again.</p>
            </article>
            <article className="feature-card">
              <div className="feature-graphic uptime-graphic"><div className="uptime-head"><span>LAST 90 DAYS</span><b>99.98%</b></div><div className="uptime-bar">{Array.from({ length: 48 }, (_, i) => <i className={i === 29 ? 'uptime-dip' : ''} key={i} />)}</div><div className="uptime-foot"><span>90 days ago</span><span>Today</span></div></div>
              <span className="feature-number">03 / TRANSPARENCY</span>
              <h3>Share a little confidence.</h3>
              <p>Give customers a public status page that answers “is it just me?” before they have to ask.</p>
            </article>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-heading"><span className="section-kicker">UP AND RUNNING IN MINUTES</span><h2>Three steps to <span>peace of mind.</span></h2></div>
          <div className="steps">
            <article><span>01</span><h3>Add what matters</h3><p>Point StatusPing to your website or API. You choose what to keep an eye on.</p></article>
            <article><span>02</span><h3>We keep watch</h3><p>Scheduled checks keep tabs on your services while you focus on your work.</p></article>
            <article><span>03</span><h3>Get the signal</h3><p>If something changes, your team knows. When it recovers, you know that too.</p></article>
          </div>
          <Link className="button button-light" to="/register">Start your first monitor <span aria-hidden="true">→</span></Link>
        </section>

        <section className="closing-cta">
          <div className="closing-orbit orbit-one" /><div className="closing-orbit orbit-two" />
          <div className="closing-content"><span className="section-kicker">YOUR NEXT DEPLOY, WITH CONFIDENCE</span><h2>Let’s keep things<br /><span>running smoothly.</span></h2><p>Set up your first monitor and see your services in a whole new light.</p><Link className="button button-dark" to="/register">Create your free account <span aria-hidden="true">→</span></Link></div>
          <div className="closing-status"><span className="live-dot" /> All systems operational</div>
        </section>
      </main>

      <footer className="site-footer"><Brand /><span>Made for the moments when everything just works.</span><div><Link to="/login">Log in</Link><a href="#features">Features</a><Link to="/register">Get started</Link></div><small>© {new Date().getFullYear()} StatusPing</small></footer>
    </div>
  );
}
