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

  try {
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select('user_id')
      .eq('family_id', familyId);

    if (membersError) {
      console.error('notifyFamily: failed to fetch members', membersError);
      return;
    }

    const userIds = (members || [])
      .map((m) => m.user_id)
      .filter((id) => id !== excludeUserId);

    if (userIds.length === 0) {
      return;
    }

    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', userIds);

    if (subsError) {
      console.error('notifyFamily: failed to fetch subscriptions', subsError);
      return;
    }

    const sends = (subs || []).map((row) =>
      webpush
        .sendNotification(
          row.subscription,
          JSON.stringify({ title, body, url: '/' })
        )
        .catch((sendError) => {
          console.error('notifyFamily: push send failed', sendError);
        })
    );

    await Promise.all(sends);
  } catch (err) {
    console.error('notifyFamily: unexpected error', err);
  }
}
