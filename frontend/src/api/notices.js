import { api } from './client.js';

export function fetchNotices(familyId, viewerId) {
  return api(`/notices/${familyId}?viewerId=${viewerId}`);
}

export function createNotice({ familyId, authorId, content, priority, mediaFileId, isPinned }) {
  return api('/notices', {
    method: 'POST',
    body: JSON.stringify({ familyId, authorId, content, priority, mediaFileId, isPinned })
  });
}
