import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createPostAPI,
  updatePostAPI,
  uploadCoverImageAPI,
  getMyPostsAPI,
} from '../features/posts/postAPI';
import '../styles/writePost.css';

// Backend limit se match karna: postController dekh ke adjust karenge
const MIN_PUBLISH_LENGTH = 20;
const MAX_CONTENT_LENGTH = 20000;

// Title column backend mein required hai (slug bhi isi se banta hai),
// isliye content ke pehle ~60 characters se ek short title auto-generate
// karte hain — user ko alag se title type nahi karna padta
const generateTitleFromContent = (text) => {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return 'Untitled post';
  return clean.length > 60 ? `${clean.slice(0, 60)}...` : clean;
};

const validateContent = (text, status) => {
  const trimmed = text.trim();
  if (!trimmed) return 'Kuch likho toh sahi, post khali nahi ho sakti.';
  if (text.length > MAX_CONTENT_LENGTH) {
    return `Post bahut lambi hai (max ${MAX_CONTENT_LENGTH} characters).`;
  }
  if (status === 'published' && trimmed.length < MIN_PUBLISH_LENGTH) {
    return `Publish karne ke liye kam se kam ${MIN_PUBLISH_LENGTH} characters likho. Abhi ${trimmed.length} hain.`;
  }
  return '';
};

const WritePost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');
  const [coverError, setCoverError] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  const contentRef = useRef(null);
  // State async update hota hai, isliye tez double-tap ke liye ref guard
  const submittingRef = useRef(false);

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

  // Preview URL memory leak se bachne ke liye revoke
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (contentError) setContentError('');
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setCoverError('Sirf JPEG, PNG ya WEBP image allowed hai.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverError('Image 5MB se chhoti honi chahiye.');
      e.target.value = '';
      return;
    }

    setCoverError('');
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
    if (submittingRef.current) return;

    const error = validateContent(content, status);
    if (error) {
      setContentError(error);
      contentRef.current?.focus();
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    try {
      const newCoverUrl = await uploadCoverIfNeeded();
      const title = generateTitleFromContent(content);

      const payload = {
        title,
        excerpt: '',
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
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const isBusy = uploading || saving;
  const displayedCover = coverPreview || existingCoverUrl;
  const overLimit = content.length > MAX_CONTENT_LENGTH;
  const showCounter = content.length > MAX_CONTENT_LENGTH * 0.8;

  if (loadingPost) return <div className="feed-loading">Loading post...</div>;

  return (
    <div className="write-page">
      <div className="write-container">
        <label htmlFor="write-content" className="write-sr-only">
          Post content
        </label>
        <textarea
          id="write-content"
          ref={contentRef}
          className={`write-content${contentError ? ' write-content--invalid' : ''}`}
          placeholder="Kya soch rahe ho?"
          value={content}
          onChange={handleContentChange}
          rows={10}
          aria-invalid={contentError ? 'true' : 'false'}
          aria-describedby={contentError ? 'write-content-error' : undefined}
        />

        <div className="write-meta-row">
          {contentError ? (
            <p id="write-content-error" className="write-error" role="alert">
              {contentError}
            </p>
          ) : (
            <span />
          )}
          {showCounter && (
            <span
              className={`write-counter${overLimit ? ' write-counter--over' : ''}`}
              aria-live="polite"
            >
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          )}
        </div>

        <div className="write-cover-upload">
          {displayedCover ? (
            <img
              src={displayedCover}
              alt="Is post ki cover image ka preview"
              className="write-cover-preview"
            />
          ) : (
            <div className="write-cover-placeholder">Add a cover image</div>
          )}
          <label className="write-cover-btn">
            {displayedCover ? 'Change image' : 'Upload image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverSelect}
              aria-describedby={coverError ? 'write-cover-error' : undefined}
              hidden
            />
          </label>
          {coverError && (
            <p id="write-cover-error" className="write-error" role="alert">
              {coverError}
            </p>
          )}
        </div>

        <div className="write-footer">
          <label className="write-paid-toggle">
            <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
            <span>Paid subscribers only</span>
          </label>

          <div className="write-actions">
            <button
              type="button"
              className="write-btn-draft"
              onClick={() => savePost('draft')}
              disabled={isBusy}
            >
              {uploading ? 'Uploading...' : isEditMode ? 'Save as draft' : 'Save draft'}
            </button>
            <button
              type="button"
              className="write-btn-publish"
              onClick={() => savePost('published')}
              disabled={isBusy}
            >
              {uploading ? 'Uploading...' : saving ? 'Saving...' : isEditMode ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritePost;