import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPostBySlug, clearCurrentPost } from '../features/posts/postSlice';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import '../styles/postDetail.css';

const PostDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { current: post, currentLocked, currentStatus } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPostBySlug(slug));
    return () => dispatch(clearCurrentPost());
  }, [dispatch, slug]);

  if (currentStatus === 'loading') return <div className="feed-loading">Loading...</div>;
  if (currentStatus === 'failed' || !post) return <div className="feed-loading">Post not found.</div>;

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="post-detail">
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt={post.title} className="post-detail-cover" />
      )}

      <h1>{post.title}</h1>

      <div className="post-detail-meta">
        <Link to={`/author/${post.author_id}`} className="post-detail-author">
          <img src={post.author_avatar} alt={post.author_name} />
          <span>{post.author_name}</span>
        </Link>
        <span className="post-card-dot">·</span>
        <span>{formattedDate}</span>
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
            <Link to="/login" className="paywall-cta">
              Log in to subscribe
            </Link>
          )}
        </div>
      ) : (
        <div className="post-detail-content">{post.content}</div>
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