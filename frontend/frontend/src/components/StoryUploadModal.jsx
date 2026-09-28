import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { createStoryAPI } from '../features/stories/storyAPI';

const StoryUploadModal = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  // State async update hota hai, isliye tez double-tap ke liye ref guard
  const submittingRef = useRef(false);

  // Revoke the blob URL whenever it's replaced or the modal unmounts —
  // otherwise every selected image leaks memory for the tab's lifetime
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Close on Escape, same as clicking the overlay
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !uploading) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, uploading]);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      toast.error('Only JPEG, PNG, or WEBP images are allowed');
      e.target.value = '';
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      e.target.value = '';
      return;
    }

    setFile(selected);
    setPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl); // drop the old blob before creating a new one
      return URL.createObjectURL(selected);
    });
  };

  const handleUpload = async () => {
    if (submittingRef.current) return;

    if (!file) {
      toast.error('Select an image first');
      return;
    }

    submittingRef.current = true;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      if (caption.trim()) formData.append('caption', caption.trim());

      await createStoryAPI(formData);
      toast.success('Story posted — visible for 24 hours');
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post story');
    } finally {
      submittingRef.current = false;
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !uploading && onClose()}>
      <div
        className="story-upload-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-upload-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="new-msg-header">
          <h3 id="story-upload-title">Add to story</h3>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            disabled={uploading}
            aria-label="Band karo"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {preview ? (
          <img src={preview} alt="Aapki story ka preview" className="story-upload-preview" />
        ) : (
          <label className="story-upload-placeholder">
            <span>
              <span aria-hidden="true">📷</span> Choose an image
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
              hidden
            />
          </label>
        )}

        {preview && (
          <label className={`story-upload-change ${uploading ? 'disabled' : ''}`}>
            Change image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
              hidden
            />
          </label>
        )}

        <input
          className="story-caption-input"
          placeholder="Add a caption (optional)"
          aria-label="Story caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={280}
          disabled={uploading}
        />

        <button
          type="button"
          className="story-upload-btn"
          onClick={handleUpload}
          disabled={uploading || !file}
        >
          {uploading ? 'Posting...' : 'Post story'}
        </button>

        <p className="story-upload-note">Disappears automatically after 24 hours</p>
      </div>
    </div>
  );
};

export default StoryUploadModal;