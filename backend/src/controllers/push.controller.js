import { getPushConfig, savePushSubscription } from '../services/push.service.js';
import { requireUuid } from '../utils/validators.js';
import { badRequest } from '../utils/httpError.js';

export async function getPushPublicKey(req, res) {
  res.json(getPushConfig());
}

export async function subscribePush(req, res) {
  const userId = requireUuid(req.body.userId, 'User id');
  const familyId = requireUuid(req.body.familyId, 'Family id');

  if (!req.body.subscription?.endpoint) {
    throw badRequest('Push subscription is required.');
  }

  const subscription = await savePushSubscription({
    userId,
    familyId,
    subscription: req.body.subscription
  });

  res.status(201).json({ subscription });
}
