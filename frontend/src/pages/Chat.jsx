import { ImagePlus, Mic, SendHorizontal, Square, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [onlineCount, setOnlineCount] = useState(1);
  const [typingMembers, setTypingMembers] = useState([]);
  const [error, setError] = useState('');

  const endRef = useRef(null);
  const listRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  // Track whether user has manually scrolled up
  const atBottomRef = useRef(true);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function isNearBottom() {
    const el = listRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 180;
  }

  function scrollToBottom(behavior = 'smooth') {
    endRef.current?.scrollIntoView({ behavior, block: 'end' });
  }

  function appendMessage(msg) {
    setMessages((prev) => {
      // Replace optimistic temp message if ids match or deduplicate
      const alreadyExists = prev.some((m) => m.id === msg.id);
      if (alreadyExists) return prev.map((m) => (m.id === msg.id ? { ...msg, _pending: false } : m));
      // Replace a pending message that came back from the server
      const hasPending = prev.some((m) => m._pending && m.user_id === msg.user_id);
      if (hasPending) return prev.map((m) => (m._pending && m.user_id === msg.user_id ? { ...msg, _pending: false } : m));
      return [...prev, msg];
    });
  }

  function updateMessage(msg) {
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...msg, _pending: false } : m)));
  }

  function removeMessage(messageId) {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }

  // Auto-resize textarea
  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }

  // ─── Socket setup ─────────────────────────────────────────────────────────

  useEffect(() => {
    let alive = true;
    const socket = connectFamilySocket({ fullName: user.full_name });

    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const data = await fetchMessages(activeFamily.id, user.id);
        if (alive) {
          setMessages(data.messages || []);
          // Scroll to bottom immediately after first load
          requestAnimationFrame(() => scrollToBottom('instant'));
        }
      } catch (err) {
        if (alive) setError(err.message || 'Failed to load messages.');
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    load();
    fetchMediaStatus().then((s) => alive && setMediaStatus(s)).catch(() => {});

    socket.emit('join_family', { familyId: activeFamily.id, userId: user.id });

    socket.on('new_message', appendMessage);
    socket.on('message_updated', updateMessage);
    socket.on('message_deleted', ({ messageId }) => removeMessage(messageId));

    socket.on('family_presence', ({ familyId, online }) => {
      if (familyId === activeFamily.id) setOnlineCount(online?.length || 1);
    });

    socket.on('typing_start', ({ userId: uid, fullName }) => {
      if (uid === user.id) return;
      setTypingMembers((prev) =>
        prev.some((m) => m.userId === uid) ? prev : [...prev, { userId: uid, fullName }]
      );
    });

    socket.on('typing_stop', ({ userId: uid }) => {
      setTypingMembers((prev) => prev.filter((m) => m.userId !== uid));
    });

    // Auto-reconnect: reload messages on reconnect
    socket.on('connect', () => {
      socket.emit('join_family', { familyId: activeFamily.id, userId: user.id });
    });

    return () => {
      alive = false;
      window.clearTimeout(typingTimerRef.current);
      socket.off('new_message', appendMessage);
      socket.off('message_updated', updateMessage);
      socket.off('message_deleted');
      socket.off('family_presence');
      socket.off('typing_start');
      socket.off('typing_stop');
      socket.off('connect');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFamily.id, user.id]);

  // ─── Auto-scroll on new messages (only when already near bottom) ──────────

  useEffect(() => {
    if (atBottomRef.current) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Track if user scrolled away from bottom
  function handleScroll() {
    atBottomRef.current = isNearBottom();
  }

  // ─── Send message ─────────────────────────────────────────────────────────

  async function handleSend(e) {
    e?.preventDefault();
    const text = content.trim();
    if (!text && !selectedFile) return;
    if (isSending) return;

    // Clear input immediately for a snappy feel
    const fileToSend = selectedFile;
    setContent('');
    setSelectedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsSending(true);
    setError('');

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      family_id: activeFamily.id,
      user_id: user.id,
      content: text,
      created_at: new Date().toISOString(),
      users: { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url },
      media_files: null,
      message_reactions: [],
      _pending: true
    };

    if (!fileToSend) {
      setMessages((prev) => [...prev, tempMsg]);
      atBottomRef.current = true;
    }

    try {
      let mediaFileId = null;
      if (fileToSend) {
        const mf = await uploadMedia({ file: fileToSend, familyId: activeFamily.id, userId: user.id });
        mediaFileId = mf.id;
      }

      const socket = getSocket();
      socket.emit('typing_stop', { familyId: activeFamily.id, userId: user.id });

      await new Promise((resolve, reject) => {
        socket.emit(
          'send_message',
          { familyId: activeFamily.id, userId: user.id, content: text, mediaFileId },
          (ack) => {
            if (ack?.ok) {
              // Replace temp message with real one
              if (!fileToSend) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === tempId ? { ...ack.message, _pending: false } : m))
                );
              }
              resolve();
            } else {
              reject(new Error(ack?.message || 'Could not send message.'));
            }
          }
        );
      });

      scrollToBottom();
    } catch (err) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(err.message || 'Failed to send. Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  // Send on Enter (not Shift+Enter)
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleContentChange(e) {
    setContent(e.target.value);
    autoResize();

    const socket = getSocket();
    socket.emit('typing_start', { familyId: activeFamily.id, userId: user.id, fullName: user.full_name });
    window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socket.emit('typing_stop', { familyId: activeFamily.id, userId: user.id });
    }, 1200);
  }

  // ─── Reactions ────────────────────────────────────────────────────────────

  function handleReaction(messageId, emoji) {
    getSocket().emit('toggle_reaction', { messageId, userId: user.id, emoji }, (ack) => {
      if (!ack?.ok) setError(ack?.message || 'Could not update reaction.');
    });
  }

  // ─── Delete message ───────────────────────────────────────────────────────

  function handleDeleteMessage(messageId) {
    // Optimistically remove from UI
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    getSocket().emit('delete_message', { messageId, userId: user.id }, (ack) => {
      if (!ack?.ok) {
        // Restore: reload messages from server
        fetchMessages(activeFamily.id, user.id)
          .then((d) => setMessages(d.messages || []))
          .catch(() => {});
        setError(ack?.message || 'Could not delete message.');
      }
    });
  }

  // ─── Voice recording ─────────────────────────────────────────────────────

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

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        try {
          const mf = await uploadMedia({ file, familyId: activeFamily.id, userId: user.id });
          await new Promise((res, rej) => {
            getSocket().emit(
              'send_message',
              { familyId: activeFamily.id, userId: user.id, content: 'Voice note', mediaFileId: mf.id },
              (ack) => (ack?.ok ? res() : rej(new Error(ack?.message || 'Could not send voice note.')))
            );
          });
        } catch (err) {
          setError(err.message || 'Voice note upload failed.');
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setError('Microphone permission denied.');
    }
  }

  // ─── Date separator helper ────────────────────────────────────────────────

  function needsDateSep(msg, prevMsg) {
    if (!prevMsg) return true;
    return new Date(prevMsg.created_at).toDateString() !== new Date(msg.created_at).toDateString();
  }

  // ─── Render ───────────────────────────────────────────────────────────────

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
          {onlineCount} online
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300 animate-slide-down flex items-center justify-between gap-2">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-rose-600 shrink-0">✕</button>
        </div>
      )}

      {/* Messages list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 space-y-3 pb-4 overflow-y-auto"
      >
        {isLoading ? (
          <LoadingState label="Loading messages" />
        ) : messages.length === 0 ? (
          <EmptyState title="No messages yet" message="Send the first hello, update, photo, or video for this family." />
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={msg.id}>
                {needsDateSep(msg, messages[i - 1]) && (
                  <div className="flex justify-center py-2">
                    <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {new Date(msg.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isMine={msg.user_id === user.id}
                  onReact={handleReaction}
                  onDelete={msg.user_id === user.id ? handleDeleteMessage : undefined}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {typingMembers.length > 0 && (
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="flex gap-1 items-end">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  {typingMembers.map((m) => m.fullName).join(', ')} typing…
                </p>
              </div>
            )}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Input bar ── */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-24 card rounded-2xl p-3 shadow-soft"
      >
        {/* Selected file preview */}
        {selectedFile && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800/40 px-3 py-2">
            <p className="truncate text-xs font-semibold text-teal-700 dark:text-teal-300">{selectedFile.name}</p>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="btn-ghost flex h-7 w-7 items-center justify-center shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Media attach */}
          <label
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
              mediaStatus.configured ? 'cursor-pointer btn-secondary' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
            title={mediaStatus.configured ? 'Attach media' : 'Connect R2 for media'}
          >
            <ImagePlus size={18} />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/webm,audio/mp4,audio/mpeg,audio/ogg,audio/wav"
              className="sr-only"
              disabled={!mediaStatus.configured}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Voice record */}
          <button
            type="button"
            onClick={toggleRecording}
            disabled={!mediaStatus.configured}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
              isRecording
                ? 'bg-rose-500 text-white animate-glow'
                : mediaStatus.configured
                ? 'btn-secondary'
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
            title={isRecording ? 'Stop recording' : 'Record voice note'}
          >
            {isRecording ? <Square size={16} /> : <Mic size={18} />}
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            rows={1}
            className="input flex-1 resize-none py-2.5 text-sm leading-5 overflow-hidden"
            style={{ minHeight: '36px', maxHeight: '128px' }}
            placeholder="Write a message…"
          />

          {/* Send */}
          <button
            type="submit"
            disabled={isSending || (!content.trim() && !selectedFile)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 transition-all duration-200 active:scale-95 shadow-glow-teal-sm"
          >
            {isSending ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <SendHorizontal size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
