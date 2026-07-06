import { supabase } from '../config/supabase.js';
import { assertFamilyAdmin, assertFamilyMember } from './family.service.js';

export async function getReminders({ familyId, viewerId }) {
  await assertFamilyMember(viewerId, familyId);

  const { data, error } = await supabase
    .from('reminders')
    .select('id, family_id, author_id, title, details, remind_on, created_at, users!reminders_author_id_fkey(id, full_name, avatar_url)')
    .eq('family_id', familyId)
    .gte('remind_on', new Date().toISOString().slice(0, 10))
    .order('remind_on', { ascending: true })
    .limit(20);

  if (error) {
    throw error;
  }

  return data;
}

export async function createReminder({ familyId, authorId, title, details, remindOn }) {
  await assertFamilyAdmin(authorId, familyId);

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      family_id: familyId,
      author_id: authorId,
      title,
      details,
      remind_on: remindOn
    })
    .select('id, family_id, author_id, title, details, remind_on, created_at, users!reminders_author_id_fkey(id, full_name, avatar_url)')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
