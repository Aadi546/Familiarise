import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(currentDir, '../../.env');

dotenv.config({ path: envPath });

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}. Add it to backend/.env before running against Supabase.`);
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2Bucket: process.env.R2_BUCKET,
  r2PublicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
  turnUrls: process.env.TURN_URLS,
  turnUsername: process.env.TURN_USERNAME,
  turnCredential: process.env.TURN_CREDENTIAL,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:family-hub@example.com'
};

export const isSupabaseConfigured =
  Boolean(env.supabaseUrl) &&
  Boolean(env.supabaseServiceRoleKey) &&
  !env.supabaseUrl.includes('your-project') &&
  !env.supabaseServiceRoleKey.includes('your-service-role');

export const isR2Configured =
  Boolean(env.r2AccountId) &&
  Boolean(env.r2AccessKeyId) &&
  Boolean(env.r2SecretAccessKey) &&
  Boolean(env.r2Bucket) &&
  Boolean(env.r2PublicBaseUrl) &&
  !env.r2AccountId.includes('your-cloudflare') &&
  !env.r2AccessKeyId.includes('your-r2') &&
  !env.r2SecretAccessKey.includes('your-r2') &&
  !env.r2PublicBaseUrl.includes('your-public');

export function getSupabaseKeyInfo() {
  if (!env.supabaseServiceRoleKey) {
    return { configured: false, role: null, ref: null };
  }

  try {
    const [, payload] = env.supabaseServiceRoleKey.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    return {
      configured: true,
      role: decoded.role || null,
      ref: decoded.ref || null
    };
  } catch {
    return {
      configured: true,
      role: 'unreadable',
      ref: null
    };
  }
}
