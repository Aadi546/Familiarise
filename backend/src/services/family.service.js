import { supabase } from '../config/supabase.js';
import { forbidden } from '../utils/httpError.js';

export async function getFamiliesForUser(userId) {
  const { data, error } = await supabase
    .from('family_members')
    .select('role, families(id, name, created_at)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data.map((row) => ({
    ...row.families,
    role: row.role
  }));
}

export async function assertFamilyMember(userId, familyId) {
  const { data, error } = await supabase
    .from('family_members')
    .select('role')
    .eq('user_id', userId)
    .eq('family_id', familyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw forbidden('User is not a member of this family.');
  }

  return data;
}

export async function assertFamilyAdmin(userId, familyId) {
  const member = await assertFamilyMember(userId, familyId);

  if (member.role !== 'admin') {
    throw forbidden('Only family admins can do this.');
  }

  return member;
}
