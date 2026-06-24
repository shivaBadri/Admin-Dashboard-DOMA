import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArchiveRestore,
  BarChart3,
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Gauge,
  Globe2,
  HardHat,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Undo2,
  Upload,
  Users,
  Zap,
  XCircle,
} from 'lucide-react';
import { websiteSections, initialRows } from './data/websiteDefaults.js';
import { supabase, isSupabaseConfigured, siteUrl } from './lib/supabase.js';

const nav = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['website', 'Website Fields', Edit3],
  ['services', 'Services', Building2],
  ['projects', 'Projects', Image],
  ['sectors', 'Sectors', Globe2],
  ['news', 'News & Insights', FileText],
  ['team', 'Team', Users],
  ['testimonials', 'Testimonials', Star],
  ['media_assets', 'Media Library', Camera],
  ['enquiries', 'Enquiries', MessageSquare],
  ['trash', 'Restore Center', ArchiveRestore],
  ['seo', 'SEO & Speed', Gauge],
  ['settings', 'Settings', Settings],
];

const tables = ['site_sections', 'services', 'projects', 'sectors', 'news', 'team', 'testimonials', 'media_assets', 'enquiries'];
const appStorage = { auth: 'doma_admin_session', settings: 'doma_admin_settings' };

function safe(v) {
  return v === null || v === undefined ? '' : String(v);
}

function featureLabel(raw) {
  return safe(raw).replace(/_/g, ' ');
}

function stamp(row = {}) {
  const now = new Date().toISOString();
  return {
    ...row,
    created_at: row.created_at || now,
    updated_at: now,
    deleted_at: row.deleted_at ?? null,
  };
}

function key(table) {
  return `doma_admin_${table}`;
}

function readLocal(table, fallback = []) {
  try {
    const raw = localStorage.getItem(key(table));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(table, value) {
  localStorage.setItem(key(table), JSON.stringify(value));
}

function getRowLabel(row) {
  return row.title || row.name || row.client_name || row.section_key || row.email || row.slug || 'Untitled';
}

async function listRows(table, { includeDeleted = false } = {}) {
  if (!supabase) {
    const fallback = table === 'site_sections' ? websiteSections : initialRows[table] || [];
    const rows = readLocal(table, fallback).map(stamp);
    return includeDeleted ? rows : rows.filter((row) => !row.deleted_at);
  }

  let query = supabase.from(table).select('*').order('updated_at', { ascending: false });
  if (!includeDeleted) query = query.is('deleted_at', null);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function upsertRow(table, row) {
  const item = stamp({ ...row, id: row.id || crypto.randomUUID(), deleted_at: row.deleted_at ?? null });

  if (!supabase) {
    const fallback = table === 'site_sections' ? websiteSections : initialRows[table] || [];
    const current = readLocal(table, fallback);
    const exists = current.some((entry) => entry.id && entry.id === item.id) || (item.section_key && current.some((entry) => entry.section_key === item.section_key));
    const next = exists
      ? current.map((entry) => ((entry.id && entry.id === item.id) || (entry.section_key && entry.section_key === item.section_key) ? item : entry))
      : [item, ...current];
    writeLocal(table, next);
    return item;
  }

  const { data, error } = await supabase.from(table).upsert(item).select().single();
  if (error) throw error;
  await logAction('UPSERT', table, data?.id);
  return data;
}

async function softDelete(table, row) {
  const item = stamp({ ...row, deleted_at: new Date().toISOString() });
  return upsertRow(table, item);
}

async function restoreRow(table, row) {
  const item = stamp({ ...row, deleted_at: null });
  return upsertRow(table, item);
}

async function hardDelete(table, row) {
  if (!supabase) {
    const fallback = table === 'site_sections' ? websiteSections : initialRows[table] || [];
    const current = readLocal(table, fallback).filter((entry) => entry.id !== row.id && !(entry.section_key && entry.section_key === row.section_key));
    writeLocal(table, current);
    return true;
  }

  const { error } = await supabase.from(table).delete().eq('id', row.id);
  if (error) throw error;
  return true;
}

async function logAction(action, table, recordId) {
  try {
    if (!supabase) return;
    await supabase.from('audit_logs').insert({ action, table_name: table, record_id: recordId });
  } catch {
    // ignore audit failures
  }
}

async function optimizeImageFile(file, { maxWidth = 1600, maxHeight = 1200, quality = 0.82 } = {}) {
  if (!file?.type?.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  const targetWidth = Math.round(width * ratio);
  const targetHeight = Math.round(height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob) throw new Error('The image could not be processed.');

  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  return new File([blob], `${baseName || 'doma-image'}.webp`, { type: 'image/webp' });
}

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, variant = 'success') => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), 3200);
  };

  const signIn = async (email, password) => {
    try {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSession(data.session);
        localStorage.setItem(appStorage.auth, JSON.stringify({ email, userId: data.session?.user?.id || null }));
        showToast('Signed in successfully.', 'success');
        return true;
      }

      if (!email || !password) throw new Error('Please enter your email and password.');
      const fallbackSession = { user: { email }, access_token: 'local-session' };
      setSession(fallbackSession);
      localStorage.setItem(appStorage.auth, JSON.stringify({ email, userId: 'local-user' }));
      showToast('Signed in locally. Supabase is not configured.', 'success');
      return true;
    } catch (error) {
      showToast(error.message || 'Unable to sign in.', 'error');
      return false;
    }
  };

  const signOut = async () => {
    try {
      if (supabase && isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setSession(null);
      localStorage.removeItem(appStorage.auth);
      showToast('Signed out successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to sign out.', 'error');
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const stored = localStorage.getItem(appStorage.auth);
        if (stored && !supabase) {
          setSession({ user: { email: JSON.parse(stored).email } });
        } else if (supabase && isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
          const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
          return () => authListener.subscription.unsubscribe();
        }
      } catch {
        setSession(null);
      } finally {
        setAuthLoading(false);
      }
    };

    boot();
  }, []);

  if (authLoading) return <Splash />;
  if (!session) return <LoginPage onSignIn={signIn} />;
  return <Shell session={session} onSignOut={signOut} toast={toast} setToast={setToast} />;
}

