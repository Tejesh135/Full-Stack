const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        className="rounded border px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Page {page} of {totalPages}
      </span>
      <button
        className="rounded border px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
