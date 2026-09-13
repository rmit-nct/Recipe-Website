import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { createComment, deleteComment, getComments } from '../../api/comments.js';
import CommentForm from './CommentForm.jsx';

/**
 * @typedef {Object} Comment — mirrors docs/DATA_SHAPES.md
 * @property {string} _id
 * @property {string} recipeId
 * @property {{_id: string, username: string}} author
 * @property {string} body
 * @property {string} createdAt
 */

/**
 * Comment thread for a recipe: list of existing comments, a form to post a
 * new one, and a delete action shown only on the logged-in user's own
 * comments (a display convenience — the real ownership check is server-side,
 * same as RecipeDetailPage's edit/delete buttons).
 *
 * @param {{ recipeId: string }} props
 */
export default function CommentThread({ recipeId }) {
  const { user } = useContext(AuthContext);

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postError, setPostError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { comments: fetched } = await getComments(recipeId);
        if (!cancelled) setComments(fetched);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchComments();

    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  async function handlePost(body) {
    setPostError('');
    try {
      const { comment } = await createComment(recipeId, body);
      setComments((prev) => [...prev, comment]);
    } catch (err) {
      setPostError(err.message || 'Could not post your comment. Please try again.');
      throw err;
    }
  }

  async function handleDelete(commentId) {
    setDeleteError('');
    setDeletingId(commentId);

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this comment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-navy">Comments</h2>

      <CommentForm onSubmit={handlePost} />
      {postError ? (
        <p className="mt-2 rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          {postError}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-6 text-sm text-navy/60">Loading comments…</p>
      ) : error ? (
        <p className="mt-6 rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          Couldn&apos;t load comments: {error.message ?? 'an unexpected error occurred.'}
        </p>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-sm text-navy/60">No comments yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {comments.map((comment) => {
            const isOwnComment = Boolean(user) && comment.author?._id === user._id;

            return (
              <li
                key={comment._id}
                className="rounded-2xl border border-navy/10 bg-cream-base p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-navy/60">
                      {comment.author?.username ?? 'unknown'} ·{' '}
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy/80">{comment.body}</p>
                  </div>

                  {isOwnComment ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment._id)}
                      disabled={deletingId === comment._id}
                      className="shrink-0 font-mono text-[11px] uppercase tracking-[0.06em] text-burnt-orange transition hover:text-burnt-orange/80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === comment._id ? 'Deleting…' : 'Delete'}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {deleteError ? (
        <p className="mt-4 rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          {deleteError}
        </p>
      ) : null}
    </section>
  );
}
