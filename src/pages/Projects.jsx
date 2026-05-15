import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const blank = { title: '', category: 'Residential', location: '', status: 'Completed', imageUrl: '', description: '' };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const load = () => api.projects().then(data => setProjects(Array.isArray(data) ? data : data.projects || [])).catch(err => setMessage(err.message));
  useEffect(load, []);

  async function save(e) {
    e.preventDefault(); setMessage('');
    try {
      if (editingId) await api.updateProject(editingId, form); else await api.createProject(form);
      setForm(blank); setEditingId(null); load(); setMessage('Project saved successfully');
    } catch (err) { setMessage(err.message); }
  }

  function edit(p) { setEditingId(p._id || p.id); setForm({ title: p.title || '', category: p.category || 'Residential', location: p.location || '', status: p.status || 'Completed', imageUrl: p.imageUrl || p.image || '', description: p.description || '' }); }
  async function remove(id) { if (!confirm('Delete this project?')) return; await api.deleteProject(id); load(); }

  return <section><div className="pageHeader"><div><p>DOMA Works</p><h1>Project Management</h1></div></div>
    <form className="formGrid" onSubmit={save}>
      <input placeholder="Project title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
      <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Residential</option><option>Commercial</option><option>Community</option></select>
      <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
      <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Completed</option><option>Ongoing</option></select>
      <input className="wide" placeholder="Image URL from existing website / Cloudinary / Supabase" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} />
      <textarea className="wide" placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}></textarea>
      <button>{editingId ? 'Update Project' : 'Add Project'}</button>{editingId && <button type="button" className="secondary" onClick={()=>{setEditingId(null);setForm(blank)}}>Cancel</button>}
    </form>
    {message && <div className="note">{message}</div>}
    <div className="tableWrap"><table><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Location</th><th>Action</th></tr></thead><tbody>{projects.map(p => <tr key={p._id || p.id}><td>{p.title}</td><td>{p.category}</td><td>{p.status}</td><td>{p.location}</td><td><button onClick={()=>edit(p)}>Edit</button><button className="danger" onClick={()=>remove(p._id || p.id)}>Delete</button></td></tr>)}</tbody></table></div>
  </section>;
}
