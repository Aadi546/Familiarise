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
    let alive = true;
    const socket = connectFamilySocket({ fullName: user.full_name });

    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchMessages(activeFamily.id, user.id);
        if (alive) setMessages(data.messages);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setIsLoading(false);
      }
    }
    load();

    fetchMediaStatus().then((s) => alive && setMediaStatus(s)).catch(() => {});

    socket.emit('join_family', { familyId: activeFamily.id, userId: user.id });
    socket.on('new_message', appendMessage);
    socket.on('message_updated', updateMessage);
    socket.on('family_presence', handlePresence);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      alive = false;
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
    setMessages((c) => (c.some((m) => m.id === message.id) ? c : [...c, message]));
  }
  function updateMessage(message) {
    setMessages((c) => c.map((m) => (m.id === message.id ? message : m)));
  }
  function handlePresence({ familyId, online }) {
    if (familyId === activeFamily.id) setOnlineMembers(online || []);
  }
  function handleTypingStart({ userId, fullName }) {
    if (userId === user.id) return;
    setTypingMembers((c) => (c.some((m) => m.userId === userId) ? c : [...c, { userId, fullName }]));
  }
  function handleTypingStop({ userId }) {
    setTypingMembers((c) => c.filter((m) => m.userId !== userId));
  }
  function handleContentChange(e) {
    setContent(e.target.value);
    const socket = getSocket();
    socket.emit('typing_start', { familyId: activeFamily.id, userId: user.id, fullName: user.full_name });
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socket.emit('typing_stop', { familyId: activeFamily.id, userId: user.id });
    }, 900);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    setIsSending(true);
    setError('');
    try {
      let mediaFileId = null;
      if (selectedFile) {
        const mf = await uploadMedia({ file: selectedFile, familyId: activeFamily.id, userId: user.id });
        mediaFileId = mf.id;
      }
      await new Promise((res, rej) => {
        getSocket().emit(
          'send_message',
          { familyId: activeFamily.id, userId: user.id, content: content.trim(), mediaFileId },
          (ack) => (ack?.ok ? res(ack.message) : rej(new Error(ack?.message || 'Could not send.')))
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
      if (!ack?.ok) setError(ack?.message || 'Could not update reaction.');
    });
  }

  async function toggleRecording() {
    if (isRecording) { recorderRef.current?.stop(); return; }
    if (!mediaStatus.configured) { setError('Connect Cloudflare R2 before recording.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        try {
          const mf = await uploadMedia({ file, familyId: activeFamily.id, userId: user.id });
          await new Promise((res, rej) => {
            getSocket().emit('send_message', { familyId: activeFamily.id, userId: user.id, content: 'Voice note', mediaFileId: mf.id },
              (ack) => (ack?.ok ? res() : rej(new Error(ack?.message || 'Could not send voice note.'))));
          });
        } catch (err) { setError(err.message); }
      };
      recorder.start();
      setIsRecording(true);
    } catch { setError('Microphone permission needed.'); }
  }

  return (
    <div className="flex min-h-[calc(100vh-11rem)] flex-col animate-fade-in">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="page-title">Chat</h2>
          <p className="page-subtitle">{activeFamily.name}</p>
        </div>
        <div className="badge-online">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
          {onlineMembers.length || 1} online
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300 animate-slide-down">
          {error}
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 space-y-4 pb-4">
        {isLoading ? (
          <LoadingState label="Loading messages" />
        ) : messages.length === 0 ? (
          <EmptyState title="No messages yet" message="Send the first hello, update, photo, or video for this family." />
        ) : (
          messages.map((msg, i) => {
            const prev = messages[i - 1];
            const showDate = !prev || new Date(prev.created_at).toDateString() !== new Date(msg.created_at).toDateString();
            return (
              <div key={msg.id} className="space-y-3">
                {showDate && (
                  <div className="flex justify-center">
                    <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {formatDateTime(msg.created_at).split(',')[0]}
                    </span>
                  </div>
                )}
                <MessageBubble message={msg} isMine={msg.user_id === user.id} onReact={handleReaction} />
              </div>
            );
          })
        )}
        {typingMembers.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {typingMembers.map((m) => m.fullName).join(', ')} typing…
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-24 card rounded-2xl p-3 shadow-soft"
      >
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800/40 px-3 py-2">
            <p className="truncate text-xs font-semibold text-teal-700 dark:text-teal-300">{selectedFile.name}</p>
            <button type="button" onClick={() => setSelectedFile(null)} className="btn-ghost flex h-7 w-7 items-center justify-center shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <label
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
              mediaStatus.configured
                ? 'cursor-pointer btn-secondary'
                : 'cursor-not-allowed text-slate-300 dark:text-slate-600'
            }`}
            title={mediaStatus.configured ? 'Attach media' : 'Connect R2 for media'}
          >
            <ImagePlus size={20} />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/webm,audio/mp4,audio/mpeg,audio/ogg,audio/wav"
              className="sr-only"
              disabled={!mediaStatus.configured}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            type="button"
            onClick={toggleRecording}
            disabled={!mediaStatus.configured}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
              isRecording
                ? 'bg-rose-500 text-white animate-glow'
                : mediaStatus.configured
                ? 'btn-secondary'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
            title={isRecording ? 'Stop recording' : 'Record voice note'}
          >
            {isRecording ? <Square size={18} /> : <Mic size={20} />}
          </button>

          <textarea
            value={content}
            onChange={handleContentChange}
            rows={1}
            className="input flex-1 resize-none py-2.5 text-sm min-h-10 max-h-32"
            placeholder="Write a message…"
          />

          <button
            type="submit"
            disabled={isSending || (!content.trim() && !selectedFile)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white disabled:opacity-40 transition-all duration-200 active:scale-95 shadow-glow-teal-sm"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
