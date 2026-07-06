import { api } from './client.js';

export function fetchMediaStatus() {
  return api('/media/status');
}

export async function uploadMedia({ file, familyId, userId }) {
  const { uploadUrl, mediaFile } = await api('/media/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      familyId,
      userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })
  });

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error('Media upload failed.');
  }

  return mediaFile;
}

export const uploadImage = uploadMedia;
