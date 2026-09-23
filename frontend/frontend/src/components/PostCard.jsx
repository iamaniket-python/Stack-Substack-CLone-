import { Link } from 'react-router-dom';
import '../styles/feed.css';

const PostCard = ({ post }) => {
  const formattedDate = new Date(post.published_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link to={`/post/${post.slug}`} className="post-card">
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt={post.title} className="post-card-image" />
      )}
      <div className="post-card-body">
        {post.is_paid && <span className="post-card-paid-badge">Paid</span>}
        <h2>{post.title}</h2>
        {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}
        <div className="post-card-meta">
          <img src={post.author_avatar} alt={post.author_name} className="post-card-author-avatar" />
          <span>{post.author_name}</span>
          <span className="post-card-dot">·</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;