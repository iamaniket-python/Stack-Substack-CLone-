import "../styles/skeleton.css";

/**
 * Base skeleton block.
 * Usage: <Skeleton width="60%" height={14} />  |  <Skeleton circle width={40} height={40} />
 */
export const Skeleton = ({
  width,
  height,
  radius,
  circle = false,
  className = "",
  style,
}) => (
  <span
    className={`skeleton ${circle ? "skeleton--circle" : ""} ${className}`.trim()}
    style={{ width, height, borderRadius: circle ? undefined : radius, ...style }}
    aria-hidden="true"
  />
);

/**
 * Same layout as PostCard. It reuses PostCard's own classes, so the outer
 * box, header and body padding match automatically.
 */
export const PostCardSkeleton = ({ withMedia = true }) => (
  <article className="post-card post-card--skeleton" aria-hidden="true">
    <div className="post-card-header">
      <span className="skeleton skeleton--circle post-card-author-avatar" />
      <div className="post-card-author-info">
        <Skeleton width={120} height={14} />
        <Skeleton width={70} height={11} style={{ marginTop: 6 }} />
      </div>
    </div>

    <div className="post-card-body">
      <Skeleton width="100%" height={14} />
      <Skeleton width="92%" height={14} style={{ marginTop: 10 }} />
      <Skeleton width="60%" height={14} style={{ marginTop: 10 }} />
    </div>

    {withMedia && <div className="skeleton skeleton-media" />}

    <div className="post-card-footer">
      <Skeleton width={64} height={35} radius="var(--radius-full)" />
      <Skeleton width={64} height={35} radius="var(--radius-full)" />
    </div>
  </article>
);

/** Feed-shaped list of skeleton cards, announced once to screen readers. */
export const PostFeedSkeleton = ({ count = 3 }) => (
  <div className="feed-masonry" role="status" aria-live="polite" aria-busy="true">
    <span className="skeleton-sr-only">Posts load ho rahe hain…</span>
    {Array.from({ length: count }, (_, i) => (
      <PostCardSkeleton key={i} withMedia={i % 2 === 0} />
    ))}
  </div>
);

export default Skeleton;