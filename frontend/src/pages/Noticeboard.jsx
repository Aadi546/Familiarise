import { ImagePlus, SendHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchMediaStatus, uploadMedia } from '../api/media.js';
import { createNotice, fetchNotices } from '../api/notices.js';
import EmptyState from '../components/EmptyState.jsx';
import LoadingState from '../components/LoadingState.jsx';
import NoticeCard from '../components/NoticeCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Noticeboard() {
  const { user, activeFamily } = useAuth();
  const [notices, setNotices] = useState([]);
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [mediaStatus, setMediaStatus] = useState({ configured: false });
  const [error, setError] = useState('');
  const isAdmin = activeFamily.role === 'admin';

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const data = await fetchNotices(activeFamily.id, user.id);

        if (isMounted) {
          setNotices(data.notices);
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

    return () => {
      isMounted = false;
    };
  }, [activeFamily.id, user.id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      let mediaFileId = null;

      if (selectedFile) {
        const mediaFile = await uploadMedia({ file: selectedFile, familyId: activeFamily.id, userId: user.id });
        mediaFileId = mediaFile.id;
      }

      const data = await createNotice({
        familyId: activeFamily.id,
        authorId: user.id,
        content: content.trim(),
        priority,
        isPinned,
        mediaFileId
      });

      setNotices((current) => [data.notice, ...current]);
      setContent('');
      setPriority('normal');
      setIsPinned(false);
      setSelectedFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-black text-slate-950">Noticeboard</h2>
        <p className="mt-1 text-base font-semibold text-slate-500">Important updates for {activeFamily.name}.</p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-base font-semibold text-rose-800">{error}</p>}

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block">
            <span className="text-base font-bold text-slate-800">New notice</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-lg outline-none focus:border-family-700 focus:ring-4 focus:ring-family-100"
              placeholder="Share an important family update"
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="min-h-12 rounded-lg border border-slate-300 px-4 text-base font-bold"
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>

            <label className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-family-50 px-4 text-base font-bold text-family-900">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(event) => setIsPinned(event.target.checked)}
                className="h-5 w-5"
              />
              Pin
            </label>

            <label
              className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-base font-bold ${
                mediaStatus.configured ? 'cursor-pointer bg-slate-100 text-slate-700' : 'cursor-not-allowed bg-slate-100 text-slate-400'
              }`}
              title={mediaStatus.configured ? 'Add photo or video' : 'Connect Cloudflare R2 to enable media uploads'}
            >
              <ImagePlus size={22} />
              Add media
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/webm,audio/mp4,audio/mpeg,audio/ogg,audio/wav"
                className="sr-only"
                disabled={!mediaStatus.configured}
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
              />
            </label>

            <button
              type="submit"
              disabled={isPosting || !content.trim()}
              className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-family-700 px-5 text-base font-black text-white disabled:bg-slate-300"
            >
              <SendHorizontal size={22} />
              Post
            </button>
          </div>

          {selectedFile && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-slate-100 px-3 py-2">
              <p className="truncate text-base font-semibold text-slate-700">{selectedFile.name}</p>
              <button type="button" onClick={() => setSelectedFile(null)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <X size={20} />
              </button>
            </div>
          )}
        </form>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <LoadingState label="Loading notices" />
        ) : notices.length === 0 ? (
          <EmptyState title="No notices yet" message="Important family announcements will appear here." />
        ) : (
          notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
        )}
      </div>
    </section>
  );
}
