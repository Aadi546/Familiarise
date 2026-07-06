import { api } from './client.js';

export function updateProfile({ userId, familyId, avatarUrl, birthday }) {
  return api(`/users/${userId}/profile`, {
    method: 'PUT',
    body: JSON.stringify({ familyId, avatarUrl, birthday })
  });
}
