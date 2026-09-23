import { Link } from 'react-router-dom';

const DashboardPostRow = ({ post, onDelete }) => {
  const formattedDate = new Date(post.updated_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="dash-row">
      <div className="dash-row-main">
        <span className={`dash-status dash-status-${post.status}`}>{post.status}</span>
        {post.is_paid && <span className="dash-paid-tag">Paid</span>}
        <h3>{post.title}</h3>
        <span className="dash-row-date">Updated {formattedDate}</span>
      </div>

      <div className="dash-row-actions">
        {post.status === 'published' && (
          <Link to={`/post/${post.slug}`} className="dash-action-link">
            View
          </Link>
        )}
        <Link to={`/write/${post.id}`} className="dash-action-link">
          Edit
        </Link>
        <button onClick={() => onDelete(post.id)} className="dash-action-delete">
          Delete
        </button>
      </div>
    </div>
  );
};

export default DashboardPostRow;