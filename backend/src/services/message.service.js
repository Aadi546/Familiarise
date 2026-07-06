import { supabase } from '../config/supabase.js';
import { assertFamilyMember } from './family.service.js';
import { notifyFamily } from './push.service.js';

const messageSelect = `
  id,
  family_id,
  user_id,
  content,
  created_at,
  media_files(id, public_url, file_type, file_size),
  users!messages_user_id_fkey(id, full_name, avatar_url),
  message_reactions(emoji, user_id, users!message_reactions_user_id_fkey(id, full_name))
`;

export async function getMessages(familyId, viewerId) {
  await assertFamilyMember(viewerId, familyId);

  const { data, error } = await supabase
    .from('messages')
    .select(messageSelect)
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    throw error;
  }

  await notifyFamily({
    familyId,
    title: 'New family message',
    body: data.content || 'New media message',
    excludeUserId: userId
  });

  return data;
}

export async function createMessage({ familyId, userId, content, mediaFileId }) {
  await assertFamilyMember(userId, familyId);

  const { data, error } = await supabase
    .from('messages')
    .insert({
      family_id: familyId,
      user_id: userId,
      content: content || '',
      media_file_id: mediaFileId || null
    })
    .select(messageSelect)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function toggleReaction({ messageId, userId, emoji }) {
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .select('id, family_id')
    .eq('id', messageId)
    .single();

  if (messageError) {
    throw messageError;
  }

  await assertFamilyMember(userId, message.family_id);

  const { data: existing, error: findError } = await supabase
    .from('message_reactions')
    .select('message_id')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existing) {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: userId,
      emoji
    });

    if (error) {
      throw error;
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .select(messageSelect)
    .eq('id', messageId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
