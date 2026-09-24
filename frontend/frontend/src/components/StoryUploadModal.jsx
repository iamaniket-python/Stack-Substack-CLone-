import { useState } from 'react';
import toast from 'react-hot-toast';
import { createStoryAPI } from '../features/stories/storyAPI';

const StoryUploadModal = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      toast.error('Only JPEG, PNG, or WEBP images are allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Select an image first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', file);
      if (caption.trim()) formData.append('caption', caption);

      await createStoryAPI(formData);
      toast.success('Story posted — visible for 24 hours');
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post story');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="story-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="new-msg-header">
          <h3>Add to story</h3>
          <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        {preview ? (
          <img src={preview} alt="Preview" className="story-upload-preview" />
        ) : (
          <label className="story-upload-placeholder">
            <span>📷 Choose an image</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} hidden />
          </label>
        )}

        {preview && (
          <label className="story-upload-change">
            Change image
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} hidden />
          </label>
        )}

        <input
          className="story-caption-input"
          placeholder="Add a caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={280}
        />

        <button className="story-upload-btn" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Posting...' : 'Post story'}
        </button>

        <p className="story-upload-note">Disappears automatically after 24 hours</p>
      </div>
    </div>
  );
};

export default StoryUploadModal;