import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import EditProfileModal from '../components/EditProfileModal';

import { getAuthorProfileAPI, getAuthorPostsAPI } from '../features/posts/postAPI';
import {
  subscribeAPI,
  unsubscribeAPI,
  getSubscriptionStatusAPI,
} from '../features/subscriptions/subscriptionAPI';
import { createOrderAPI, verifyPaymentAPI } from '../features/payments/paymentAPI';
// NEW — apne profile ke 5 tabs ka data
import {
  getMyPostsAPI,
  getMyRepliesAPI,
  getMyLikesAPI,
  getMySubscriptionsAPI,
  getMyActivityAPI,
} from '../features/profile/profileAPI';
import PostCard from '../components/PostCard';
import '../styles/authorProfile.css';

// NEW — tab config, order yahi rahega jo UI mein dikhega
const TABS = [
  { key: 'activity', label: 'Activity' },
  { key: 'posts', label: 'Posts' },
  { key: 'replies', label: 'Replies' },
  { key: 'likes', label: 'Likes' },
  { key: 'subscriptions', label: 'Subscriptions' },
];

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min pehle`;
  if (s < 86400) return `${Math.floor(s / 3600)} ghante pehle`;
  return `${Math.floor(s / 86400)} din pehle`;
};

const AuthorProfile = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const isOwnProfile = user?.id === id;

  // NEW — tabs ka apna state, alag hai profile-load state se
  const [activeTab, setActiveTab] = useState('activity');
  const [tabData, setTabData] = useState({
    activity: null,
    posts: null,
    replies: null,
    likes: null,
    subscriptions: null,
  });
  const [tabLoading, setTabLoading] = useState(false);

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

  // NEW — jab bhi apna profile ho aur tab badle, uska data lazy-load karo (ek hi baar per tab, cache rakhte hain)
  useEffect(() => {
    if (!isOwnProfile) return;
    if (tabData[activeTab] !== null) return; // already loaded, dobara mat maango

    const fetchTab = async () => {
      setTabLoading(true);
      try {
        let res;
        if (activeTab === 'activity') res = await getMyActivityAPI();
        else if (activeTab === 'posts') res = await getMyPostsAPI();
        else if (activeTab === 'replies') res = await getMyRepliesAPI();
        else if (activeTab === 'likes') res = await getMyLikesAPI();
        else if (activeTab === 'subscriptions') res = await getMySubscriptionsAPI();

        const payload = res.data.data;
        setTabData((prev) => ({ ...prev, [activeTab]: payload }));
      } catch (err) {
        toast.error('Tab data load nahi ho paya');
      } finally {
        setTabLoading(false);
      }
    };

    fetchTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isOwnProfile]);

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

  // NEW — active tab ka content render karne wala helper
  const renderTabContent = () => {
    const data = tabData[activeTab];

    if (tabLoading && data === null) {
      return <p className="feed-empty">Loading...</p>;
    }
    if (!data) return null;

    if (activeTab === 'activity') {
      if (data.activity.length === 0) return <p className="feed-empty">Koi activity nahi hai abhi.</p>;
      return (
        <div className="profile-activity-list">
          {data.activity.map((item) => (
            <Link
              key={`${item.activity_type}-${item.activity_id}`}
              to={`/post/${item.post_slug}`}
              className="profile-activity-item"
            >
              <span className="profile-activity-type">
                {/* {item.activity_type === 'post' && 'Aapne publish kiya'}
                {item.activity_type === 'comment' && 'Aapne comment kiya'}
                {item.activity_type === 'like' && 'Aapne like kiya'} */}
              </span>
              <span className="profile-activity-title">{item.post_title}</span>
              {item.snippet && <p className="profile-activity-snippet">{item.snippet}</p>}
              <span className="profile-activity-time">{timeAgo(item.occurred_at)}</span>
            </Link>
          ))}
        </div>
      );
    }

    if (activeTab === 'posts') {
      if (data.posts.length === 0) return <p className="feed-empty">Abhi koi post nahi hai.</p>;
      return (
        <div className="feed-grid">
          {data.posts.map((post) => (
            <PostCard
              key={post.id}
              post={{ ...post, author_name: info.name, author_avatar: info.avatar_url }}
            />
          ))}
        </div>
      );
    }

    if (activeTab === 'replies') {
      if (data.replies.length === 0) return <p className="feed-empty">Koi reply nahi hai abhi.</p>;
      return (
        <div className="profile-activity-list">
          {data.replies.map((reply) => (
            <Link key={reply.id} to={`/post/${reply.post_slug}`} className="profile-activity-item">
              <span className="profile-activity-title">{reply.post_title}</span>
              <p className="profile-activity-snippet">{reply.content}</p>
              <span className="profile-activity-time">{timeAgo(reply.created_at)}</span>
            </Link>
          ))}
        </div>
      );
    }

    if (activeTab === 'likes') {
      if (data.posts.length === 0) return <p className="feed-empty">Koi post like nahi ki abhi.</p>;
      return (
        <div className="feed-grid">
          {data.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      );
    }

    if (activeTab === 'subscriptions') {
      if (data.subscriptions.length === 0) return <p className="feed-empty">Kisiko subscribe nahi kiya abhi.</p>;
      return (
        <div className="profile-sub-list">
          {data.subscriptions.map((sub) => (
            <Link key={sub.subscription_id} to={`/author/${sub.author_id}`} className="profile-sub-item">
              <img
                src={sub.author_avatar}
                alt={sub.author_name}
                className="profile-sub-avatar"
              />
              <div className="profile-sub-info">
                <span className="profile-sub-name">{sub.author_name}</span>
                <span className="profile-sub-meta">
                  {sub.tier === 'paid' ? 'Paid' : 'Free'} · {sub.post_count} posts
                </span>
              </div>
            </Link>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="author-profile-page">
      <div className="author-header">
        <img src={info.avatar_url} alt={info.name} className="author-avatar-lg" />
        <h1>{info.name}</h1>
        {info.username && <p className="author-username">@{info.username}</p>}
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

        {isOwnProfile && (
          <button onClick={() => setShowEditProfile(true)} className="author-free-btn">
            Edit profile
          </button>
        )}

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

      {/* NEW — tabs sirf apne profile pe */}
      {isOwnProfile ? (
        <div className="profile-tabs-section">
          <div className="profile-tabs-bar">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`profile-tab-btn ${activeTab === tab.key ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="profile-tab-content">{renderTabContent()}</div>
        </div>
      ) : (
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
      )}

      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => {
            setShowEditProfile(false);
            loadProfile();
          }}
        />
      )}
    </div>
  );
};

export default AuthorProfile;