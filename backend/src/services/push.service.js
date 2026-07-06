import webpush from 'web-push';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { assertFamilyMember } from './family.service.js';

const configured = Boolean(env.vapidPublicKey && env.vapidPrivateKey);

if (configured) {
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
}

export function getPushConfig() {
  return {
    configured,
    publicKey: configured ? env.vapidPublicKey : null
  };
}

export async function savePushSubscription({ userId, familyId, subscription }) {
  await assertFamilyMember(userId, familyId);

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        subscription
      },
      { onConflict: 'endpoint' }
    )
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function notifyFamily({ familyId, title, body, excludeUserId }) {
  if (!configured) {
    return;
  }

  const { data, error } = await supabase
    .from('family_members')
    .select('user_id, users!family_members_user_id_fkey(push_subscriptions(subscription, endpoint))')
    .eq('family_id', familyId);

  if (error) {
    console.error(error);
    return;
  }

  const sends = [];

  for (const member of data || []) {
    if (member.user_id === excludeUserId) {
      continue;
    }

    for (const row of member.users?.push_subscriptions || []) {
      sends.push(
        webpush
          .sendNotification(
            row.subscription,
            JSON.stringify({
              title,
              body,
              url: '/'
            })
          )
          .catch((sendError) => {
            console.error(sendError);
          })
      );
    }
  }

  await Promise.all(sends);
}
