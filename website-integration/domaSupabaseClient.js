// DOMA LIVE WEBSITE INTEGRATION CLIENT
// Copy this file into the live domabuild.co.uk frontend project, for example: src/lib/domaSupabaseClient.js
// Install: npm install @supabase/supabase-js
// Required Vercel env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const domaSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  global: {
    headers: { 'x-application-name': 'doma-live-website' }
  }
});

const cache = new Map();
const ttl = 60 * 1000;

async function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < ttl) return hit.data;
  const data = await loader();
  cache.set(key, { data, time: Date.now() });
  return data;
}

export async function getSiteSection(sectionKey) {
  return cached(`section:${sectionKey}`, async () => {
    const { data, error } = await domaSupabase
      .from('site_sections')
      .select('*')
      .eq('section_key', sectionKey)
      .is('deleted_at', null)
      .single();
    if (error) throw error;
    return data?.fields || {};
  });
}

export async function getActiveRows(tableName, limit = 50) {
  return cached(`table:${tableName}:${limit}`, async () => {
    const { data, error } = await domaSupabase
      .from(tableName)
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  });
}

export async function createEnquiry(payload) {
  const { data, error } = await domaSupabase
    .from('enquiries')
    .insert({ ...payload, status: 'New' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
