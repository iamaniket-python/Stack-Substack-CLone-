import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Heart, MessageCircle } from "lucide-react";
// import api from "../api/axios";
import "../styles/feed.css";

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min pehle`;
  if (s < 86400) return `${Math.floor(s / 3600)} ghante pehle`;
  return `${Math.floor(s / 86400)} din pehle`;
};

// ASSUMED endpoints: /posts/:id/like (POST = like, DELETE = unlike).
// Tumhare likes wale step mein alag ho to sirf yahi function badalna.
const sendLike = (postId, wasLiked) =>
  wasLiked
    ? api.delete(`/posts/${postId}/like`)
    : api.post(`/posts/${postId}/like`);

const PostCard = ({ post }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [subscribed, setSubscribed] = useState(!!post.is_subscribed);
  const [busy, setBusy] = useState(false);

  // Like state (feed API se is_liked / like_count aane chahiye)
  const [liked, setLiked] = useState(Boolean(post.is_liked));
  const [likeCount, setLikeCount] = useState(Number(post.like_count) || 0);
  const [liking, setLiking] = useState(false);

  // Guard: guest (user null) par undefined === undefined true na ho jaye
  const isOwnPost = Boolean(user?.id) && user.id === post.author_id;

  const toggleSubscribe = async () => {
    if (busy) return;
    const prev = subscribed;
    setSubscribed(!prev); // optimistic update
    setBusy(true);
    try {
      if (prev) await api.delete(`/subscriptions/${post.author_id}`);
      else await api.post(`/subscriptions/${post.author_id}`);
    } catch {
      setSubscribed(prev); // fail hua to rollback
      toast.error("Subscribe nahi ho paya, dobara try karo");
    } finally {
      setBusy(false);
    }
  };

  const handleLike = async () => {
    if (!user) return navigate("/login"); // guest ko login par bhejo
    if (liking) return; // double click guard

    const prev = { liked, likeCount };
    setLiking(true);
    // optimistic update: turant UI badlo, fail ho to wapas
    setLiked(!prev.liked);
    setLikeCount(Math.max(0, prev.likeCount + (prev.liked ? -1 : 1)));

    try {
      const res = await sendLike(post.id, prev.liked);
      // Agar backend liked/like_count wapas deta hai to server ki value maan lo
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

  const initial = post.author_name?.[0]?.toUpperCase() || "?";
  const hasAuthorId = Boolean(post.author_id);

  // excerpt na aaye to content ka shuru; paid post par sirf 120 char teaser
  const excerptText =
    post.excerpt || (post.content ? post.content.slice(0, post.is_paid ? 120 : 280) : "");

  const avatar = post.author_avatar ? (
    <img src={post.author_avatar} alt="" className="post-card-author-avatar" />
  ) : (
    // avatar null ho to broken image ki jagah initial dikhao
    <span className="post-card-author-avatar post-card-author-avatar--fallback">
      {initial}
    </span>
  );

  return (
    // <article>, <Link> nahi: button ko <a> ke andar rakhna invalid HTML hai
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

            {/* Apni post par Subscribe nahi; guest ko login par bhejo */}
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

      {/* Cover + content clickable, post detail kholta hai */}
      <Link to={`/post/${post.slug}`} className="post-card-link">
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            className="post-card-image"
            loading="lazy"
          />
        )}

        <div className="post-card-body">
          {post.is_paid && <span className="post-card-paid-badge">Paid</span>}
          {excerptText && <p className="post-card-excerpt">{excerptText}</p>}
        </div>
      </Link>

      {/* Footer Link ke BAHAR hai: button ke click par post page nahi khulna chahiye */}
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

        <Link
          to={`/post/${post.slug}#comments`}
          className="post-card-action"
          aria-label="Comments"
        >
          <MessageCircle />
          <span>{Number(post.comment_count) || 0}</span>
        </Link>
      </div>
    </article>
  );
};

export default PostCard;