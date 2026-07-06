import { createNotice, getNotices } from '../services/notice.service.js';
import { optionalString, requireString, requireUuid } from '../utils/validators.js';

const priorities = new Set(['normal', 'important', 'urgent']);

export async function listNotices(req, res) {
  const familyId = requireUuid(req.params.familyId, 'Family id');
  const viewerId = requireUuid(req.query.viewerId, 'Viewer id');
  const notices = await getNotices(familyId, viewerId);

  res.json({ notices });
}

export async function postNotice(req, res) {
  const familyId = requireUuid(req.body.familyId, 'Family id');
  const authorId = requireUuid(req.body.authorId, 'Author id');
  const content = requireString(req.body.content, 'Notice', 4000);
  const priority = priorities.has(req.body.priority) ? req.body.priority : 'normal';
  const mediaFileId = req.body.mediaFileId ? requireUuid(req.body.mediaFileId, 'Media file id') : null;
  const notice = await createNotice({ familyId, authorId, content, priority, mediaFileId });

  res.status(201).json({ notice });
}
