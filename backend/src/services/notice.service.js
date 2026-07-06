import { supabase } from '../config/supabase.js';
import { assertFamilyAdmin, assertFamilyMember } from './family.service.js';
import { notifyFamily } from './push.service.js';

const noticeSelect = `
  id,
  family_id,
  author_id,
  content,
  priority,
  is_pinned,
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
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    // If is_pinned column missing, fall back to ordering by created_at only
    if (error.code === '42703' || error.message?.includes('is_pinned')) {
      const { data: fallback, error: fallbackError } = await supabase
        .from('notices')
        .select(noticeSelect)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fallbackError) {
        throw fallbackError;
      }

      return (fallback || []).map((n) => ({ ...n, is_pinned: false }));
    }

    throw error;
  }

  return data;
}

export async function createNotice({ familyId, authorId, content, priority, mediaFileId, isPinned }) {
  await assertFamilyAdmin(authorId, familyId);

  const { data, error } = await supabase
    .from('notices')
    .insert({
      family_id: familyId,
      author_id: authorId,
      content,
      priority,
      is_pinned: Boolean(isPinned),
      media_file_id: mediaFileId || null
    })
    .select(noticeSelect)
    .single();

  if (error) {
    throw error;
  }

  await notifyFamily({
    familyId,
    title: isPinned ? 'Pinned family notice' : 'New family notice',
    body: data.content,
    excludeUserId: authorId
  });

  return data;
}
