import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCommentsAPI, createCommentAPI, deleteCommentAPI } from '../features/comments/commentAPI';
import CommentItem from './CommentItem';
import '../styles/comments.css';

const CommentSection = ({ postId, postAuthorId }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [count, setCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    try {
      const { data } = await getCommentsAPI(postId);
      setComments(data.data.comments);
      setCount(data.data.count);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handlePostComment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    try {
      await createCommentAPI({ postId, content: newComment });
      setNewComment('');
      loadComments(); // simplest correct approach — refetch to get the real tree shape
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const handleReply = async (parentCommentId, content) => {
    try {
      await createCommentAPI({ postId, content, parentCommentId });
      loadComments();
    } catch {
      toast.error('Failed to post reply');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteCommentAPI(commentId);
      toast.success('Comment deleted');
      loadComments();
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">{count} {count === 1 ? 'Comment' : 'Comments'}</h3>

      <div className="comment-input-row">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? 'Add a comment...' : 'Log in to comment'}
          onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
          disabled={!user}
        />
        <button onClick={handlePostComment} disabled={!user}>Post</button>
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