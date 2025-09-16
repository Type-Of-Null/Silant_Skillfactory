const ModalBase = ({ open, title, onClose, footer, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold text-[#163E6C]">{title}</h3>
          <button
            type="button"
            className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-3">{children}</div>
        <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default ModalBase;