import { getIceServers } from '../services/call.service.js';

export async function listIceServers(req, res) {
  res.json({
    iceServers: getIceServers(),
    turnConfigured: getIceServers().some((server) => server.username)
  });
}
