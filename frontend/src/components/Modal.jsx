const Modal = ({ open, title, children, onClose, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:text-slate-100">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="rounded border px-2 py-1 text-sm dark:border-slate-700" onClick={onClose}>
            Close
          </button>
        </div>
        <div>{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
