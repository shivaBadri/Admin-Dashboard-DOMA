import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  FolderOpen,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  Wrench
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase.js';
import heroImage from './assets/construction-sunset.png';
import './styles.css';

const logoMark = '⬢';

const navItems = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['content', 'Website Content', FileText],
  ['projects', 'Projects', BriefcaseBusiness],
  ['services', 'Services', Wrench],
  ['sectors', 'Sectors', Building2],
  ['media', 'Media Library', ImageIcon],
  ['testimonials', 'Testimonials', CheckCircle2],
  ['team', 'Team', Users],
  ['enquiries', 'Enquiries', Mail],
  ['seo', 'SEO', BarChart3],
  ['settings', 'Settings', Settings],
  ['logs', 'Activity Logs', Activity]
];

const projectsSeed = [
  { title: 'Modern Home Extension', category: 'Residential', location: 'Mayfair, London', status: 'Published', date: 'May 15, 2024', img: heroImage },
  { title: 'Kitchen Renovation', category: 'Residential', location: 'Hampstead, London', status: 'Published', date: 'May 10, 2024', img: heroImage },
  { title: 'Loft Conversion', category: 'Residential', location: 'Islington, London', status: 'Published', date: 'May 5, 2024', img: heroImage },
  { title: 'Bathroom Renovation', category: 'Residential', location: 'Wembley, London', status: 'Published', date: 'Apr 28, 2024', img: heroImage },
  { title: 'New Build House', category: 'Residential', location: 'Barnet, London', status: 'Draft', date: 'Apr 20, 2024', img: heroImage },
  { title: 'Office Building', category: 'Commercial', location: 'City of London', status: 'Published', date: 'Apr 15, 2024', img: heroImage }
];

const enquirySeed = [
  ['John Smith', 'john@example.com', 'Bathroom Renovation', '2h ago'],
  ['Sarah Johnson', 'sarah@example.com', 'House Extension', '5h ago'],
  ['Michael Brown', 'michael@example.com', 'New Build Project', '1d ago'],
  ['Emily Davis', 'emily@example.com', 'Kitchen Fitting', '2d ago'],
  ['David Wilson', 'david@example.com', 'Loft Conversion', '3d ago']
];

function Logo() {
  return <div className="brand"><span>{logoMark}</span><div><b>DOMA</b><small>BUILD</small></div></div>;
}

function Login({ onLogin }) {
  return (
    <main className="login-shell">
      <section className="login-engineer-panel">
        <Logo />
        <div className="blueprint-card">
          <p className="eyebrow">Civil Engineering Control Room</p>
          <h1>Manage projects, content, enquiries and media from one secure CMS.</h1>
          <div className="engineer-visual">
            <div className="helmet" />
            <div className="drawing drawing-one" />
            <div className="drawing drawing-two" />
            <div className="grid-lines" />
          </div>
          <ul>
            <li>Supabase powered content control</li>
            <li>Live website preview-ready sections</li>
            <li>Professional construction dashboard UI</li>
          </ul>
        </div>
      </section>

      <section className="login-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,10,12,.95), rgba(8,10,12,.35)), url(${heroImage})` }}>
        <div className="login-card glass">
          <Logo />
          <h2>Welcome Back!</h2>
          <p>Sign in to your DOMA Build admin dashboard.</p>
          <label>Email Address</label>
          <input defaultValue="admin@domabuild.co.uk" placeholder="Enter your email" />
          <label>Password</label>
          <div className="password-box"><input type="password" defaultValue="domaadmin" /><Eye size={16} /></div>
          <div className="login-meta"><span><input type="checkbox" /> Remember me</span><a>Forgot Password?</a></div>
          <button className="gold-btn full" onClick={onLogin}>Sign In</button>
          <small>Building Quality Homes & Stronger Communities</small>
        </div>
      </section>
    </main>
  );
}

function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <Logo />
      <nav>
        {navItems.map(([key, label, Icon]) => (
          <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}>
            <Icon size={17} /> {label} {key === 'enquiries' && <em>24</em>}
          </button>
        ))}
      </nav>
      <div className="admin-profile"><div className="avatar">A</div><div><b>Admin User</b><small>Super Admin</small></div><ChevronDown size={15}/></div>
    </aside>
  );
}

function Topbar() {
  return <header className="topbar"><Menu/><div className="top-actions"><Search/><Bell/><div className="avatar small">A</div></div></header>;
}

function Stat({ icon: Icon, label, value, note }) {
  return <div className="stat-card"><Icon/><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>;
}

function Dashboard({ setActive }) {
  return <div className="page fade-in">
    <div className="page-title"><div><h1>Dashboard</h1><p>Welcome back, Admin! Here’s what’s happening with your website.</p></div><a className="gold-btn" href={import.meta.env.VITE_DOMA_SITE_URL || 'https://domabuild.co.uk'} target="_blank">Visit Website</a></div>
    <div className="stats-grid">
      <Stat icon={Mail} label="Total Enquiries" value="128" note="↑ 12% from last month" />
      <Stat icon={BriefcaseBusiness} label="Total Projects" value="24" note="↑ 8% from last month" />
      <Stat icon={Wrench} label="Total Services" value="16" note="No change" />
      <Stat icon={Users} label="Testimonials" value="18" note="↑ 14% from last month" />
    </div>
    <div className="two-col">
      <section className="panel"><div className="panel-head"><h3>Recent Enquiries</h3><a>View All →</a></div><table><tbody>{enquirySeed.map((e)=> <tr key={e[1]}>{e.map((x)=><td key={x}>{x}</td>)}</tr>)}</tbody></table></section>
      <section className="panel"><div className="panel-head"><h3>Recent Projects</h3><a>View All →</a></div>{projectsSeed.slice(0,4).map(p=><div className="project-mini" key={p.title}><img src={p.img}/><div><b>{p.title}</b><small>{p.location}</small></div><span>2d ago</span></div>)}</section>
    </div>
    <div className="quick-actions"><button className="gold-btn" onClick={()=>setActive('projects')}><Plus/> Add New Project</button><button onClick={()=>setActive('content')}><Pencil/> Edit Homepage</button><button onClick={()=>setActive('media')}><Upload/> Upload Media</button><button onClick={()=>setActive('enquiries')}><Mail/> View Enquiries</button></div>
  </div>
}