function Splash() {
  return (
    <div className="splash-screen">
      <div className="splash-card">
        <Sparkles size={28} />
        <h1>DOMA Admin</h1>
        <p>Preparing the control centre�</p>
      </div>
    </div>
  );
}

function LoginPage({ onSignIn }) {
  const [email, setEmail] = useState('admin@domabuild.co.uk');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const success = await onSignIn(email, password);
    if (!success) setError('Invalid credentials or missing Supabase configuration.');
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo-mark"><Building2 size={28} /></div>
        <h1>DOMA Secure Admin</h1>
        <p>Sign in to manage the DOMA website and content library.</p>
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@domabuild.co.uk" required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="��������" required />
        </label>
        {error ? <div className="alert error">{error}</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Signing in�' : 'Secure Login'}</button>
      </form>
    </div>
  );
}

function Shell({ session, onSignOut, toast }) {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-icon"><Building2 size={24} /></div>
          <div>
            <b>DOMA</b>
            <span>Website Admin</span>
          </div>
        </div>
        <nav className="nav-list">
          {nav.map(([id, label, Icon]) => (
            <button key={id} type="button" className={page === id ? 'nav-link active' : 'nav-link'} onClick={() => setPage(id)}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <a className="external-link" href={siteUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={17} />
          Open DOMA Website
        </a>
        <button type="button" className="logout-button" onClick={onSignOut}>
          <LogOut size={17} />
          Logout
        </button>
        <div className="sidebar-meta">
          <span>{session?.user?.email || 'Signed in'}</span>
          <strong>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Session'}</strong>
        </div>
      </aside>
      <main className="main-panel">
        <Topbar page={page} />
        <Router page={page} setPage={setPage} />
        {toast ? <div className={`toast ${toast.variant}`}>{toast.message}</div> : null}
      </main>
    </div>
  );
}

function Topbar({ page }) {
  return (
    <header className="topbar">
      <div>
        <p>DOMA Build Contractors Ltd</p>
        <h1>{nav.find(([id]) => id === page)?.[1] || 'Dashboard'}</h1>
      </div>
      <div className="top-actions">
        <button type="button" className="pill-button" onClick={() => window.location.reload()}>
          <RefreshCw size={15} /> Refresh
        </button>
        <a className="pill-button" href={siteUrl} target="_blank" rel="noreferrer">
          <Globe2 size={15} /> Live Preview
        </a>
      </div>
    </header>
  );
}

function Router({ page, setPage }) {
  if (page === 'dashboard') return <Dashboard setPage={setPage} />;
  if (page === 'website') return <WebsiteFields />;
  if (page === 'services') return <Crud title="Services" table="services" fields={['title', 'description', 'icon', 'sort_order', 'is_active']} />;
  if (page === 'projects') return <Crud title="Projects" table="projects" fields={['title', 'category', 'location', 'status', 'description', 'image_url', 'is_featured', 'is_active']} />;
  if (page === 'sectors') return <Crud title="Sectors" table="sectors" fields={['title', 'description', 'sort_order', 'is_active']} />;
  if (page === 'news') return <Crud title="News & Insights" table="news" fields={['title', 'slug', 'excerpt', 'content', 'image_url', 'is_active']} />;
  if (page === 'team') return <Crud title="Team" table="team" fields={['name', 'role', 'bio', 'photo_url', 'is_active']} />;
  if (page === 'testimonials') return <Crud title="Testimonials" table="testimonials" fields={['client_name', 'client_role', 'quote', 'rating', 'is_active']} />;
  if (page === 'media_assets') return <MediaManager />;
  if (page === 'enquiries') return <Crud title="Enquiries" table="enquiries" fields={['name', 'email', 'phone', 'service', 'message', 'status', 'follow_up_date', 'notes']} />;
  if (page === 'trash') return <TrashCenter />;
  if (page === 'seo') return <SeoSpeed />;
  return <SettingsPage />;
}

function Dashboard({ setPage }) {
  const [stats, setStats] = useState({ projects: 0, services: 0, enquiries: 0, sections: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [projects, services, enquiries, sections] = await Promise.all([
          listRows('projects'),
          listRows('services'),
          listRows('enquiries'),
          listRows('site_sections'),
        ]);
        setStats({ projects: projects.length, services: services.length, enquiries: enquiries.length, sections: sections.length });
      } catch {
        setStats({ projects: 0, services: 0, enquiries: 0, sections: 0 });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="dashboard-grid">
      <section className="hero-panel">
        <div>
          <span className="eyebrow"><Zap size={16} /> Live website control</span>
          <h2>Run the DOMA website from a single professional admin workspace.</h2>
          <p>Update sections, services, projects, enquiries, media and SEO with confidence.</p>
          <div className="actions-row">
            <button type="button" onClick={() => setPage('website')}>
              Edit Website Fields <ChevronRight size={18} />
            </button>
            <button type="button" className="ghost-button" onClick={() => setPage('seo')}>
              SEO & Speed
            </button>
          </div>
        </div>
        <div className="preview-card">
          <div className="browser-bar">
            <span /><span /><span />
            <b>domabuild.co.uk</b>
          </div>
          <div className="preview-body">
            <h3>Construction built on trust</h3>
            <p>Professional updates from the DOMA admin panel.</p>
          </div>
        </div>
      </section>

      <section className="cards-grid">
        <StatCard icon={Image} label="Projects" value={loading ? '�' : stats.projects} />
        <StatCard icon={Building2} label="Services" value={loading ? '�' : stats.services} />
        <StatCard icon={MessageSquare} label="Enquiries" value={loading ? '�' : stats.enquiries} />
        <StatCard icon={FileText} label="Sections" value={loading ? '�' : stats.sections} />
      </section>

      <section className="two-column-grid">
        <Panel title="Operations Snapshot">
          <div className="stack-list">
            <div className="stack-item"><CheckCircle2 size={18} /> Add or update content in seconds.</div>
            <div className="stack-item"><CheckCircle2 size={18} /> Restore deleted records instantly.</div>
            <div className="stack-item"><CheckCircle2 size={18} /> Upload media with automatic optimisation.</div>
          </div>
        </Panel>
        <Panel title="Performance & Security">
          <ul className="bullet-list">
            <li>Content is stored in Supabase when configured.</li>
            <li>Local fallback keeps the admin usable during development.</li>
            <li>All changes are tracked and recoverable from Restore Center.</li>
          </ul>
        </Panel>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WebsiteFields() {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const rows = await listRows('site_sections');
      const nextRows = rows.length ? rows : websiteSections.map((section, index) => ({ ...section, sort_order: index + 1, id: crypto.randomUUID() }));
      setSections(nextRows);
      setSelected(nextRows[0] || null);
      setMessage('');
    } catch (error) {
      setMessage(error.message || 'Unable to load website sections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await upsertRow('site_sections', selected);
      setMessage('Website fields saved successfully.');
      await load();
    } catch (error) {
      setMessage(error.message || 'Unable to save website fields.');
    }
  };

  const updateField = (key, value) => {
    setSelected((current) => ({ ...current, fields: { ...(current?.fields || {}), [key]: value } }));
  };

  if (loading) return <Panel title="Website Fields"><div className="skeleton">Loading website sections�</div></Panel>;
  if (!selected) return <Panel title="Website Fields"><div className="empty-state">No section data available yet.</div></Panel>;

  return (
    <div className="builder-grid">
      <div className="side-panel">
        <h3>Website Sections</h3>
        {sections.map((section) => (
          <button key={section.section_key} type="button" className={selected.section_key === section.section_key ? 'nav-link active' : 'nav-link'} onClick={() => setSelected(section)}>
            {section.title}
          </button>
        ))}
      </div>
      <div className="editor-panel">
        <div className="editor-head">
          <div>
            <h2>{selected.title}</h2>
            <p>Update the fields that map directly to the live website.</p>
          </div>
          <button type="button" onClick={save}><Save size={16} /> Save Section</button>
        </div>
        <div className="form-grid">
          {Object.entries(selected.fields || {}).map(([key, value]) => (
            <label key={key}>
              <span>{featureLabel(key)}</span>
              {safe(value).length > 70 ? (
                <textarea value={safe(value)} onChange={(event) => updateField(key, event.target.value)} />
              ) : (
                <input value={safe(value)} onChange={(event) => updateField(key, event.target.value)} />
              )}
            </label>
          ))}
        </div>
        {message ? <div className={`alert ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div> : null}
      </div>
    </div>
  );
}

function Crud({ title, table, fields }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const createBlankForm = () => fields.reduce((acc, field) => ({ ...acc, [field]: field.startsWith('is_') ? true : '' }), {});

  const loadRows = async () => {
    try {
      setLoading(true);
      setError('');
      let data = await listRows(table);
      if (!data.length && initialRows[table]?.length) {
        data = initialRows[table].map((item) => ({ ...item, id: crypto.randomUUID() }));
        for (const item of data) await upsertRow(table, item);
      }
      setRows(data);
    } catch (err) {
      setError(err.message || 'Unable to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [table]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditing(null);
    setForm(createBlankForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await upsertRow(table, { ...form, id: editing });
      resetForm();
      await loadRows();
    } catch (err) {
      setError(err.message || 'Unable to save record.');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Move this record to Restore Center?')) return;
    try {
      await softDelete(table, row);
      await loadRows();
    } catch (err) {
      setError(err.message || 'Unable to delete record.');
    }
  };

  useEffect(() => {
    setForm(createBlankForm());
  }, [table]);

  return (
    <Panel title={title}>
      <div className="module-note"><CheckCircle2 size={17} /> Content updates are managed directly here and moved to Restore Center when deleted.</div>
      <form className="form-grid compact" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <label key={field}>
            <span>{featureLabel(field)}</span>
            {field.includes('description') || field === 'content' || field === 'message' || field === 'notes' || field === 'quote' ? (
              <textarea value={safe(form[field])} onChange={(event) => updateField(field, event.target.value)} />
            ) : field.startsWith('is_') ? (
              <select value={String(form[field] ?? true)} onChange={(event) => updateField(field, event.target.value === 'true')}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : (
              <input value={safe(form[field])} onChange={(event) => updateField(field, event.target.value)} />
            )}
          </label>
        ))}
        <div className="form-actions">
          <button type="submit"><Save size={16} /> {editing ? 'Update' : 'Add'} {title}</button>
          {editing ? <button type="button" className="ghost-button" onClick={resetForm}>Cancel</button> : null}
        </div>
      </form>
      {error ? <div className="alert error">{error}</div> : null}
      {loading ? <div className="skeleton">Loading {title}�</div> : <DataTable rows={rows} fields={fields} onEdit={(row) => { setEditing(row.id); setForm(row); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={handleDelete} />}
    </Panel>
  );
}

function DataTable({ rows, fields, onEdit, onDelete }) {
  if (!rows.length) return <div className="empty-state">No records yet. Add the first item above.</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {fields.slice(0, 4).map((field) => <th key={field}>{featureLabel(field)}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              {fields.slice(0, 4).map((field) => <td key={field}>{safe(row[field]).slice(0, 90)}</td>)}
              <td>
                <button type="button" onClick={() => onEdit(row)}>Edit</button>
                <button type="button" className="danger-button" onClick={() => onDelete(row)}><Trash2 size={15} /> Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrashCenter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      let all = [];
      for (const table of tables) {
        try {
          const rows = await listRows(table, { includeDeleted: true });
          all = all.concat(rows.filter((row) => row.deleted_at).map((row) => ({ ...row, _table: table })));
        } catch {
          // ignore failed table reads
        }
      }
      setItems(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const restore = async (item) => {
    if (!window.confirm('Restore this record to the active list?')) return;
    await restoreRow(item._table, item);
    await load();
  };

  const permanentDelete = async (item) => {
    if (!window.confirm('Permanently delete this item? This cannot be undone.')) return;
    await hardDelete(item._table, item);
    await load();
  };

  return (
    <Panel title="Restore Center">
      <div className="module-note"><ArchiveRestore size={17} /> Deleted records can be restored or permanently removed here.</div>
      {loading ? <div className="skeleton">Checking deleted records�</div> : !items.length ? <div className="empty-state">No deleted records found.</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Module</th>
                <th>Name</th>
                <th>Deleted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item._table}-${item.id || index}`}>
                  <td>{item._table}</td>
                  <td>{getRowLabel(item)}</td>
                  <td>{new Date(item.deleted_at).toLocaleString()}</td>
                  <td>
                    <button type="button" onClick={() => restore(item)}><Undo2 size={15} /> Restore</button>
                    <button type="button" className="danger-button" onClick={() => permanentDelete(item)}><Trash2 size={15} /> Permanent Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function MediaManager() {
  const [assets, setAssets] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [dragging, setDragging] = useState(false);

  const loadAssets = async () => {
    try {
      const rows = await listRows('media_assets');
      setAssets(rows.filter((row) => !row.deleted_at));
    } catch {
      setAssets([]);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [selectedFile]);

  const validateFile = (file) => {
    if (!file) return 'Select a valid file first.';
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) return 'Only JPG, PNG, WebP and PDF files are supported.';
    if (file.size > 4 * 1024 * 1024) return 'File size must be 4 MB or less.';
    return '';
  };

  const handleFile = async (file) => {
    const validation = validateFile(file);
    if (validation) {
      setMessage(validation);
      return;
    }

    setSelectedFile(file);
    setMessage('');
  };

  const upload = async () => {
    if (!selectedFile) {
      setMessage('Choose a file before uploading.');
      return;
    }

    try {
      setUploading(true);
      setProgress(5);
      const progressTimer = window.setInterval(() => setProgress((value) => Math.min(value + 12, 94)), 180);

      let uploadFile = selectedFile;
      if (selectedFile.type.startsWith('image/')) {
        uploadFile = await optimizeImageFile(selectedFile, { quality: 0.82 });
      }

      if (!supabase || !isSupabaseConfigured) {
        const publicUrl = previewUrl || URL.createObjectURL(uploadFile);
        const item = await upsertRow('media_assets', {
          title: uploadFile.name,
          file_url: publicUrl,
          file_type: uploadFile.type,
          size_bytes: uploadFile.size,
          alt_text: uploadFile.name.replace(/\.[^.]+$/, ''),
          is_active: true,
        });
        setAssets((current) => [item, ...current]);
        setMessage('File saved locally.');
      } else {
        const safeName = uploadFile.name.replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
        const path = `doma/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from('doma-media').upload(path, uploadFile, { cacheControl: '31536000', upsert: false, contentType: uploadFile.type });
        if (error) throw error;
        const { data } = supabase.storage.from('doma-media').getPublicUrl(path);
        const item = await upsertRow('media_assets', {
          title: selectedFile.name,
          file_url: data.publicUrl,
          file_type: uploadFile.type,
          size_bytes: uploadFile.size,
          alt_text: selectedFile.name.replace(/\.[^.]+$/, ''),
          is_active: true,
        });
        setAssets((current) => [item, ...current]);
        setMessage('Upload completed successfully.');
      }

      setProgress(100);
      window.clearInterval(progressTimer);
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (err) {
      setMessage(err.message || 'Upload failed.');
    } finally {
      window.setTimeout(() => setProgress(0), 500);
      setUploading(false);
    }
  };

  return (
    <Panel title="Media Library">
      <div className="module-note"><Camera size={17} /> Upload images and PDFs with automatic optimisation and validation.</div>
      <div className={`dropzone ${dragging ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); handleFile(event.dataTransfer.files[0]); }}>
        <Upload size={18} />
        <p>Drag and drop files here or choose from your device.</p>
        <input type="file" accept="image/*,.pdf" onChange={(event) => handleFile(event.target.files?.[0])} />
      </div>
      {selectedFile ? <div className="selected-file-card"><strong>{selectedFile.name}</strong><span>{Math.round(selectedFile.size / 1024)} KB</span></div> : null}
      {previewUrl ? <img className="preview-image" src={previewUrl} alt="Preview" /> : null}
      {uploading ? <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div> : null}
      <button type="button" className="upload-button" onClick={upload} disabled={uploading || !selectedFile}><Upload size={16} /> {uploading ? 'Uploading�' : 'Upload File'}</button>
      {message ? <div className={`alert ${message.includes('success') || message.includes('saved') ? 'success' : 'error'}`}>{message}</div> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.title}</td>
                <td>{asset.file_type}</td>
                <td>{asset.is_active ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SeoSpeed() {
  return (
    <div className="two-column-grid">
      <Panel title="SEO Overview">
        <div className="stack-list">
          <div className="stack-item"><Gauge size={18} /> Metadata is editable from Website Fields.</div>
          <div className="stack-item"><Gauge size={18} /> Canonical URLs and OG data are managed centrally.</div>
          <div className="stack-item"><Gauge size={18} /> Images are delivered in optimised WebP format.</div>
        </div>
      </Panel>
      <Panel title="Performance Checklist">
        <ul className="bullet-list">
          <li>Use compressed images and lazy loading.</li>
          <li>Keep content modules lean and structured.</li>
          <li>Serve only the required section data for each page.</li>
          <li>Monitor Core Web Vitals and keep the archive clean.</li>
        </ul>
      </Panel>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState({ siteName: 'DOMA Build Contractors Ltd', siteUrl, contactEmail: 'info@domabuild.co.uk', enableNotifications: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(appStorage.settings) || '{}');
      setSettings((current) => ({ ...current, ...saved }));
    } catch {
      // ignore
    }
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      localStorage.setItem(appStorage.settings, JSON.stringify(settings));
      setMessage('Settings saved successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Website Settings">
      <div className="module-note"><Settings size={17} /> Manage the main website settings from this secure admin workspace.</div>
      <div className="form-grid compact">
        <label>
          <span>Website Name</span>
          <input value={settings.siteName} onChange={(event) => setSettings((current) => ({ ...current, siteName: event.target.value }))} />
        </label>
        <label>
          <span>Website URL</span>
          <input value={settings.siteUrl || siteUrl} readOnly />
        </label>
        <label>
          <span>Contact Email</span>
          <input value={settings.contactEmail} onChange={(event) => setSettings((current) => ({ ...current, contactEmail: event.target.value }))} />
        </label>
        <label>
          <span>Notifications</span>
          <select value={String(settings.enableNotifications)} onChange={(event) => setSettings((current) => ({ ...current, enableNotifications: event.target.value === 'true' }))}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </label>
      </div>
      <button type="button" onClick={save} disabled={saving}><Save size={16} /> {saving ? 'Saving�' : 'Save Changes'}</button>
      {message ? <div className={`alert ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div> : null}
    </Panel>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel-card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default App;