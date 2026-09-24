import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getLikeStatusAPI, toggleLikeAPI } from '../features/likes/likeAPI';

const LikeButton = ({ postId }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getLikeStatusAPI(postId).then(({ data }) => {
      setLiked(data.data.liked);
      setCount(data.data.count);
    });
  }, [postId]);

  const handleToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (busy) return;

    setBusy(true);
    // Optimistic update — flips instantly, corrects itself if the request fails
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const { data } = await toggleLikeAPI(postId);
      setLiked(data.data.liked);
      setCount(data.data.count);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleToggle} disabled={busy}>
      <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  );
};

export default LikeButton;