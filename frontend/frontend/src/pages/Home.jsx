import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../features/posts/postSlice';
import PostCard from '../components/PostCard';
import StoryBar from '../components/StoryBar';
import '../styles/feed.css';

const SkeletonCard = () => (
  <div className="feed-skeleton-card">
    <div className="feed-skeleton-header">
      <div className="feed-skeleton-avatar" />
      <div>
        <div className="feed-skeleton-line feed-skeleton-line--name" />
        <div className="feed-skeleton-line feed-skeleton-line--time" />
      </div>
    </div>
    <div className="feed-skeleton-line feed-skeleton-line--text" />
    <div className="feed-skeleton-line feed-skeleton-line--text" />
    <div className="feed-skeleton-line feed-skeleton-line--text" />
    <div className="feed-skeleton-image" />
  </div>
);

const Home = () => {
  const dispatch = useDispatch();
  const { feed, feedStatus } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  const isInitialLoading = feedStatus === 'loading' && feed.length === 0;

  return (
    <div className="feed-page">
      <StoryBar />

      {isInitialLoading ? (
        <div className="feed-skeleton-list">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : feed.length === 0 ? (
        <p className="feed-empty">No posts yet.</p>
      ) : (
        <div className="feed-masonry">
          {feed.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;