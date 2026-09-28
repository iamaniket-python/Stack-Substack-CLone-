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

// Is depth ke baad replies aur andar indent nahi hote (mobile par jagah bachti hai)
const MAX_INDENT_DEPTH = 2;

const CommentItem = ({ comment, postAuthorId, onReply, onDelete, depth = 0 }) => {
  const { user } = useSelector((state) => state.auth);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

  const canDelete = user && (user.id === comment.user_id || user.id === postAuthorId);
  const initial = comment.author_name?.[0]?.toUpperCase() || '?';
  const showImage = Boolean(comment.author_avatar) && !imgFailed;

  const handleReplySubmit = () => {
    const text = replyText.trim();
    if (!text) return;
    onReply(comment.id, text);
    setReplyText('');
    setShowReplyBox(false);
  };

  const avatar = showImage ? (
    <img
      src={comment.author_avatar}
      alt={comment.author_name || ''}
      className="comment-avatar"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
    />
  ) : (
    <span className="comment-avatar comment-avatar--fallback" aria-hidden="true">
      {initial}
    </span>
  );

  return (
    <div className="comment-item">
      <Link to={`/author/${comment.user_id}`} className="comment-avatar-link">
        {avatar}
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
          {user ? (
            <button
              type="button"
              onClick={() => setShowReplyBox((s) => !s)}
              className="comment-action-btn"
            >
              {showReplyBox ? 'Cancel' : 'Reply'}
            </button>
          ) : (
            <Link to="/login" className="comment-action-btn">
              Reply
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="comment-action-btn comment-delete"
            >
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
              maxLength={1000}
              autoFocus
            />
            <button type="button" onClick={handleReplySubmit} disabled={!replyText.trim()}>
              Post
            </button>
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div
            className={`comment-replies ${
              depth >= MAX_INDENT_DEPTH ? 'comment-replies--flat' : ''
            }`}
          >
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