import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { connectFamilySocket } from '../socket/socket.js';

const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function Calls() {
  const { user, activeFamily } = useAuth();
  const [callState, setCallState] = useState('idle');
  const [callType, setCallType] = useState('audio');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState('');
  const [remotePeers, setRemotePeers] = useState([]);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const remoteStreamsRef = useRef(new Map());
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = connectFamilySocket({ fullName: user.full_name });
    socketRef.current = socket;
    socket.emit('join_family', { familyId: activeFamily.id, userId: user.id });

    socket.on('call_peer_joined', handlePeerJoined);
    socket.on('call_peer_left', handlePeerLeft);
    socket.on('webrtc_offer', handleOffer);
    socket.on('webrtc_answer', handleAnswer);
    socket.on('webrtc_ice_candidate', handleIceCandidate);

    return () => {
      socket.off('call_peer_joined', handlePeerJoined);
      socket.off('call_peer_left', handlePeerLeft);
      socket.off('webrtc_offer', handleOffer);
      socket.off('webrtc_answer', handleAnswer);
      socket.off('webrtc_ice_candidate', handleIceCandidate);
      leaveCall();
    };
  }, [activeFamily.id, user.id, user.full_name]);

  async function startCall(type) {
    setError('');
    setCallType(type);
    setCallState('joining');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      await new Promise((resolve, reject) => {
        socketRef.current.emit(
          'call_join',
          {
            familyId: activeFamily.id,
            userId: user.id,
            fullName: user.full_name,
            callType: type
          },
          async (ack) => {
            if (!ack?.ok) {
              reject(new Error(ack?.message || 'Could not join call.'));
              return;
            }

            for (const peer of ack.peers || []) {
              await createPeerConnection(peer, true);
            }

            resolve();
          }
        );
      });

      setCallState('active');
    } catch (err) {
      stopLocalMedia();
      setCallState('idle');
      setError(
        err.name === 'NotAllowedError'
          ? 'Microphone or camera permission was denied.'
          : 'Calls need browser microphone access. On phones, this usually requires HTTPS after deployment.'
      );
    }
  }

  async function handlePeerJoined(peer) {
    if (!localStreamRef.current) {
      return;
    }

    await createPeerConnection(peer, false);
  }

  function handlePeerLeft({ socketId }) {
    closePeer(socketId);
  }

  async function handleOffer({ fromSocketId, peer, description }) {
    if (!localStreamRef.current) {
      return;
    }

    const connection = await createPeerConnection({ ...peer, socketId: fromSocketId }, false);
    await connection.setRemoteDescription(description);
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    socketRef.current.emit('webrtc_answer', {
      targetSocketId: fromSocketId,
      description: connection.localDescription
    });
  }

  async function handleAnswer({ fromSocketId, description }) {
    const connection = peerConnectionsRef.current.get(fromSocketId);

    if (connection) {
      await connection.setRemoteDescription(description);
    }
  }

  async function handleIceCandidate({ fromSocketId, candidate }) {
    const connection = peerConnectionsRef.current.get(fromSocketId);

    if (connection && candidate) {
      await connection.addIceCandidate(candidate);
    }
  }

  async function createPeerConnection(peer, shouldOffer) {
    if (peerConnectionsRef.current.has(peer.socketId)) {
      return peerConnectionsRef.current.get(peer.socketId);
    }

    const connection = new RTCPeerConnection({ iceServers });
    peerConnectionsRef.current.set(peer.socketId, connection);

    for (const track of localStreamRef.current.getTracks()) {
      connection.addTrack(track, localStreamRef.current);
    }

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('webrtc_ice_candidate', {
          targetSocketId: peer.socketId,
          candidate: event.candidate
        });
      }
    };

    connection.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamsRef.current.set(peer.socketId, stream);
      setRemotePeers((current) => upsertPeer(current, { ...peer, stream }));
    };

    connection.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(connection.connectionState)) {
        closePeer(peer.socketId);
      }
    };

    setRemotePeers((current) => upsertPeer(current, peer));

    if (shouldOffer) {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      socketRef.current.emit('webrtc_offer', {
        targetSocketId: peer.socketId,
        description: connection.localDescription
      });
    }

    return connection;
  }

  function toggleMute() {
    const audioTracks = localStreamRef.current?.getAudioTracks() || [];

    for (const track of audioTracks) {
      track.enabled = isMuted;
    }

    setIsMuted((current) => !current);
  }

  function toggleCamera() {
    const videoTracks = localStreamRef.current?.getVideoTracks() || [];

    for (const track of videoTracks) {
      track.enabled = isCameraOff;
    }

    setIsCameraOff((current) => !current);
  }

  function leaveCall() {
    socketRef.current?.emit('call_leave', { familyId: activeFamily.id });
    stopLocalMedia();

    for (const socketId of peerConnectionsRef.current.keys()) {
      closePeer(socketId);
    }

    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();
    setRemotePeers([]);
    setCallState('idle');
    setIsMuted(false);
    setIsCameraOff(false);
  }

  function stopLocalMedia() {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }

  function closePeer(socketId) {
    peerConnectionsRef.current.get(socketId)?.close();
    peerConnectionsRef.current.delete(socketId);
    remoteStreamsRef.current.delete(socketId);
    setRemotePeers((current) => current.filter((peer) => peer.socketId !== socketId));
  }

  const inCall = callState === 'active' || callState === 'joining';

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-slate-950">Calls</h2>
        <p className="mt-1 text-base font-semibold text-slate-500">Start a family audio or video call.</p>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-base font-semibold text-rose-800">{error}</p>}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {!inCall ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => startCall('audio')}
              className="flex min-h-16 items-center justify-center gap-3 rounded-lg bg-family-700 px-5 text-lg font-black text-white"
            >
              <Phone size={24} />
              Audio Call
            </button>
            <button
              type="button"
              onClick={() => startCall('video')}
              className="flex min-h-16 items-center justify-center gap-3 rounded-lg bg-slate-900 px-5 text-lg font-black text-white"
            >
              <Video size={24} />
              Video Call
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              {callType === 'video' ? (
                <video ref={localVideoRef} autoPlay muted playsInline className="aspect-video w-full rounded-lg bg-slate-900 object-cover" />
              ) : (
                <AudioTile name={user.full_name} label="You are in the call" />
              )}

              {remotePeers.length === 0 ? (
                <div className="rounded-lg bg-slate-100 p-4 text-center text-base font-semibold text-slate-600">
                  Waiting for another family member to join...
                </div>
              ) : (
                remotePeers.map((peer) => <RemotePeer key={peer.socketId} peer={peer} />)
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={toggleMute} className="flex min-h-12 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                type="button"
                onClick={toggleCamera}
                disabled={callType !== 'video'}
                className="flex min-h-12 items-center justify-center rounded-lg bg-slate-100 text-slate-800 disabled:text-slate-300"
              >
                {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
              <button type="button" onClick={leaveCall} className="flex min-h-12 items-center justify-center rounded-lg bg-rose-600 text-white">
                <PhoneOff size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900">
        Note: camera and microphone access on phones usually needs HTTPS. Local hotspot testing may work for chat but block calls in some mobile browsers.
      </p>
    </section>
  );
}

function RemotePeer({ peer }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  if (!peer.stream) {
    return <AudioTile name={peer.fullName} label="Connecting..." />;
  }

  const hasVideo = peer.stream.getVideoTracks().length > 0;

  if (!hasVideo) {
    return <AudioTile name={peer.fullName} label="Audio connected" />;
  }

  return (
    <div className="overflow-hidden rounded-lg bg-slate-900">
      <video ref={videoRef} autoPlay playsInline className="aspect-video w-full object-cover" />
      <p className="px-3 py-2 text-sm font-bold text-white">{peer.fullName}</p>
    </div>
  );
}

function AudioTile({ name, label }) {
  return (
    <div className="flex min-h-32 items-center gap-4 rounded-lg bg-slate-100 p-4">
      <Avatar name={name} />
      <div>
        <p className="text-lg font-black text-slate-950">{name}</p>
        <p className="text-base font-semibold text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function upsertPeer(peers, nextPeer) {
  const withoutCurrent = peers.filter((peer) => peer.socketId !== nextPeer.socketId);
  return [...withoutCurrent, nextPeer];
}
