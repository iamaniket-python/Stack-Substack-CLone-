import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart, MessageCircle, X } from "lucide-react";
import axiosInstance from '../api/axiosInstance';
import CommentSection from './CommentSection';
import "../styles/feed.css";

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min pehle`;
  if (s < 86400) return `${Math.floor(s / 3600)} ghante pehle`;
  return `${Math.floor(s / 86400)} din pehle`;
};

const sendLike = (postId) => axiosInstance.post(`/likes/post/${postId}`);

const PostCard = ({ post }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [subscribed, setSubscribed] = useState(!!post.is_subscribed);
  const [busy, setBusy] = useState(false);

  const [liked, setLiked] = useState(Boolean(post.is_liked));
  const [likeCount, setLikeCount] = useState(Number(post.like_count) || 0);
  const [liking, setLiking] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(Number(post.comment_count) || 0); // NEW

  const isOwnPost = Boolean(user?.id) && user.id === post.author_id;

  const toggleSubscribe = async () => {
    if (busy) return;
    const prev = subscribed;
    setSubscribed(!prev);
    setBusy(true);
    try {
      if (prev) await axiosInstance.delete(`/subscriptions/${post.author_id}`);
      else await axiosInstance.post(`/subscriptions/${post.author_id}`);
    } catch {
      setSubscribed(prev);
      toast.error("Subscribe nahi ho paya, dobara try karo");
    } finally {
      setBusy(false);
    }
  };

  const handleLike = async () => {
    if (!user) return navigate("/login");
    if (liking) return;

    const prev = { liked, likeCount };
    setLiking(true);
    setLiked(!prev.liked);
    setLikeCount(Math.max(0, prev.likeCount + (prev.liked ? -1 : 1)));

    try {
      const res = await sendLike(post.id);
      const d = res?.data?.data;
      if (d && typeof d.liked === "boolean") setLiked(d.liked);
      if (d && d.like_count != null) setLikeCount(Number(d.like_count));
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
      toast.error("Like nahi ho paya, dobara try karo");
    } finally {
      setLiking(false);
    }
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    setLightboxOpen(true);
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    setCommentsOpen((prev) => !prev);
  };

  const initial = post.author_name?.[0]?.toUpperCase() || "?";
  const hasAuthorId = Boolean(post.author_id);

  const excerptText =
    post.excerpt || (post.content ? post.content.slice(0, post.is_paid ? 120 : 280) : "");

  const avatar = post.author_avatar ? (
    <img src={post.author_avatar} alt="" className="post-card-author-avatar" />
  ) : (
    <span className="post-card-author-avatar post-card-author-avatar--fallback">
      {initial}
    </span>
  );

  return (
    <article className="post-card">
      <div className="post-card-header">
        {hasAuthorId ? (
          <Link to={`/author/${post.author_id}`} className="post-card-avatar-link">
            {avatar}
          </Link>
        ) : (
          <span className="post-card-avatar-link">{avatar}</span>
        )}

        <div className="post-card-author-info">
          <div className="post-card-name-row">
            {hasAuthorId ? (
              <Link to={`/author/${post.author_id}`} className="post-card-author-name">
                {post.author_name}
              </Link>
            ) : (
              <span className="post-card-author-name">{post.author_name}</span>
            )}

            {!isOwnPost &&
              hasAuthorId &&
              (user ? (
                <button
                  type="button"
                  className={`post-card-sub ${subscribed ? "is-subscribed" : ""}`}
                  onClick={toggleSubscribe}
                  disabled={busy}
                >
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              ) : (
                <Link to="/login" className="post-card-sub">
                  Subscribe
                </Link>
              ))}
          </div>
          <span className="post-card-time">{timeAgo(post.published_at)}</span>
        </div>
      </div>
      <Link  className="post-card-link">
        <div className="post-card-body">
          {post.is_paid && <span className="post-card-paid-badge">Paid</span>}
          {excerptText && <p className="post-card-excerpt">{excerptText}</p>}
        </div>
      </Link>
      {post.cover_image_url && (
         <div className="post-card-media" onClick={handleImageClick}>
          <img
            src={post.cover_image_url}
            alt=""
            className="post-card-image"
            loading="lazy"
          />
        </div>
      )}

     

      <div className="post-card-footer">
        <button
          type="button"
          className={`post-card-action ${liked ? "is-liked" : ""}`}
          onClick={handleLike}
          disabled={liking}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart />
          <span>{likeCount}</span>
        </button>

        <button
          type="button"
          className={`post-card-action ${commentsOpen ? "is-active" : ""}`}
          onClick={handleCommentClick}
          aria-expanded={commentsOpen}
          aria-label="Toggle comments"
        >
          <MessageCircle />
          <span>{commentCount}</span>
        </button>
      </div>

      {commentsOpen && (
        <div className="post-card-comments">
          <CommentSection
            postId={post.id}
            postAuthorId={post.author_id}
            onCountChange={setCommentCount}
          />
        </div>
      )}

      {lightboxOpen && (
        <div className="image-lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button
            className="image-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X />
          </button>
          <img
            src={post.cover_image_url}
            alt=""
            className="image-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
};

export default PostCard;