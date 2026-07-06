import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, '../.env') });

const familyName = process.env.SEED_FAMILY_NAME || 'Our Family';
const members = [
  { full_name: 'AK', pin: '2005', role: 'admin' },
  { full_name: 'BK', pin: '1970', role: 'member' },
  { full_name: 'PK', pin: '1977', role: 'member' },
  { full_name: 'MK', pin: '2001', role: 'member' }
];

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
  const { data: existingFamilies, error: existingFamilyError } = await supabase
    .from('families')
    .select('id, name')
    .order('created_at', { ascending: true })
    .limit(1);

  if (existingFamilyError) {
    throw existingFamilyError;
  }

  let targetFamily = existingFamilies?.[0];

  if (!targetFamily) {
    const { data, error } = await supabase.from('families').insert({ name: familyName }).select('id, name').single();

    if (error) {
      throw error;
    }

    targetFamily = data;
  } else if (targetFamily.name !== familyName) {
    const { data, error } = await supabase
      .from('families')
      .update({ name: familyName })
      .eq('id', targetFamily.id)
      .select('id, name')
      .single();

    if (error) {
      throw error;
    }

    targetFamily = data;
  }

  const { error: clearMemberError } = await supabase.from('family_members').delete().eq('family_id', targetFamily.id);

  if (clearMemberError) {
    throw clearMemberError;
  }

  for (const member of members) {
    const { data: existingUsers, error: findError } = await supabase
      .from('users')
      .select('id')
      .ilike('full_name', member.full_name)
      .limit(1);

    if (findError) {
      throw findError;
    }

    let userId = existingUsers?.[0]?.id;

    if (userId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          pin: member.pin,
          is_active: true
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert({
          full_name: member.full_name,
          pin: member.pin,
          avatar_url: null,
          is_active: true
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }

      userId = createdUser.id;
    }

    const { error: membershipError } = await supabase.from('family_members').upsert(
      {
        user_id: userId,
        family_id: targetFamily.id,
        role: member.role
      },
      { onConflict: 'user_id,family_id' }
    );

    if (membershipError) {
      throw membershipError;
    }
  }

  console.log(`Seeded ${familyName}: AK is admin; BK, PK, and MK are members.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
