import { useState } from 'react';

/**
 * Presentational form for posting a new comment. Owns only the draft text
 * and its own submitting state — posting itself, and error handling, live in
 * the parent (client/src/features/comments/CommentThread.jsx) so the thread
 * stays the single source of truth for the comment list.
 *
 * @param {{ onSubmit: (body: string) => Promise<void> }} props
 */
export default function CommentForm({ onSubmit }) {
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setIsSubmitting(true);
    try {
      await onSubmit(body);
      setDraft('');
    } catch {
      // Parent surfaces the error; keep the draft so the user doesn't retype.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <label htmlFor="comment-body" className="sr-only">
        Add a comment
      </label>
      <textarea
        id="comment-body"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Share your thoughts on this recipe…"
        rows={2}
        className="w-full resize-none rounded-2xl border border-navy/15 bg-cream-base px-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
      />
      <button
        type="submit"
        disabled={isSubmitting || !draft.trim()}
        className="shrink-0 rounded-2xl bg-navy px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-cream-base transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Posting…' : 'Post'}
      </button>
    </form>
  );
}
