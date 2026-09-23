const Pagination = ({ page, hasMore, onPrev, onNext }) => (
  <div className="pagination">
    <button onClick={onPrev} disabled={page <= 1}>
      Previous
    </button>
    <span>Page {page}</span>
    <button onClick={onNext} disabled={!hasMore}>
      Next
    </button>
  </div>
);

export default Pagination;