import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: Location } };
  const [email, setEmail] = useState("admin@demo.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="login-page">
      {/* Background orbs */}
      <div className="login-bg-orb" style={{ width: 600, height: 600, background: "#f97316", top: -200, left: -200 }} />
      <div className="login-bg-orb" style={{ width: 400, height: 400, background: "#fb7185", bottom: -100, right: 200 }} />

      {/* Left panel */}
      <div className="login-left">
        <div className="login-hero-text">
          <div className="login-logo" style={{ marginBottom: "2.5rem" }}>
            <div className="login-logo-icon">✨</div>
            <div className="login-logo-text">EVES<span> Spa &amp; Salon</span></div>
          </div>
          <h1 className="login-hero-title">
            Run your salon<br /><span>smarter</span>.
          </h1>
          <p className="login-hero-sub">
            Track staff services, calculate incentives, and generate combined customer bills — all in one beautiful dashboard.
          </p>
          <div className="login-feature">
            <div className="login-feature-icon">💼</div>
            <div className="login-feature-text">
              <strong>Role‑based dashboards</strong>
              Admin, Owner &amp; Staff views
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📊</div>
            <div className="login-feature-text">
              <strong>Live analytics</strong>
              Revenue, performance &amp; incentives
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">🧾</div>
            <div className="login-feature-text">
              <strong>Combined billing</strong>
              One bill, multiple staff &amp; services
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-logo" style={{ marginBottom: "1.5rem" }}>
            <div className="login-logo-icon" style={{ width: 36, height: 36, fontSize: "1.1rem" }}>✨</div>
            <div className="login-logo-text" style={{ fontSize: "1.2rem" }}>EVES<span> Spa &amp; Salon</span></div>
          </div>
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to your dashboard</p>

          {error && <div className="error-banner">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="login-label">Email address</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@salon.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="login-label">Password</label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={submitting}
              style={{ justifyContent: "center", marginTop: "0.5rem", width: "100%", padding: "0.75rem" }}
            >
              {submitting ? "⏳ Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className="login-creds">
            <div className="login-creds-title">🔑 Demo Credentials</div>
            {[
              { label: "Admin",  email: "admin@demo.local", pass: "admin123" },
              { label: "Owner",  email: "owner@salon.com",  pass: "owner123" },
              { label: "Staff",  email: "kriti@salon.com",  pass: "staff123" },
            ].map(c => (
              <div key={c.label} className="login-cred-row" style={{ marginBottom: 4 }}>
                <span style={{ color: "#64748b", width: 50 }}>{c.label}</span>
                <span className="login-cred-email" style={{ cursor: "pointer" }} onClick={() => quickLogin(c.email, c.pass)}>
                  {c.email}
                </span>
                <span style={{ color: "#64748b", fontSize: "0.72rem" }}>{c.pass}</span>
              </div>
            ))}
            <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "0.5rem" }}>
              💡 Click any email above to auto‑fill
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
