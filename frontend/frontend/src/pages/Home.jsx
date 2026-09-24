import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../features/posts/postSlice';
import PostCard from '../components/PostCard';
import StoryBar from '../components/StoryBar'; // 24h stories bar
import '../styles/feed.css';

const Home = () => {
  const dispatch = useDispatch();
  const { feed, feedStatus } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  const isInitialLoading = feedStatus === 'loading' && feed.length === 0;

  return (
    <div className="feed-page">
      {/* Masonry (CSS columns) ke BAHAR rakha hai, warna ek column mein dab jayega.
          Loading/empty state mein bhi dikhta hai, isliye conditional ke bahar hai */}
      <StoryBar />

      {isInitialLoading ? (
        <div className="feed-loading">Loading posts...</div>
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