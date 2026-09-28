import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCommentsAPI, createCommentAPI, deleteCommentAPI } from '../features/comments/commentAPI';
import CommentItem from './CommentItem';
import '../styles/comments.css';

const MAX_COMMENT_LENGTH = 1000;

const CommentSection = ({ postId, postAuthorId, onCountChange }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Sirf latest request ka jawab use karo (post badalne par purana jawab overwrite na kare)
  const requestIdRef = useRef(0);

  const loadComments = async () => {
    const requestId = ++requestIdRef.current;
    try {
      const { data } = await getCommentsAPI(postId);
      if (requestId !== requestIdRef.current) return;
      setComments(data.data.comments);
      setCount(data.data.count);
      if (onCountChange) onCountChange(data.data.count);
    } catch {
      if (requestId !== requestIdRef.current) return;
      toast.error('Failed to load comments');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadComments();
    return () => {
      requestIdRef.current += 1; // unmount / post change par pending response ignore
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Logged-out user ko login pe bhejo, login ke baad isi page par wapas
  const goToLogin = () => navigate('/login', { state: { from: location } });

  const handlePostComment = async () => {
    if (!user) return goToLogin();
    const content = newComment.trim();
    if (!content || posting) return;

    setPosting(true);
    try {
      await createCommentAPI({ postId, content });
      setNewComment('');
      await loadComments(); // refetch: real tree shape mile
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    if (!user) return goToLogin();
    try {
      await createCommentAPI({ postId, content, parentCommentId });
      await loadComments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteCommentAPI(commentId);
      toast.success('Comment deleted');
      await loadComments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        {count} {count === 1 ? 'Comment' : 'Comments'}
      </h3>

      <div className="comment-input-row">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? 'Add a comment...' : 'Log in to comment'}
          onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
          // Logged-out: input tap karte hi login khulega (disabled nahi, warna click hi nahi milta)
          onFocus={() => { if (!user) goToLogin(); }}
          readOnly={!user}
          maxLength={MAX_COMMENT_LENGTH}
        />
        <button
          type="button"
          onClick={handlePostComment}
          disabled={posting || (user && !newComment.trim())}
        >
          {posting ? 'Posting...' : user ? 'Post' : 'Log in'}
        </button>
      </div>

      {loading ? (
        <p className="comment-loading">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="comment-empty">No comments yet — be the first to say something.</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postAuthorId={postAuthorId}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;