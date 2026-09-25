import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { updateProfile } from '../features/auth/authSlice';
import '../styles/editProfile.css';

const EditProfileModal = ({ user, onClose }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user.avatar_url || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      // Only revoke if it's a blob URL we created — not the original remote avatar_url
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, saving]);

  const handleAvatarSelect = (e) => {
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

    setAvatarFile(file);
    setPreview((prevUrl) => {
      if (prevUrl && prevUrl.startsWith('blob:')) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(file);
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(username.trim().toLowerCase())) {
      toast.error('Username: 3-30 chars, lowercase letters/numbers/underscore only');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('username', username.trim().toLowerCase());
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated');
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !saving && onClose()}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="new-msg-header">
          <h3>Edit profile</h3>
          <button onClick={onClose} className="modal-close-btn" disabled={saving}>✕</button>
        </div>

        <label className="edit-avatar-picker">
          {preview ? (
            <img src={preview} alt="Avatar preview" className="edit-avatar-preview" />
          ) : (
            <div className="avatar-fallback">{name?.[0]?.toUpperCase() || '?'}</div>
          )}
          <span className="edit-avatar-change-label">Change photo</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarSelect} disabled={saving} hidden />
        </label>

        <label className="edit-field-label">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} disabled={saving} />
        </label>

        <label className="edit-field-label">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            maxLength={30}
            disabled={saving}
          />
        </label>

        <label className="edit-field-label">
          Bio
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} disabled={saving} rows={3} />
        </label>

        <button className="story-upload-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;