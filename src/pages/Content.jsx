import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function Content() {
  const [form, setForm] = useState({ heroTitle: '', heroSubtitle: '', phone: '', email: '', whatsapp: '', address: '' });
  const [message, setMessage] = useState('');
  useEffect(() => { api.content().then(data => setForm({ ...form, ...(data.content || data) })).catch(()=>{}); }, []);
  async function save(e) { e.preventDefault(); try { await api.saveContent(form); setMessage('Website content saved'); } catch(err){ setMessage(err.message); } }
  return <section><div className="pageHeader"><div><p>Frontend Text</p><h1>Website Content Control</h1></div></div><form className="formGrid" onSubmit={save}><input className="wide" placeholder="Hero title" value={form.heroTitle} onChange={e=>setForm({...form,heroTitle:e.target.value})}/><textarea className="wide" placeholder="Hero subtitle" value={form.heroSubtitle} onChange={e=>setForm({...form,heroSubtitle:e.target.value})}></textarea><input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input placeholder="WhatsApp number" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/><input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><button>Save Content</button></form>{message && <div className="note">{message}</div>}<div className="panel"><b>Frontend connection:</b> Your live DOMA frontend must call <code>/api/content</code> and display these values.</div></section>;
}
