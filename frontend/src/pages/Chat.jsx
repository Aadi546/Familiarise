import { ImagePlus, Mic, SendHorizontal, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fetchMessages } from '../api/messages.js';
import { fetchMediaStatus, uploadMedia } from '../api/media.js';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import MessageBubble from '../components/MessageBubble.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { connectFamilySocket, getSocket } from '../socket/socket.js';
import { formatDateTime } from '../utils/date.js';

export default function Chat() {
  const { user, activeFamily } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStatus, setMediaStatus] = useState({ configured: false });
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [typingMembers, setTypingMembers] = useState([]);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const typingTimerRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    let isMounted = true;
    const socket = connectFamilySocket({ fullName: user.full_name });

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const data = await fetchMessages(activeFamily.id, user.id);
        if (isMounted) {
          setMessages(data.messages);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    fetchMediaStatus()
      .then((status) => {
        if (isMounted) {
          setMediaStatus(status);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMediaStatus({ configured: false });
        }
      });

    socket.emit('join_family', { familyId: activeFamily.id, userId: user.id });
    socket.on('new_message', appendMessage);
    socket.on('message_updated', updateMessage);
    socket.on('family_presence', handlePresence);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      isMounted = false;
      window.clearTimeout(typingTimerRef.current);
      socket.off('new_message', appendMessage);
      socket.off('message_updated', updateMessage);
      socket.off('family_presence', handlePresence);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [activeFamily.id, user.id, user.full_name]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  function appendMessage(message) {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current;
      }

      return [...current, message];
    });
  }

  function updateMessage(message) {
    setMessages((current) => current.map((item) => (item.id === message.id ? message : item)));
  }

  function handlePresence({ familyId, online }) {
    if (familyId === activeFamily.id) {
      setOnlineMembers(online || []);
    }
  }

  function handleTypingStart({ userId, fullName }) {
    if (userId === user.id) {
      return;
    }

    setTypingMembers((current) => {
      if (current.some((member) => member.userId === userId)) {
        return current;
      }

      return [...current, { userId, fullName }];
    });
  }

  function handleTypingStop({ userId }) {
    setTypingMembers((current) => current.filter((member) => member.userId !== userId));
  }

  function handleContentChange(event) {
    setContent(event.target.value);
    const socket = getSocket();
    socket.emit('typing_start', { familyId: activeFamily.id, userId: user.id, fullName: user.full_name });

    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socket.emit('typing_stop', { familyId: activeFamily.id, userId: user.id });
    }, 900);
  }

  async function handleSend(event) {
    event.preventDefault();

    if (!content.trim() && !selectedFile) {
      return;
    }

    setIsSending(true);
    setError('');

    try {
      let mediaFileId = null;

      if (selectedFile) {
        const mediaFile = await uploadMedia({ file: selectedFile, familyId: activeFamily.id, userId: user.id });
        mediaFileId = mediaFile.id;
      }

      await new Promise((resolve, reject) => {
        getSocket().emit(
          'send_message',
          {
            familyId: activeFamily.id,
            userId: user.id,
            content: content.trim(),
            mediaFileId
          },
          (ack) => {
            if (ack?.ok) {
              resolve(ack.message);
            } else {
              reject(new Error(ack?.message || 'Could not send message.'));
            }
          }
        );
      });

      setContent('');
      setSelectedFile(null);
      getSocket().emit('typing_stop', { familyId: activeFamily.id, userId: user.id });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  function handleReaction(messageId, emoji) {
    getSocket().emit('toggle_reaction', { messageId, userId: user.id, emoji }, (ack) => {
      if (!ack?.ok) {
        setError(ack?.message || 'Could not update reaction.');
      }
    });
  }

  async function toggleRecording() {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }

    if (!mediaStatus.configured) {
      setError('Connect Cloudflare R2 before recording voice notes.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });

        try {
          const mediaFile = await uploadMedia({ file, familyId: activeFamily.id, userId: user.id });
          await new Promise((resolve, reject) => {
            getSocket().emit(
              'send_message',
              { familyId: activeFamily.id, userId: user.id, content: 'Voice note', mediaFileId: mediaFile.id },
              (ack) => (ack?.ok ? resolve() : reject(new Error(ack?.message || 'Could not send voice note.')))
            );
          });
        } catch (err) {
          setError(err.message);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setError('Microphone permission is needed for voice notes.');
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-11rem)] flex-col">
      <div className="mb-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Chat</h2>
            <p className="mt-1 text-base font-semibold text-slate-500">Messages stay inside {activeFamily.name}.</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-900">
            {onlineMembers.length || 1} online
          </span>
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-base font-semibold text-rose-800">{error}</p>}

      <div className="flex-1 space-y-4 pb-4">
        {isLoading ? (
          <LoadingState label="Loading messages" />
        ) : messages.length === 0 ? (
          <EmptyState title="No messages yet" message="Send the first hello, update, photo, or video for this family." />
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const showDate = !previous || new Date(previous.created_at).toDateString() !== new Date(message.created_at).toDateString();

            return (
              <div key={message.id} className="space-y-4">
                {showDate && <DateSeparator value={message.created_at} />}
                <MessageBubble message={message} isMine={message.user_id === user.id} onReact={handleReaction} />
              </div>
            );
          })
        )}
        {typingMembers.length > 0 && (
          <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
            {typingMembers.map((member) => member.fullName).join(', ')} typing...
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="sticky bottom-24 rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
        {selectedFile && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-slate-100 px-3 py-2">
            <p className="truncate text-base font-semibold text-slate-700">{selectedFile.name}</p>
            <button type="button" onClick={() => setSelectedFile(null)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <label
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
              mediaStatus.configured ? 'cursor-pointer bg-slate-100 text-slate-700' : 'cursor-not-allowed bg-slate-100 text-slate-400'
            }`}
            title={mediaStatus.configured ? 'Attach photo or video' : 'Connect Cloudflare R2 to enable media uploads'}
          >
            <ImagePlus size={24} />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/webm,audio/mp4,audio/mpeg,audio/ogg,audio/wav"
              className="sr-only"
              disabled={!mediaStatus.configured}
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </label>
          <button
            type="button"
            onClick={toggleRecording}
            disabled={!mediaStatus.configured}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
              isRecording ? 'bg-rose-600 text-white' : mediaStatus.configured ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-400'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Record voice note'}
            title={mediaStatus.configured ? 'Record voice note' : 'Connect Cloudflare R2 to enable voice notes'}
          >
            {isRecording ? <Square size={21} /> : <Mic size={22} />}
          </button>
          <textarea
            value={content}
            onChange={handleContentChange}
            rows={1}
            className="min-h-12 flex-1 resize-none rounded-lg border border-slate-300 px-4 py-3 text-base outline-none focus:border-family-700 focus:ring-4 focus:ring-family-100"
            placeholder="Write a message"
          />
          <button
            type="submit"
            disabled={isSending || (!content.trim() && !selectedFile)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-family-700 text-white disabled:bg-slate-300"
            aria-label="Send message"
          >
            <SendHorizontal size={24} />
          </button>
        </div>
      </form>
    </section>
  );
}

function DateSeparator({ value }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-600">
        {formatDateTime(value).split(',')[0]}
      </span>
    </div>
  );
}
