import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Building2 } from 'lucide-react';
import { api } from '../services/api.js';

export default function Login() {
  const [email, setEmail] = useState('admin@domabuild.co.uk');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('doma_admin_token', data.token);
      localStorage.setItem('doma_admin_user', JSON.stringify(data.admin || data.user || { email }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Check backend URL and credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="loginPage">
      <form className="loginCard" onSubmit={submit}>
        <div className="loginLogo"><Building2 size={34} /></div>
        <h1>DOMA Admin Dashboard</h1>
        <p>Manage projects, enquiries, website content and gallery.</p>
        <label><Mail size={17} /> Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label><Lock size={17} /> Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        {error && <div className="errorBox">{error}</div>}
        <button disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
    </div>
  );
}
