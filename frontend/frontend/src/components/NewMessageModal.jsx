import { useState } from 'react';
import { searchUsersAPI } from '../features/messages/messageAPI';

const NewMessageModal = ({ onClose, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data } = await searchUsersAPI(value);
      setResults(data.data.users);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="new-msg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="new-msg-header">
          <h3>New message</h3>
          <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        <input
          className="new-msg-search"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />

        <div className="new-msg-results">
          {searching && <p className="new-msg-empty">Searching...</p>}
          {!searching && query && results.length === 0 && (
            <p className="new-msg-empty">No users found</p>
          )}
          {results.map((u) => (
            <div key={u.id} className="new-msg-user" onClick={() => onSelectUser(u.id)}>
              <img src={u.avatar_url} alt={u.name} />
              <div>
                <span className="new-msg-user-name">{u.name}</span>
                {u.bio && <span className="new-msg-user-bio">{u.bio}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;