import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Share2 } from 'lucide-react';
import { fetchPostBySlug, clearCurrentPost } from '../features/posts/postSlice';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import '../styles/postDetail.css';

const getReadingTime = (text) => {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const PostDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { current: post, currentLocked, currentStatus } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  const [coverFailed, setCoverFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setCoverFailed(false);
    setAvatarFailed(false);
    dispatch(fetchPostBySlug(slug));
    return () => dispatch(clearCurrentPost());
  }, [dispatch, slug]);

  useEffect(() => {
    if (post?.title) document.title = post.title;
    return () => {
      document.title = 'Stack';
    };
  }, [post?.title]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copy ho gaya');
      }
    } catch (err) {
      // user ne share sheet band kar di to error mat dikhao
      if (err?.name !== 'AbortError') toast.error('Share nahi ho paya');
    }
  };

  // 'idle' (pehla render) ko bhi loading maano, warna "not found" ek pal dikhta hai
  if (currentStatus === 'loading' || currentStatus === 'idle') {
    return (
      <div className="post-detail post-detail-skeleton" aria-busy="true">
        <div className="skeleton-block skeleton-cover" />
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-meta" />
        <div className="skeleton-block skeleton-line" />
        <div className="skeleton-block skeleton-line" />
        <div className="skeleton-block skeleton-line short" />
      </div>
    );
  }

  if (currentStatus === 'failed' || !post) {
    return (
      <div className="post-detail-error">
        <h2>Post nahi mili</h2>
        <p>Ye post hata di gayi hai ya link galat hai.</p>
        <Link to="/" className="paywall-cta">Home par jao</Link>
      </div>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const initial = post.author_name?.[0]?.toUpperCase() || '?';
  const showAvatar = Boolean(post.author_avatar) && !avatarFailed;
  const paragraphs = (post.content || '').split(/\n{2,}/).filter((p) => p.trim());

  return (
    <article className="post-detail">
      {post.cover_image_url && !coverFailed && (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="post-detail-cover"
          onError={() => setCoverFailed(true)}
        />
      )}

      <h1>{post.title}</h1>

      <div className="post-detail-meta">
        <Link to={`/author/${post.author_id}`} className="post-detail-author">
          {showAvatar ? (
            <img
              src={post.author_avatar}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className="post-detail-avatar-fallback" aria-hidden="true">{initial}</span>
          )}
          <span>{post.author_name}</span>
        </Link>
        {formattedDate && (
          <>
            <span className="post-card-dot">·</span>
            <span>{formattedDate}</span>
          </>
        )}
        {!currentLocked && (
          <>
            <span className="post-card-dot">·</span>
            <span>{getReadingTime(post.content)} min read</span>
          </>
        )}
        {post.is_paid && <span className="post-detail-paid-badge">Paid</span>}

        <button
          type="button"
          className="post-detail-share"
          onClick={handleShare}
          aria-label="Share post"
        >
          <Share2 size={16} />
        </button>
      </div>

      {currentLocked ? (
        <div className="paywall">
          <h2>This post is for paid subscribers</h2>
          <p>Subscribe to {post.author_name} to read the full post.</p>
          {user ? (
            <Link to={`/author/${post.author_id}`} className="paywall-cta">
              Subscribe
            </Link>
          ) : (
            <Link to="/login" state={{ from: location }} className="paywall-cta">
              Log in to subscribe
            </Link>
          )}
        </div>
      ) : (
        <div className="post-detail-content">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {!currentLocked && (
        <>
          <LikeButton postId={post.id} />
          <CommentSection postId={post.id} postAuthorId={post.author_id} />
        </>
      )}
    </article>
  );
};

export default PostDetail;