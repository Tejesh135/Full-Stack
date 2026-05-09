import Modal from "./Modal";

const ConfirmDialog = ({ open, title, description, onCancel, onConfirm }) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    footer={
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded border px-4 py-2 text-sm dark:border-slate-700">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className="rounded bg-red-600 px-4 py-2 text-sm text-white">
          Confirm
        </button>
      </div>
    }
  >
    <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
  </Modal>
);

export default ConfirmDialog;
