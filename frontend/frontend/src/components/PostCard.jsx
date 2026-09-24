import { Link } from 'react-router-dom';
import '../styles/feed.css';

const PostCard = ({ post }) => {
  return (
    <Link to={`/post/${post.slug}`} className="post-card">
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt="" className="post-card-image" loading="lazy" />
      )}

      <div className="post-card-body">
        {post.is_paid && <span className="post-card-paid-badge">Paid</span>}

        {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}

        <div className="post-card-meta">
          <img src={post.author_avatar} alt="" className="post-card-author-avatar" />
          <span>{post.author_name}</span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;