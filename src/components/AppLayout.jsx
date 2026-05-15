import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, LayoutDashboard, FolderKanban, MessageSquare, FileText, Settings, LogOut, ExternalLink } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/enquiries', label: 'Enquiries', icon: MessageSquare },
  { to: '/content', label: 'Website Content', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function AppLayout() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('doma_admin_token');
    localStorage.removeItem('doma_admin_user');
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon"><Building2 size={24} /></div>
          <div><h2>DOMA</h2><p>Admin Control</p></div>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <a className="visitSite" href={import.meta.env.VITE_SITE_URL || 'https://domabuild.co.uk'} target="_blank">
          <ExternalLink size={17} /> View Live Site
        </a>
        <button className="logout" onClick={logout}><LogOut size={17} /> Logout</button>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
