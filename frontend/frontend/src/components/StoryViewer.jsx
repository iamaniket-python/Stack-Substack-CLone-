import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { viewStoryAPI, deleteStoryAPI } from '../features/stories/storyAPI';

const STORY_DURATION = 5000; // ms per story

const StoryViewer = ({ authorGroups, startAuthorIndex, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [authorIndex, setAuthorIndex] = useState(startAuthorIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewCount, setViewCount] = useState(null);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  const currentAuthor = authorGroups[authorIndex];
  const currentStory = currentAuthor?.stories[storyIndex];
  const isOwnStory = currentStory?.author_id === user.id;

  // Mark as viewed + fetch view count (only meaningful if it's your own story)
  useEffect(() => {
    if (!currentStory) return;
    viewStoryAPI(currentStory.id)
      .then(({ data }) => setViewCount(data.data.viewCount))
      .catch(() => {});
  }, [currentStory]);

  const goNext = () => {
    if (storyIndex < currentAuthor.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (authorIndex < authorGroups.length - 1) {
      setAuthorIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
    setProgress(0);
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (authorIndex > 0) {
      setAuthorIndex((i) => i - 1);
      setStoryIndex(0);
    }
    setProgress(0);
  };

  useEffect(() => {
    if (paused) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          goNext();
          return 0;
        }
        return p + 100 / (STORY_DURATION / 50);
      });
    }, 50);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorIndex, storyIndex, paused]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await deleteStoryAPI(currentStory.id);
      toast.success('Story deleted');
      goNext();
    } catch {
      toast.error('Failed to delete story');
    }
  };

  if (!currentStory) return null;

  return (
    <div className="story-viewer-overlay">
      <div
        className="story-viewer-content"
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
      >
        <div className="story-progress-row">
          {currentAuthor.stories.map((_, idx) => (
            <div key={idx} className="story-progress-track">
              <div
                className="story-progress-fill"
                style={{
                  width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="story-viewer-header">
          <img src={currentAuthor.authorAvatar} alt="" className="story-viewer-avatar" />
          <span>{currentAuthor.authorName}</span>
          {isOwnStory && viewCount !== null && (
            <span className="story-view-count">👁 {viewCount}</span>
          )}
          <button onClick={onClose} className="story-close-btn">✕</button>
        </div>

        <img src={currentStory.media_url} alt="" className="story-viewer-image" />

        {currentStory.caption && <p className="story-viewer-caption">{currentStory.caption}</p>}

        <div className="story-nav-zones">
          <div className="story-nav-zone-left" onClick={goPrev} />
          <div className="story-nav-zone-right" onClick={goNext} />
        </div>

        {isOwnStory && (
          <button className="story-delete-btn" onClick={handleDelete}>
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;