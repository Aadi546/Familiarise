import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, '../.env') });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function run() {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, pin, pin_hash')
    .not('pin', 'is', null);

  if (error) {
    throw error;
  }

  for (const user of users || []) {
    if (!user.pin || user.pin_hash) {
      continue;
    }

    const hash = await bcrypt.hash(user.pin, 12);
    const { error: updateError } = await supabase
      .from('users')
      .update({
        pin_hash: hash,
        pin: null
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`Hashed PIN for ${user.full_name}`);
  }

  console.log('PIN hashing complete.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
