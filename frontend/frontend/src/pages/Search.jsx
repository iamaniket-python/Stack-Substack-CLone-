import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchPostsAPI } from '../features/posts/postAPI';
import PostCard from '../components/PostCard';
import '../styles/search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [input, setInput] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | loading | succeeded | failed
  const debounceRef = useRef(null);

  const runSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    try {
      const { data } = await searchPostsAPI(query);
      setResults(data.data.posts);
      setTotal(data.data.total);
      setStatus('succeeded');
    } catch {
      setStatus('failed');
    }
  }, []);

  // Run search once on mount if the URL already has a query (e.g. shared link)
  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (value) => {
    setInput(value);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(value ? { q: value } : {});
      runSearch(value);
    }, 400);
  };

  return (
    <div className="search-page">
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search posts by title or content..."
        />
      </div>

      {status === 'idle' && (
        <p className="search-hint">Start typing to search across all published posts</p>
      )}

      {status === 'loading' && <p className="search-hint">Searching...</p>}

      {status === 'failed' && <p className="search-hint">Something went wrong — try again</p>}

      {status === 'succeeded' && (
        <>
          <p className="search-result-count">
            {total} {total === 1 ? 'result' : 'results'} for "{input}"
          </p>

          {results.length === 0 ? (
            <p className="search-hint">No posts matched your search</p>
          ) : (
            <div className="feed-grid">
              {results.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;