import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
// const uploadToCloudinary = require('../utils/uploadToCloudinary');
import {
  createPostAPI,
  updatePostAPI,
  uploadCoverImageAPI,
  getMyPostsAPI,
} from '../features/posts/postAPI';
import '../styles/writePost.css';

const WritePost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    const loadPost = async () => {
      try {
        const { data } = await getMyPostsAPI();
        const post = data.data.posts.find((p) => p.id === id);

        if (!post) {
          toast.error('Post not found');
          navigate('/dashboard');
          return;
        }

        setTitle(post.title);
        setExcerpt(post.excerpt || '');
        setContent(post.content);
        setIsPaid(post.is_paid);
        setExistingCoverUrl(post.cover_image_url);
      } catch (err) {
        toast.error('Failed to load post');
        navigate('/dashboard');
      } finally {
        setLoadingPost(false);
      }
    };

    loadPost();
  }, [id, isEditMode, navigate]);

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, or WEBP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadCoverIfNeeded = async () => {
    if (!coverFile) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', coverFile);
      const { data } = await uploadCoverImageAPI(formData);
      return data.data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const savePost = async (status) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const newCoverUrl = await uploadCoverIfNeeded();

      const payload = {
        title,
        excerpt,
        content,
        isPaid,
        status,
        ...(newCoverUrl && { coverImageUrl: newCoverUrl }),
      };

      if (isEditMode) {
        const { data } = await updatePostAPI(id, payload);
        toast.success(status === 'published' ? 'Post published!' : 'Draft updated');
        navigate(`/post/${data.data.post.slug}`);
      } else {
        const { data } = await createPostAPI(payload);
        toast.success(status === 'published' ? 'Post published!' : 'Draft saved');
        navigate(`/post/${data.data.post.slug}`);
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || 'Failed to save post');
      }
    } finally {
      setSaving(false);
    }
  };

  const isBusy = uploading || saving;
  const displayedCover = coverPreview || existingCoverUrl;

  if (loadingPost) return <div className="feed-loading">Loading post...</div>;

  return (
    <div className="write-page">
      <div className="write-container">
         <input
          className="write-title-small"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        /> 

        <input
          className="write-excerpt"
          placeholder="One-line excerpt (optional, shown on the feed card)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={500}
        /> 

        <textarea
          className="write-content"
          placeholder="Write your post..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
        />

        {/* Cover image now sits below the post content, not above it */}
        <div className="write-cover-upload">
          {displayedCover ? (
            <img src={displayedCover} alt="Cover preview" className="write-cover-preview" />
          ) : (
            <div className="write-cover-placeholder">Add a cover image</div>
          )}
          <label className="write-cover-btn">
            {displayedCover ? 'Change image' : 'Upload image'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverSelect} hidden />
          </label>
        </div>

        <div className="write-footer">
          <label className="write-paid-toggle">
            <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
            <span>Paid subscribers only</span>
          </label>

          <div className="write-actions">
            <button className="write-btn-draft" onClick={() => savePost('draft')} disabled={isBusy}>
              {uploading ? 'Uploading...' : isEditMode ? 'Save as draft' : 'Save draft'}
            </button>
            <button className="write-btn-publish" onClick={() => savePost('published')} disabled={isBusy}>
              {uploading ? 'Uploading...' : saving ? 'Saving...' : isEditMode ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritePost;