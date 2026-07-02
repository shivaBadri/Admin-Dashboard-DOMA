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
import { websiteSections } from './data/websiteDefaults.js';
import heroImage from './assets/construction-sunset.png';
import './styles.css';

const logoMark = '⬢';
const defaultHero = websiteSections.find((section) => section.section_key === 'hero')?.fields || {};

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

function Dashboard({ setActive, counts, supabaseStatus, supabaseMessage, projects, recentEnquiries }) {
  const enquiryRows = recentEnquiries.length ? recentEnquiries.map((enquiry) => [
    enquiry.name,
    enquiry.email,
    enquiry.service || 'General',
    enquiry.created_at ? new Date(enquiry.created_at).toLocaleDateString('en-GB') : 'Today'
  ]) : enquirySeed;
  const projectCards = projects.length ? projects.slice(0, 4) : projectsSeed;

  return <div className="page fade-in">
    <div className="page-title"><div><h1>Dashboard</h1><p>Welcome back, Admin! Here’s what’s happening with your website.</p></div><a className="gold-btn" href={import.meta.env.VITE_DOMA_SITE_URL || 'https://domabuild.co.uk'} target="_blank">Visit Website</a></div>
    <div className={`status-banner ${supabaseStatus}`}>{supabaseMessage}</div>
    <div className="stats-grid">
      <Stat icon={Mail} label="Total Enquiries" value={counts.enquiries} note="Production enquiries received" />
      <Stat icon={BriefcaseBusiness} label="Total Projects" value={counts.projects} note="Active portfolio items" />
      <Stat icon={Wrench} label="Total Services" value={counts.services} note="Services live on site" />
      <Stat icon={Users} label="Testimonials" value={counts.testimonials} note="Published client stories" />
    </div>
    <div className="two-col">
      <section className="panel"><div className="panel-head"><h3>Recent Enquiries</h3><a>View All →</a></div><table><tbody>{enquiryRows.map((e)=> <tr key={e[1] + e[0]}>{e.map((x)=><td key={x}>{x}</td>)}</tr>)}</tbody></table></section>
      <section className="panel"><div className="panel-head"><h3>Recent Projects</h3><a>View All →</a></div>{projectCards.map(p=><div className="project-mini" key={p.id || p.title}><img src={p.img}/><div><b>{p.title}</b><small>{p.location}</small></div><span>{p.date || 'Recent'}</span></div>)}</section>
    </div>
    <div className="quick-actions"><button className="gold-btn" onClick={()=>setActive('projects')}><Plus/> Add New Project</button><button onClick={()=>setActive('content')}><Pencil/> Edit Homepage</button><button onClick={()=>setActive('media')}><Upload/> Upload Media</button><button onClick={()=>setActive('enquiries')}><Mail/> View Enquiries</button></div>
  </div>
}

function ContentEditor({ heroSection }) {
  const previewSection = heroSection || defaultHero;
  return <div className="page fade-in"><div className="page-title"><div><h1>Edit Homepage</h1><p>Website Content › Homepage</p></div><div><button className="ghost-btn">Preview</button><button className="gold-btn">Save Changes</button></div></div>
    <div className="tabs"><b>Hero Section</b><span>About Section</span><span>Services Section</span><span>Why Choose Us</span><span>Testimonials</span><span>Call To Action</span><span>SEO</span></div>
    <div className="editor-grid"><section className="panel form-panel"><h3>Hero Content</h3><label>Badge</label><input defaultValue={previewSection.badge || 'DOMA Build Contractors Ltd'} /><label>Headline</label><input defaultValue={previewSection.headline || 'CONSTRUCTION BUILT ON TRUST'} /><label>Description</label><textarea defaultValue={previewSection.subtitle || 'We deliver high-quality construction and refurbishment services across London with a commitment to quality, transparency and excellence.'} /><label>Buttons</label><div className="split"><input defaultValue={previewSection.primaryButtonText || 'Our Services'} /><input defaultValue={previewSection.primaryButtonLink || '/services'} /></div><div className="split"><input defaultValue={previewSection.secondaryButtonText || 'View Our Projects'} /><input defaultValue={previewSection.secondaryButtonLink || '/projects'} /></div><label>Background Image</label><div className="thumb-row"><img src={previewSection.backgroundImage || heroImage} /><button><Camera/> Change Image</button></div></section>
      <section className="panel preview-panel"><h3>Live Preview</h3><div className="site-preview" style={{backgroundImage:`linear-gradient(90deg, rgba(8,10,12,.7), rgba(8,10,12,.2)), url(${previewSection.backgroundImage || heroImage})`}}><Logo/><nav>Home About Services Projects Contact <button>Get In Touch</button></nav><div><h2>{previewSection.headline || 'Building Quality Homes'}<br/><span>{previewSection.subtitle || '& Stronger Communities'}</span></h2><p>{previewSection.subtitle || 'DOMA Build delivers reliable construction and refurbishment services across London with a commitment to quality, transparency and excellence.'}</p><button>{previewSection.primaryButtonText || 'Our Services'}</button><button className="outline">{previewSection.secondaryButtonText || 'View Our Projects'}</button></div></div></section></div>
  </div>
}

function Projects({ projects }) {
  return <div className="page fade-in"><div className="page-title"><div><h1>Projects</h1><p>Manage your construction projects and portfolio.</p></div><button className="gold-btn"><Plus/> Add New Project</button></div><section className="panel"><div className="filters"><input placeholder="Search projects..."/><select><option>All Categories</option></select><select><option>All Statuses</option></select><button>Filter</button></div><table className="project-table"><thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Location</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{projects.map((p)=><tr key={p.id || p.title}><td><img src={p.img || heroImage}/></td><td>{p.title}</td><td>{p.category || 'General'}</td><td>{p.location || 'UK'}</td><td><span className={p.status==='Draft'?'draft':'published'}>{p.status || 'Published'}</span></td><td>{p.date}</td><td><button><Eye size={14}/></button><button><Pencil size={14}/></button><button className="danger"><Trash2 size={14}/></button></td></tr>)}</tbody></table></section></div>
}

function Media({ mediaAssets }) {
  const assets = mediaAssets.length ? mediaAssets : projectsSeed.map((p,i) => ({
    id: p.title,
    file_url: p.img,
    title: `${p.title.toLowerCase().replaceAll(' ','-')}.jpg`,
    file_type: 'image',
    size_bytes: 1600000 + i * 200000
  }));
  return <div className="page fade-in"><div className="page-title"><div><h1>Media Library</h1><p>Manage all website images and files.</p></div><button className="gold-btn"><Upload/> Upload Files</button></div><div className="media-layout"><section className="panel folders"><h3>Folders</h3>{['All Files','Projects','Services','Sectors','Team','News','Documents','Trash'].map((x,i)=><button className={i===0?'active':''} key={x}><FolderOpen size={15}/>{x}<em>{i?Math.floor(Math.random()*70)+4:245}</em></button>)}</section><section className="panel media-grid"><input placeholder="Search files..."/><div className="asset-grid">{assets.map((asset, i)=><div className="asset" key={asset.id || i}>{asset.file_type?.includes('pdf') ? <div className="pdf"><FileText size={58}/></div> : <img src={asset.file_url || heroImage} alt={asset.title} /> }<b>{asset.title}</b><small>{asset.file_type?.includes('pdf') ? `${(asset.size_bytes/1000000).toFixed(1)} MB` : `${Math.max(1.2, (asset.size_bytes || 1600000)/1000000).toFixed(1)} MB`} • {new Date().toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</small></div>)}<div className="asset pdf"><FileText size={58}/><b>company-brochure.pdf</b><small>3.4 MB</small></div></div></section></div></div>
}

function Placeholder({ title }) { return <div className="page fade-in"><div className="page-title"><div><h1>{title}</h1><p>This module is ready for Supabase table connection and live website editing.</p></div><button className="gold-btn">Save Changes</button></div><section className="panel empty-state"><ShieldCheck size={42}/><h3>{title} CMS Module</h3><p>Connect this screen to the matching Supabase table and existing backend route.</p></section></div> }

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('doma-admin-auth') === 'yes');
  const [active, setActive] = useState('dashboard');
  const [heroSection, setHeroSection] = useState(defaultHero);
  const [projects, setProjects] = useState(projectsSeed);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [dashboardCounts, setDashboardCounts] = useState({
    enquiries: enquirySeed.length,
    projects: projectsSeed.length,
    services: 16,
    testimonials: 18
  });
  const [supabaseStatus, setSupabaseStatus] = useState(isSupabaseConfigured ? 'loading' : 'disabled');
  const [supabaseMessage, setSupabaseMessage] = useState(
    isSupabaseConfigured
      ? 'Connecting to Supabase for live website content...'
      : 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;

    async function loadLiveContent() {
      try {
        const [heroRes, projectsRes, mediaRes, enquiriesRes, projectsCountRes, servicesCountRes, testimonialsCountRes] = await Promise.all([
          supabase.from('site_sections').select('fields').eq('section_key', 'hero').single(),
          supabase.from('projects').select('*,created_at').eq('is_active', true).is('deleted_at', null).order('created_at', { ascending: false }).limit(12),
          supabase.from('media_assets').select('*').eq('is_active', true).is('deleted_at', null).order('created_at', { ascending: false }).limit(12),
          supabase.from('enquiries').select('id,name,email,service,created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(5),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null),
          supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null),
          supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('is_active', true).is('deleted_at', null)
        ]);

        if (!mounted) return;
        if (!heroRes.error && heroRes.data?.fields) setHeroSection(heroRes.data.fields);
        if (!projectsRes.error && projectsRes.data) {
          setProjects(projectsRes.data.map((project) => ({
            ...project,
            img: project.image_url || heroImage,
            location: project.location || 'UK',
            status: project.status || 'Published',
            date: project.date || (project.created_at ? new Date(project.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD')
          })));
        }
        if (!mediaRes.error && mediaRes.data) {
          setMediaAssets(mediaRes.data.map((asset) => ({
            ...asset,
            title: asset.title || asset.file_url,
            file_url: asset.file_url || heroImage,
            file_type: asset.file_type || 'image'
          })));
        }

        if (!enquiriesRes.error && enquiriesRes.data) {
          setRecentEnquiries(enquiriesRes.data);
        }

        setDashboardCounts((current) => ({
          ...current,
          projects: projectsCountRes.count ?? current.projects,
          services: servicesCountRes.count ?? current.services,
          testimonials: testimonialsCountRes.count ?? current.testimonials
        }));
        setSupabaseStatus('connected');
        setSupabaseMessage('Live Supabase website content is connected.');
      } catch (error) {
        console.error('Supabase load failed', error);
        if (!mounted) return;
        setSupabaseStatus('error');
        setSupabaseMessage('Unable to load live website content from Supabase.');
      }
    }

    loadLiveContent();
    return () => { mounted = false; };
  }, []);

  const title = useMemo(() => navItems.find((n) => n[0] === active)?.[1] || 'Dashboard', [active]);
  if (!loggedIn) return <Login onLogin={() => { localStorage.setItem('doma-admin-auth', 'yes'); setLoggedIn(true); }} />;
  return <div className="app-shell"><Sidebar active={active} setActive={setActive}/><main className="main"><Topbar/>{active==='dashboard' && <Dashboard setActive={setActive} counts={dashboardCounts} supabaseStatus={supabaseStatus} supabaseMessage={supabaseMessage} projects={projects} recentEnquiries={recentEnquiries}/>} {active==='content' && <ContentEditor heroSection={heroSection}/>} {active==='projects' && <Projects projects={projects}/>} {active==='media' && <Media mediaAssets={mediaAssets}/>} {!['dashboard','content','projects','media'].includes(active) && <Placeholder title={title}/>}</main></div>;
}

createRoot(document.getElementById('root')).render(<App />);
