import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const CommentItem = ({ comment, postAuthorId, onReply, onDelete, depth = 0 }) => {
  const { user } = useSelector((state) => state.auth);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const canDelete = user && (user.id === comment.user_id || user.id === postAuthorId);

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className="comment-item" style={{ marginLeft: depth > 0 ? 32 : 0 }}>
      <Link to={`/author/${comment.user_id}`}>
        <img src={comment.author_avatar} alt={comment.author_name} className="comment-avatar" />
      </Link>

      <div className="comment-body">
        <div className="comment-header">
          <Link to={`/author/${comment.user_id}`} className="comment-author-name">
            {comment.author_name}
          </Link>
          {comment.user_id === postAuthorId && <span className="comment-author-badge">Author</span>}
          <span className="comment-time">{timeAgo(comment.created_at)}</span>
        </div>

        <p className="comment-text">{comment.content}</p>

        <div className="comment-actions">
          {user && (
            <button onClick={() => setShowReplyBox((s) => !s)} className="comment-action-btn">
              Reply
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(comment.id)} className="comment-action-btn comment-delete">
              Delete
            </button>
          )}
        </div>

        {showReplyBox && (
          <div className="comment-reply-box">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.author_name}...`}
              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
            />
            <button onClick={handleReplySubmit}>Post</button>
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postAuthorId={postAuthorId}
                onReply={onReply}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;