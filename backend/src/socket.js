import { Server } from 'socket.io';
import { assertFamilyMember } from './services/family.service.js';
import { createMessage, toggleReaction } from './services/message.service.js';
import { corsOrigin } from './config/cors.js';
import { badRequest } from './utils/httpError.js';
import { optionalString, requireUuid } from './utils/validators.js';

export function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST']
    }
  });

  const familySockets = new Map();
  const callSockets = new Map();

  io.on('connection', (socket) => {
    socket.on('join_family', async ({ familyId, userId }, ack) => {
      try {
        familyId = requireUuid(familyId, 'Family id');
        userId = requireUuid(userId, 'User id');
        await assertFamilyMember(userId, familyId);

        socket.data.familyId = familyId;
        socket.data.userId = userId;
        socket.data.fullName = typeof socket.handshake.auth?.fullName === 'string' ? socket.handshake.auth.fullName : 'Family member';

        addSocketToFamily(familySockets, familyId, socket.id);
        socket.join(roomName(familyId));
        emitFamilyPresence(io, familySockets, familyId);
        ack?.({ ok: true });
      } catch (error) {
        ack?.({ ok: false, message: error.message || 'Could not join family.' });
      }
    });

    socket.on('send_message', async ({ familyId, userId, content, mediaFileId }, ack) => {
      try {
        familyId = requireUuid(familyId, 'Family id');
        userId = requireUuid(userId, 'User id');
        content = optionalString(content, 'Message', 2000) || '';
        mediaFileId = mediaFileId ? requireUuid(mediaFileId, 'Media file id') : null;

        if (!content && !mediaFileId) {
          throw badRequest('Message text or image is required.');
        }

        const message = await createMessage({ familyId, userId, content, mediaFileId });
        io.to(roomName(familyId)).emit('new_message', message);
        ack?.({ ok: true, message });
      } catch (error) {
        ack?.({ ok: false, message: error.message || 'Could not send message.' });
      }
    });

    socket.on('typing_start', ({ familyId, userId, fullName }) => {
      socket.to(roomName(familyId)).emit('typing_start', { userId, fullName });
    });

    socket.on('typing_stop', ({ familyId, userId }) => {
      socket.to(roomName(familyId)).emit('typing_stop', { userId });
    });

    socket.on('toggle_reaction', async ({ messageId, userId, emoji }, ack) => {
      try {
        messageId = requireUuid(messageId, 'Message id');
        userId = requireUuid(userId, 'User id');
        const message = await toggleReaction({ messageId, userId, emoji });
        io.to(roomName(message.family_id)).emit('message_updated', message);
        ack?.({ ok: true, message });
      } catch (error) {
        ack?.({ ok: false, message: error.message || 'Could not update reaction.' });
      }
    });

    socket.on('call_join', async ({ familyId, userId, fullName, callType }, ack) => {
      try {
        familyId = requireUuid(familyId, 'Family id');
        userId = requireUuid(userId, 'User id');
        await assertFamilyMember(userId, familyId);

        socket.data.familyId = familyId;
        socket.data.userId = userId;
        socket.data.fullName = fullName || socket.data.fullName || 'Family member';
        socket.data.callType = callType === 'video' ? 'video' : 'audio';

        addSocketToFamily(familySockets, familyId, socket.id);
        addSocketToFamily(callSockets, familyId, socket.id);
        socket.join(roomName(familyId));
        socket.join(callRoomName(familyId));

        const peers = getCallPeers(io, callSockets, familyId, socket.id);
        socket.to(callRoomName(familyId)).emit('call_peer_joined', peerInfo(socket));
        io.to(roomName(familyId)).emit('call_status', { active: true, familyId });
        emitFamilyPresence(io, familySockets, familyId);

        ack?.({ ok: true, peers });
      } catch (error) {
        ack?.({ ok: false, message: error.message || 'Could not join call.' });
      }
    });

    socket.on('call_leave', ({ familyId }) => {
      leaveCall(io, callSockets, socket, familyId || socket.data.familyId);
    });

    socket.on('webrtc_offer', ({ targetSocketId, description }) => {
      io.to(targetSocketId).emit('webrtc_offer', {
        fromSocketId: socket.id,
        peer: peerInfo(socket),
        description
      });
    });

    socket.on('webrtc_answer', ({ targetSocketId, description }) => {
      io.to(targetSocketId).emit('webrtc_answer', {
        fromSocketId: socket.id,
        description
      });
    });

    socket.on('webrtc_ice_candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc_ice_candidate', {
        fromSocketId: socket.id,
        candidate
      });
    });

    socket.on('disconnect', () => {
      const familyId = socket.data.familyId;

      if (familyId) {
        removeSocketFromFamily(familySockets, familyId, socket.id);
        leaveCall(io, callSockets, socket, familyId);
        emitFamilyPresence(io, familySockets, familyId);
      }
    });
  });

  return io;
}

function roomName(familyId) {
  return `family:${familyId}`;
}

function callRoomName(familyId) {
  return `family:${familyId}:call`;
}

function addSocketToFamily(map, familyId, socketId) {
  if (!map.has(familyId)) {
    map.set(familyId, new Set());
  }

  map.get(familyId).add(socketId);
}

function removeSocketFromFamily(map, familyId, socketId) {
  const sockets = map.get(familyId);

  if (!sockets) {
    return;
  }

  sockets.delete(socketId);

  if (sockets.size === 0) {
    map.delete(familyId);
  }
}

function peerInfo(socket) {
  return {
    socketId: socket.id,
    userId: socket.data.userId,
    fullName: socket.data.fullName,
    callType: socket.data.callType || 'audio'
  };
}

function getFamilyPresence(io, familySockets, familyId) {
  const sockets = familySockets.get(familyId) || new Set();
  const byUser = new Map();

  for (const socketId of sockets) {
    const socket = io.sockets.sockets.get(socketId);

    if (socket?.data.userId && !byUser.has(socket.data.userId)) {
      byUser.set(socket.data.userId, peerInfo(socket));
    }
  }

  return [...byUser.values()];
}

function getCallPeers(io, callSockets, familyId, currentSocketId) {
  const sockets = callSockets.get(familyId) || new Set();

  return [...sockets]
    .filter((socketId) => socketId !== currentSocketId)
    .map((socketId) => io.sockets.sockets.get(socketId))
    .filter(Boolean)
    .map(peerInfo);
}

function emitFamilyPresence(io, familySockets, familyId) {
  io.to(roomName(familyId)).emit('family_presence', {
    familyId,
    online: getFamilyPresence(io, familySockets, familyId)
  });
}

function leaveCall(io, callSockets, socket, familyId) {
  if (!familyId) {
    return;
  }

  const wasInCall = callSockets.get(familyId)?.has(socket.id);

  removeSocketFromFamily(callSockets, familyId, socket.id);
  socket.leave(callRoomName(familyId));

  if (wasInCall) {
    socket.to(callRoomName(familyId)).emit('call_peer_left', { socketId: socket.id });
    io.to(roomName(familyId)).emit('call_status', {
      active: Boolean(callSockets.get(familyId)?.size),
      familyId
    });
  }
}
