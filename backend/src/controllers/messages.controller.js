import { createMessage, getMessages } from '../services/message.service.js';
import { optionalString, requireUuid } from '../utils/validators.js';
import { badRequest } from '../utils/httpError.js';

export async function listMessages(req, res) {
  const familyId = requireUuid(req.params.familyId, 'Family id');
  const viewerId = requireUuid(req.query.viewerId, 'Viewer id');
  const messages = await getMessages(familyId, viewerId);

  res.json({ messages });
}

export async function postMessage(req, res) {
  const familyId = requireUuid(req.body.familyId, 'Family id');
  const userId = requireUuid(req.body.userId, 'User id');
  const content = optionalString(req.body.content, 'Message', 2000) || '';
  const mediaFileId = req.body.mediaFileId ? requireUuid(req.body.mediaFileId, 'Media file id') : null;

  if (!content && !mediaFileId) {
    throw badRequest('Message text or image is required.');
  }

  const message = await createMessage({ familyId, userId, content, mediaFileId });

  res.status(201).json({ message });
}
