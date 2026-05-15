import { useState } from 'react';
import { api } from '../services/api.js';

export default function Settings() {
  const [status, setStatus] = useState('');
  async function test() { try { await api.health(); setStatus('Backend connected successfully'); } catch(err) { setStatus('Backend failed: ' + err.message); } }
  return <section><div className="pageHeader"><div><p>Deployment</p><h1>Settings</h1></div></div><div className="panel"><p><b>API Base URL:</b></p><code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}</code><br/><br/><button onClick={test}>Test Backend Connection</button>{status && <div className="note">{status}</div>}</div></section>;
}
