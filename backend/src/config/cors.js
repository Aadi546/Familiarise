import { env } from './env.js';

const configuredOrigins = new Set(
  (env.clientOrigin || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

export function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.has(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    const host = url.hostname;

    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    );
  } catch {
    return false;
  }
}

export function corsOrigin(origin, callback) {
  callback(null, isAllowedOrigin(origin));
}
