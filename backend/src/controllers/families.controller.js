import { getFamiliesForUser } from '../services/family.service.js';
import { requireUuid } from '../utils/validators.js';

export async function listFamilies(req, res) {
  const userId = requireUuid(req.params.userId, 'User id');
  const families = await getFamiliesForUser(userId);

  res.json({ families });
}
