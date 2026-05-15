import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

export default function Enquiries() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const load = () => api.enquiries().then(data => setItems(Array.isArray(data) ? data : data.enquiries || [])).catch(err => setMessage(err.message));
  useEffect(load, []);
  async function setStatus(id, status) { await api.updateEnquiry(id, { status }); load(); }
  async function remove(id) { if (!confirm('Delete enquiry?')) return; await api.deleteEnquiry(id); load(); }
  return <section><div className="pageHeader"><div><p>Customer Leads</p><h1>Enquiry Management</h1></div></div>{message && <div className="note">{message}</div>}<div className="tableWrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Message</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map(e => { const id=e._id||e.id; return <tr key={id}><td>{e.name}</td><td>{e.phone}</td><td>{e.email}</td><td>{e.message}</td><td><select value={e.status || 'New'} onChange={(x)=>setStatus(id,x.target.value)}><option>New</option><option>Contacted</option><option>Closed</option></select></td><td><a className="wa" href={`https://wa.me/${String(e.phone||'').replace(/\D/g,'')}`} target="_blank">WhatsApp</a><button className="danger" onClick={()=>remove(id)}>Delete</button></td></tr>})}</tbody></table></div></section>;
}
