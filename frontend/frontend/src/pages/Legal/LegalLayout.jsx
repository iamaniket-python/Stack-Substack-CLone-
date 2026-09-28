import { useEffect } from 'react';
import { BUSINESS_NAME, LAST_UPDATED } from '../../config/legal';
import '../../styles/legal.css';

// Teeno legal pages ka shared wrapper.
const LegalLayout = ({ title, children }) => {
  useEffect(() => {
    // Footer se aane par page neeche se na khule, isliye top par scroll
    window.scrollTo(0, 0);

    const previousTitle = document.title;
    document.title = `${title} – ${BUSINESS_NAME}`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <main className="legal-page">
      <article className="legal-card">
        <h1 className="legal-title">{title}</h1>
        <p className="legal-updated">Last updated: {LAST_UPDATED}</p>
        {children}
      </article>
    </main>
  );
};

export default LegalLayout;