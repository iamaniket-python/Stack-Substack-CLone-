import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../features/posts/postSlice';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import '../styles/feed.css';

const Home = () => {
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const { feed, feedStatus } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchFeed(page));
  }, [dispatch, page]);

  if (feedStatus === 'loading' && feed.length === 0) {
    return <div className="feed-loading">Loading posts...</div>;
  }

  return (
    <div className="feed-page">
      <h1>Latest Posts</h1>

      {feed.length === 0 ? (
        <p className="feed-empty">No posts yet.</p>
      ) : (
        <div className="feed-grid">
          {feed.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        hasMore={feed.length === 10} // matches backend default limit
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
      />
    </div>
  );
};

export default Home;