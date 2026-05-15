import { useEffect, useState } from 'react';
import { FolderKanban, MessageSquare, Image, Activity } from 'lucide-react';
import { api } from '../services/api.js';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, enquiries: 0, gallery: 0, newLeads: 0 });
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api.health().then(() => setStatus('Backend Connected')).catch(() => setStatus('Backend Not Connected'));
  }, []);

  const cards = [
    ['Total Projects', stats.projects || 0, FolderKanban],
    ['Total Enquiries', stats.enquiries || 0, MessageSquare],
    ['Gallery Images', stats.gallery || 0, Image],
    ['New Leads', stats.newLeads || 0, Activity]
  ];

  return (
    <section>
      <div className="pageHeader"><div><p>Welcome back</p><h1>DOMA Website Control Panel</h1></div><span className="status">{status}</span></div>
      <div className="cards">{cards.map(([label, value, Icon]) => <div className="card" key={label}><Icon /><p>{label}</p><h2>{value}</h2></div>)}</div>
      <div className="panel"><h2>Admin Purpose</h2><p>This dashboard connects with your existing backend APIs. Use it to add projects, update DOMA gallery/content and manage enquiries without changing frontend code manually.</p></div>
    </section>
  );
}