function ContentEditor() {
  return <div className="page fade-in"><div className="page-title"><div><h1>Edit Homepage</h1><p>Website Content › Homepage</p></div><div><button className="ghost-btn">Preview</button><button className="gold-btn">Save Changes</button></div></div>
    <div className="tabs"><b>Hero Section</b><span>About Section</span><span>Services Section</span><span>Why Choose Us</span><span>Testimonials</span><span>Call To Action</span><span>SEO</span></div>
    <div className="editor-grid"><section className="panel form-panel"><h3>Hero Content</h3><label>Subtitle</label><input defaultValue="Building Quality Homes"/><label>Title</label><input defaultValue="& Stronger Communities"/><label>Description</label><textarea defaultValue="DOMA Build delivers reliable construction and refurbishment services across London with a commitment to quality, transparency and excellence."/><label>Buttons</label><div className="split"><input defaultValue="Our Services"/><input defaultValue="/services"/></div><div className="split"><input defaultValue="View Our Projects"/><input defaultValue="/projects"/></div><label>Background Image</label><div className="thumb-row"><img src={heroImage}/><button><Camera/> Change Image</button></div></section>
      <section className="panel preview-panel"><h3>Live Preview</h3><div className="site-preview" style={{backgroundImage:`linear-gradient(90deg, rgba(8,10,12,.7), rgba(8,10,12,.2)), url(${heroImage})`}}><Logo/><nav>Home About Services Projects Contact <button>Get In Touch</button></nav><div><h2>Building Quality Homes<br/><span>& Stronger Communities</span></h2><p>DOMA Build delivers reliable construction and refurbishment services across London with a commitment to quality, transparency and excellence.</p><button>Our Services</button><button className="outline">View Our Projects</button></div></div></section></div>
  </div>
}

function Projects() {
  return <div className="page fade-in"><div className="page-title"><div><h1>Projects</h1><p>Manage your construction projects and portfolio.</p></div><button className="gold-btn"><Plus/> Add New Project</button></div><section className="panel"><div className="filters"><input placeholder="Search projects..."/><select><option>All Categories</option></select><select><option>All Statuses</option></select><button>Filter</button></div><table className="project-table"><thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Location</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{projectsSeed.map(p=><tr key={p.title}><td><img src={p.img}/></td><td>{p.title}</td><td>{p.category}</td><td>{p.location}</td><td><span className={p.status==='Draft'?'draft':'published'}>{p.status}</span></td><td>{p.date}</td><td><button><Eye size={14}/></button><button><Pencil size={14}/></button><button className="danger"><Trash2 size={14}/></button></td></tr>)}</tbody></table></section></div>
}

function Media() {
  return <div className="page fade-in"><div className="page-title"><div><h1>Media Library</h1><p>Manage all website images and files.</p></div><button className="gold-btn"><Upload/> Upload Files</button></div><div className="media-layout"><section className="panel folders"><h3>Folders</h3>{['All Files','Projects','Services','Sectors','Team','News','Documents','Trash'].map((x,i)=><button className={i===0?'active':''} key={x}><FolderOpen size={15}/>{x}<em>{i?Math.floor(Math.random()*70)+4:245}</em></button>)}</section><section className="panel media-grid"><input placeholder="Search files..."/><div className="asset-grid">{projectsSeed.map((p,i)=><div className="asset" key={p.title}><img src={p.img}/><b>{p.title.toLowerCase().replaceAll(' ','-')}.jpg</b><small>{(1.6+i/4).toFixed(1)} MB • Apr {20-i}, 2024</small></div>)}<div className="asset pdf"><FileText size={58}/><b>company-brochure.pdf</b><small>3.4 MB</small></div></div></section></div></div>
}

function Placeholder({ title }) { return <div className="page fade-in"><div className="page-title"><div><h1>{title}</h1><p>This module is ready for Supabase table connection and live website editing.</p></div><button className="gold-btn">Save Changes</button></div><section className="panel empty-state"><ShieldCheck size={42}/><h3>{title} CMS Module</h3><p>Connect this screen to the matching Supabase table and existing backend route.</p></section></div> }

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('doma-admin-auth') === 'yes');
  const [active, setActive] = useState('dashboard');
  useEffect(() => { if (isSupabaseConfigured) console.info('Supabase configured', supabase); }, []);
  const title = useMemo(() => navItems.find(n=>n[0]===active)?.[1] || 'Dashboard', [active]);
  if (!loggedIn) return <Login onLogin={() => { localStorage.setItem('doma-admin-auth','yes'); setLoggedIn(true); }} />;
  return <div className="app-shell"><Sidebar active={active} setActive={setActive}/><main className="main"><Topbar/>{active==='dashboard' && <Dashboard setActive={setActive}/>} {active==='content' && <ContentEditor/>} {active==='projects' && <Projects/>} {active==='media' && <Media/>} {!['dashboard','content','projects','media'].includes(active) && <Placeholder title={title}/>}</main></div>;
}

createRoot(document.getElementById('root')).render(<App />);
