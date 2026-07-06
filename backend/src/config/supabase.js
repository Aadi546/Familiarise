import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env.js';
import { HttpError } from '../utils/httpError.js';

const client = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!client) {
        throw new HttpError(
          503,
          'Supabase is not configured. Create backend/.env from backend/.env.example and set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
        );
      }

      const value = client[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    }
  }
);
