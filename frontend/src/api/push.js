import { api } from './client.js';

export function fetchPushPublicKey() {
  return api('/push/public-key');
}

export function savePushSubscription({ userId, familyId, subscription }) {
  return api('/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ userId, familyId, subscription })
  });
}
