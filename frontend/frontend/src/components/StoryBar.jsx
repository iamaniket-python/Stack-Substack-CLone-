import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getStoryFeedAPI } from '../features/stories/storyAPI';
import StoryUploadModal from './StoryUploadModal';
import StoryViewer from './StoryViewer';
import '../styles/stories.css';

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

  const ownGroup = authorGroups.find((g) => g.authorId === user.id);
  const otherGroups = authorGroups.filter((g) => g.authorId !== user.id);

  return (
    <div className="story-bar">
      {/* "Your story" — always shown first, with a + to add */}
      <div className="story-avatar-wrap">
        <div
          className="story-avatar-ring no-stories"
          onClick={() => (ownGroup ? setViewerIndex(authorGroups.indexOf(ownGroup)) : setShowUpload(true))}
        >
          <img src={user.avatar_url} alt="You" />
          <span className="story-add-btn" onClick={(e) => { e.stopPropagation(); setShowUpload(true); }}>
            +
          </span>
        </div>
        <span className="story-avatar-label">Your story</span>
      </div>

      {otherGroups.map((group) => (
        <div key={group.authorId} className="story-avatar-wrap">
          <div className="story-avatar-ring" onClick={() => setViewerIndex(authorGroups.indexOf(group))}>
            <img src={group.authorAvatar} alt={group.authorName} />
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
            loadStories(); // refresh in case a story was deleted
          }}
        />
      )}
    </div>
  );
};

export default StoryBar;