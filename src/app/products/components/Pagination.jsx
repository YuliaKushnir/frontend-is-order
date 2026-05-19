const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <button className="page-button" onClick={() => onPageChange(currentPage - 1)}>
        ←
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <div
          key={i}
          className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
          onClick={() => onPageChange(i + 1)} >
          {i + 1}
        </div>
      ))}

      <button className="page-button" onClick={() => onPageChange(currentPage + 1)}>
        →
      </button>
    </div>
  );
};

export default Pagination;