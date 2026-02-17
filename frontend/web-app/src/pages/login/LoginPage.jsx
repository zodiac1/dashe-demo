
import { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { saveSession } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const data = await response.json();
      if (data.access_token && data.username) {
        saveSession({ access_token: data.access_token, username: data.username, role: data.role });
      }
      if (onLogin) {
        onLogin(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overview-page">
      <div className="overview-card login-card">
        <h2 className="overview-title">🔐 Login</h2>
        <form className="overview-date-form login-form" onSubmit={handleSubmit}>
          <label className="overview-date-label login-label">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="overview-date-input login-input"
              placeholder="Username"
            />
          </label>
          <label className="overview-date-label login-label">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="overview-date-input login-input"
              placeholder="Password"
            />
          </label>
          <button
            type="submit"
            className="overview-timeline-reset login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <div className="overview-error login-error">{error}</div>}
      </div>
    </div>
  );
}

export default LoginPage;
