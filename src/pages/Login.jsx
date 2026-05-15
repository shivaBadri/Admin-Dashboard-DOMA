import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Building2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('Venu_Kalyan');
  const [password, setPassword] = useState('VK@123uk');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // Demo Login Credentials
      if (
        email === 'Venu_Kalyan' &&
        password === 'VK@123uk'
      ) {
        localStorage.setItem('doma_admin_token', 'doma_secure_token');
        localStorage.setItem(
          'doma_admin_user',
          JSON.stringify({
            name: 'Venu Kalyan',
            username: 'Venu_Kalyan',
            role: 'Admin'
          })
        );

        navigate('/');
      } else {
        setError('Invalid Username or Password');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="loginPage">
      <form className="loginCard" onSubmit={submit}>

        <div className="loginLogo">
          <Building2 size={34} />
        </div>

        <h1>DOMA Admin Dashboard</h1>

        <p>
          Manage projects, enquiries, gallery and website content.
        </p>

        <label>
          <Mail size={17} /> Username
        </label>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          placeholder="Enter Username"
          required
        />

        <label>
          <Lock size={17} /> Password
        </label>

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter Password"
          required
        />

        {error && (
          <div className="errorBox">
            {error}
          </div>
        )}

        <button disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>

      </form>
    </div>
  );
}