const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Database operations will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const db = {
  async getLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createLead(lead) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select();
    if (error) throw error;
    return data[0];
  },

  async updateLead(id, updates) {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async getSiteSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'main')
      .single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore not found
    return data ? data.value : null;
  },

  async updateSiteSettings(value) {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key: 'main', value, updated_at: new Date().toISOString() })
      .select();
    if (error) throw error;
    return data[0];
  }
};

module.exports = { supabase, db };
