import { supabase } from '../config/supabase.js';
import { getFamiliesForUser } from './family.service.js';
import { badRequest } from '../utils/httpError.js';

export async function loginWithPin(fullName, pin) {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, pin, avatar_url, is_active')
    .ilike('full_name', fullName)
    .limit(1);

  if (error) {
    throw error;
  }

  const user = users?.[0];

  if (!user || user.pin !== pin || !user.is_active) {
    throw badRequest('Name or PIN is incorrect.');
  }

  const families = await getFamiliesForUser(user.id);
  const { pin: _pin, ...safeUser } = user;

  return {
    user: safeUser,
    families
  };
}
