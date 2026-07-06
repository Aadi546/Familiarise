import { supabase } from '../config/supabase.js';
import { assertFamilyAdmin, assertFamilyMember } from './family.service.js';

const noticeSelect = `
  id,
  family_id,
  author_id,
  content,
  priority,
  created_at,
  media_files(id, public_url, file_type, file_size),
  users!notices_author_id_fkey(id, full_name, avatar_url)
`;

export async function getNotices(familyId, viewerId) {
  await assertFamilyMember(viewerId, familyId);

  const { data, error } = await supabase
    .from('notices')
    .select(noticeSelect)
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return data;
}

export async function createNotice({ familyId, authorId, content, priority, mediaFileId }) {
  await assertFamilyAdmin(authorId, familyId);

  const { data, error } = await supabase
    .from('notices')
    .insert({
      family_id: familyId,
      author_id: authorId,
      content,
      priority,
      media_file_id: mediaFileId || null
    })
    .select(noticeSelect)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
