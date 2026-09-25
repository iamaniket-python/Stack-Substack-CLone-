import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getStoryFeedAPI } from '../features/stories/storyAPI';
import StoryUploadModal from './StoryUploadModal';
import StoryViewer from './StoryViewer';
import '../styles/stories.css';

// Falls back to an initials avatar when no image URL is set
const StoryAvatar = ({ src, name, alt }) => {
  if (src) return <img src={src} alt={alt} />;
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';
  return <div className="avatar-fallback">{initial}</div>;
};

const StoryBar = () => {
  const { user } = useSelector((state) => state.auth);
  const [authorGroups, setAuthorGroups] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(null);

  const loadStories = async () => {
    try {
      const { data } = await getStoryFeedAPI();
      setAuthorGroups(data.data.authors);
    } catch {
      // silent — story bar just won't render if this fails
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Guest users (user === null) have no "own story" slot — just show everyone else's
  const ownGroup = user ? authorGroups.find((g) => g.authorId === user.id) : null;
  const otherGroups = user
    ? authorGroups.filter((g) => g.authorId !== user.id)
    : authorGroups;

  // Nothing to show for a guest with zero active stories — bar would just be empty
  if (!user && otherGroups.length === 0) return null;

  const userDisplayName = user?.name || user?.full_name || user?.username || 'You';

  return (
    <div className="story-bar">
      {/* "Your story" slot only makes sense for a logged-in user */}
      {user && (
        <div className="story-avatar-wrap">
          <div
            className="story-avatar-ring no-stories"
            onClick={() => (ownGroup ? setViewerIndex(authorGroups.indexOf(ownGroup)) : setShowUpload(true))}
          >
            <StoryAvatar src={user.avatar_url} name={userDisplayName} alt="You" />
            <span className="story-add-btn" onClick={(e) => { e.stopPropagation(); setShowUpload(true); }}>
              +
            </span>
          </div>
          <span className="story-avatar-label">Your story</span>
        </div>
      )}

      {otherGroups.map((group) => (
        <div key={group.authorId} className="story-avatar-wrap">
          <div className="story-avatar-ring" onClick={() => setViewerIndex(authorGroups.indexOf(group))}>
            <StoryAvatar src={group.authorAvatar} name={group.authorName} alt={group.authorName} />
          </div>
          <span className="story-avatar-label">{group.authorName}</span>
        </div>
      ))}

      {showUpload && (
        <StoryUploadModal onClose={() => setShowUpload(false)} onUploaded={loadStories} />
      )}

      {viewerIndex !== null && (
        <StoryViewer
          authorGroups={authorGroups}
          startAuthorIndex={viewerIndex}
          onClose={() => {
            setViewerIndex(null);
            loadStories();
          }}
        />
      )}
    </div>
  );
};

export default StoryBar;