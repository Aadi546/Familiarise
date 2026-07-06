import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { getFamiliesForUser } from './family.service.js';
import { badRequest } from '../utils/httpError.js';

export async function loginWithPin(fullName, pin) {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, pin, pin_hash, avatar_url, birthday, is_active')
    .ilike('full_name', fullName)
    .limit(1);

  if (error) {
    // If new columns (pin_hash, birthday) don't exist yet, fall back to original columns
    if (error.code === '42703' || error.message?.includes('pin_hash') || error.message?.includes('birthday')) {
      const { data: fallbackUsers, error: fallbackError } = await supabase
        .from('users')
        .select('id, full_name, pin, avatar_url, is_active')
        .ilike('full_name', fullName)
        .limit(1);

      if (fallbackError) {
        throw fallbackError;
      }

      const fallbackUser = fallbackUsers?.[0];

      if (!fallbackUser || fallbackUser.pin !== pin || !fallbackUser.is_active) {
        throw badRequest('Name or PIN is incorrect.');
      }

      const families = await getFamiliesForUser(fallbackUser.id);
      const { pin: _pin, ...safeUser } = fallbackUser;

      return { user: safeUser, families };
    }

    throw error;
  }

  const user = users?.[0];
  const isPinValid = user ? await verifyPin(user, pin) : false;

  if (!user || !isPinValid || !user.is_active) {
    throw badRequest('Name or PIN is incorrect.');
  }

  const families = await getFamiliesForUser(user.id);
  const { pin: _pin, pin_hash: _pinHash, ...safeUser } = user;

  return {
    user: safeUser,
    families
  };
}

async function verifyPin(user, pin) {
  if (user.pin_hash) {
    return bcrypt.compare(pin, user.pin_hash);
  }

  return user.pin === pin;
}
