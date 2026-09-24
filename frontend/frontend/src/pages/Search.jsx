import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchPostsAPI } from '../features/posts/postAPI';
import { searchUsersAPI } from '../features/messages/messageAPI';
import PostCard from '../components/PostCard';
import '../styles/search.css';

const HISTORY_KEY = 'substack_search_history';
const MAX_HISTORY = 10;

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
};

const saveHistory = (history) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [input, setInput] = useState(initialQuery);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('idle');
  const [history, setHistory] = useState(loadHistory());
  const debounceRef = useRef(null);

  const addToHistory = (query) => {
    if (!query.trim()) return;
    setHistory((prev) => {
      const next = [query, ...prev.filter((h) => h.toLowerCase() !== query.toLowerCase())].slice(
        0,
        MAX_HISTORY
      );
      saveHistory(next);
      return next;
    });
  };

  const runSearch = useCallback(async (query, { recordHistory = false } = {}) => {
    if (!query.trim()) {
      setPosts([]);
      setUsers([]);
      setTotal(0);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    try {
      const [postsRes, usersRes] = await Promise.all([
        searchPostsAPI(query),
        searchUsersAPI(query),
      ]);
      setPosts(postsRes.data.data.posts);
      setTotal(postsRes.data.data.total);
      setUsers(usersRes.data.data.users);
      setStatus('succeeded');
      if (recordHistory) addToHistory(query);
    } catch {
      setStatus('failed');
    }
  }, []);

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery, { recordHistory: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (value) => {
    setInput(value);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(value ? { q: value } : {});
      runSearch(value, { recordHistory: true });
    }, 400);
  };

  const handleHistoryClick = (query) => {
    setInput(query);
    setSearchParams({ q: query });
    runSearch(query, { recordHistory: true });
  };

  const handleClearAll = () => {
    setHistory([]);
    saveHistory([]);
  };

  const handleRemoveOne = (e, query) => {
    e.stopPropagation();
    const next = history.filter((h) => h !== query);
    setHistory(next);
    saveHistory(next);
  };

  return (
    <div className="search-page">
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search posts or people..."
        />
      </div>

      {/* History always shown when there's something to show, regardless of search state */}
      {history.length > 0 && (
        <div className="search-history">
          <div className="search-history-header">
            <span>Recent searches</span>
            <button onClick={handleClearAll} className="search-clear-all">
              Clear all
            </button>
          </div>
          <div className="search-history-chips">
            {history.map((h) => (
              <div key={h} className="search-history-chip" onClick={() => handleHistoryClick(h)}>
                <span>{h}</span>
                <button onClick={(e) => handleRemoveOne(e, h)} className="search-chip-remove">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'idle' && history.length === 0 && (
        <p className="search-hint">Start typing to search across posts and people</p>
      )}

      {status === 'loading' && <p className="search-hint">Searching...</p>}

      {status === 'failed' && <p className="search-hint">Something went wrong — try again</p>}

      {status === 'succeeded' && (
        <>
          {users.length > 0 && (
            <div className="search-users-section">
              <h3 className="search-section-title">People</h3>
              <div className="search-user-list">
                {users.map((u) => (
                  <Link key={u.id} to={`/author/${u.id}`} className="search-user-card">
                    <img src={u.avatar_url} alt={u.name} />
                    <div>
                      <span className="search-user-name">{u.name}</span>
                      {u.bio && <span className="search-user-bio">{u.bio}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="search-posts-section">
            <h3 className="search-section-title">
              Posts {total > 0 && `(${total})`}
            </h3>

            {posts.length === 0 ? (
              <p className="search-hint">No posts matched your search</p>
            ) : (
              <div className="feed-masonry">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {users.length === 0 && posts.length === 0 && (
            <p className="search-hint">No results for "{input}"</p>
          )}
        </>
      )}
    </div>
  );
};

export default Search;