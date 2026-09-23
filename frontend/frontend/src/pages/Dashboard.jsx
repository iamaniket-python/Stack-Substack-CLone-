import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyPostsAPI, deletePostAPI } from '../features/posts/postAPI';
import { getMySubscribersAPI } from '../features/subscriptions/subscriptionAPI';
import DashboardPostRow from '../components/DashboardPostRow';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | draft | published

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsRes, subsRes] = await Promise.all([getMyPostsAPI(), getMySubscribersAPI()]);
      setPosts(postsRes.data.data.posts);
      setSubscriberCount(subsRes.data.data.count);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    const prevPosts = posts;
    setPosts(posts.filter((p) => p.id !== id)); // optimistic update

    try {
      await deletePostAPI(id);
      toast.success('Post deleted');
    } catch (err) {
      setPosts(prevPosts); // revert on failure
      toast.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter((p) => filter === 'all' || p.status === filter);
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  if (loading) return <div className="feed-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/write" className="dash-new-btn">
          + New post
        </Link>
      </div>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <span className="dash-stat-value">{publishedCount}</span>
          <span className="dash-stat-label">Published</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{draftCount}</span>
          <span className="dash-stat-label">Drafts</span>
        </div>
        <div className="dash-stat-card">
          <span className="dash-stat-value">{subscriberCount}</span>
          <span className="dash-stat-label">Subscribers</span>
        </div>
      </div>

      <div className="dash-filters">
        {['all', 'published', 'draft'].map((f) => (
          <button
            key={f}
            className={`dash-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <p className="feed-empty">No posts here yet.</p>
      ) : (
        <div className="dash-list">
          {filteredPosts.map((post) => (
            <DashboardPostRow key={post.id} post={post} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;