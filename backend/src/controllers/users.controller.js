import { updateProfile } from '../services/user.service.js';
import { optionalString, requireUuid } from '../utils/validators.js';

export async function putProfile(req, res) {
  const userId = requireUuid(req.params.userId, 'User id');
  const familyId = requireUuid(req.body.familyId, 'Family id');
  const avatarUrl = optionalString(req.body.avatarUrl, 'Avatar URL', 1000);
  const birthday = optionalString(req.body.birthday, 'Birthday', 20);
  const user = await updateProfile({ userId, familyId, avatarUrl, birthday });

  res.json({ user });
}
