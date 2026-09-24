import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getAuthorProfileAPI, getAuthorPostsAPI } from '../features/posts/postAPI';
import {
  subscribeAPI,
  unsubscribeAPI,
  getSubscriptionStatusAPI,
} from '../features/subscriptions/subscriptionAPI';
import { createOrderAPI, verifyPaymentAPI } from '../features/payments/paymentAPI';
import PostCard from '../components/PostCard';
import '../styles/authorProfile.css';

const AuthorProfile = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  const isOwnProfile = user?.id === id;

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        getAuthorProfileAPI(id),
        getAuthorPostsAPI(id, 1),
      ]);
      setProfile(profileRes.data.data);
      setPosts(postsRes.data.data.posts);

      if (user && !isOwnProfile) {
        const statusRes = await getSubscriptionStatusAPI(id);
        setSubscribed(statusRes.data.data.subscribed);
        setSubscription(statusRes.data.data.subscription);
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleFreeSubscribe = async () => {
    setActionBusy(true);
    try {
      await subscribeAPI(id);
      toast.success(`Subscribed to ${profile.profile.name}`);
      setSubscribed(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe');
    } finally {
      setActionBusy(false);
    }
  };

  const handleUnsubscribe = async () => {
    setActionBusy(true);
    try {
      await unsubscribeAPI(id);
      toast.success('Unsubscribed');
      setSubscribed(false);
      setSubscription(null);
    } catch (err) {
      toast.error('Failed to unsubscribe');
    } finally {
      setActionBusy(false);
    }
  };

  const handlePaidSubscribe = async () => {
    setActionBusy(true);
    try {
      const { data } = await createOrderAPI(id);
      const { orderId, amount, currency, keyId } = data.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Substack Clone',
        description: `Paid subscription to ${profile.profile.name}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await verifyPaymentAPI({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful — subscribed!');
            setSubscribed(true);
            loadProfile();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => setActionBusy(false),
        },
        theme: { color: '#5b5fef' },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
      setActionBusy(false);
    }
  };

  if (loading) return <div className="feed-loading">Loading profile...</div>;
  if (!profile) return <div className="feed-loading">Author not found.</div>;

  const { profile: info, subscriberCount, postCount } = profile;
  const isPaidSub = subscription?.tier === 'paid';

  return (
    <div className="author-profile-page">
      <div className="author-header">
        <img src={info.avatar_url} alt={info.name} className="author-avatar-lg" />
        <h1>{info.name}</h1>
        {info.bio && <p className="author-bio">{info.bio}</p>}

        <div className="author-stats">
          <span>
            <strong>{postCount}</strong> posts
          </span>
          <span className="author-stats-dot">·</span>
          <span>
            <strong>{subscriberCount}</strong> subscribers
          </span>
        </div>

        {!isOwnProfile && (
          <div className="author-subscribe-actions">
            {subscribed ? (
              <div className="author-subscribed-state">
                <span className={`sub-tier-badge ${isPaidSub ? 'paid' : 'free'}`}>
                  {isPaidSub ? 'Paid subscriber' : 'Free subscriber'}
                </span>
                <button onClick={handleUnsubscribe} disabled={actionBusy} className="author-unsub-btn">
                  Unsubscribe
                </button>
                <Link to={`/messages?user=${id}`} className="author-message-btn">
                  Message
                </Link>
              </div>
            ) : (
              <div className="author-subscribe-buttons">
                <button onClick={handleFreeSubscribe} disabled={actionBusy} className="author-free-btn">
                  Subscribe free
                </button>
                <button onClick={handlePaidSubscribe} disabled={actionBusy} className="author-paid-btn">
                  Subscribe ₹199/mo
                </button>
                <Link to={`/messages?user=${id}`} className="author-message-btn">
                  Message
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="author-posts">
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <p className="feed-empty">No published posts yet.</p>
        ) : (
          <div className="feed-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, author_name: info.name, author_avatar: info.avatar_url }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfile;