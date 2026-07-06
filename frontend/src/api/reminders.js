import { api } from './client.js';

export function fetchReminders(familyId, viewerId) {
  return api(`/families/${familyId}/reminders?viewerId=${viewerId}`);
}

export function createReminder({ familyId, authorId, title, details, remindOn }) {
  return api(`/families/${familyId}/reminders`, {
    method: 'POST',
    body: JSON.stringify({ authorId, title, details, remindOn })
  });
}
