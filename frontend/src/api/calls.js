import { api } from './client.js';

export function fetchIceServers() {
  return api('/calls/ice-servers');
}
