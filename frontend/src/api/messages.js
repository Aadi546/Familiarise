import { api } from './client.js';

export function fetchMessages(familyId, viewerId) {
  return api(`/messages/${familyId}?viewerId=${viewerId}`);
}

export function createMessage({ familyId, userId, content, mediaFileId }) {
  return api('/messages', {
    method: 'POST',
    body: JSON.stringify({ familyId, userId, content, mediaFileId })
  });
}

export function reactToMessage({ messageId, userId, emoji }) {
  return api(`/messages/${messageId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ userId, emoji })
  });
}
