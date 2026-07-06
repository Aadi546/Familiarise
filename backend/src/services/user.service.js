import { supabase } from '../config/supabase.js';
import { assertFamilyMember } from './family.service.js';

export async function updateProfile({ userId, familyId, avatarUrl, birthday }) {
  await assertFamilyMember(userId, familyId);

  const { data, error } = await supabase
    .from('users')
    .update({
      avatar_url: avatarUrl,
      birthday
    })
    .eq('id', userId)
    .select('id, full_name, avatar_url, birthday, is_active')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
