import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://rylfdgniwlhrvhqgyjxm.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4Ja8aKkEIRvApOKlx86UZQ_6YNaTajm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
