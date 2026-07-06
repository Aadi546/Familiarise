import { env } from '../config/env.js';

export function getIceServers() {
  const servers = [{ urls: 'stun:stun.l.google.com:19302' }];

  if (env.turnUrls && env.turnUsername && env.turnCredential) {
    servers.push({
      urls: env.turnUrls.split(',').map((url) => url.trim()).filter(Boolean),
      username: env.turnUsername,
      credential: env.turnCredential
    });
  }

  return servers;
}
