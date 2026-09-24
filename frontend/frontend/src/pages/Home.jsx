import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed } from '../features/posts/postSlice';
import PostCard from '../components/PostCard';
import '../styles/feed.css';

const Home = () => {
  const dispatch = useDispatch();
  const { feed, feedStatus } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchFeed(1));
  }, [dispatch]);

  if (feedStatus === 'loading' && feed.length === 0) {
    return <div className="feed-loading">Loading posts...</div>;
  }

  return (
    <div className="feed-page">
      {feed.length === 0 ? (
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