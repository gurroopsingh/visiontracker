/**
 * Toast — inline feedback notification.
 * Props:
 *   message : string
 *   type    : "success" | "error" | "info"  (default "info")
 *   onClose : optional dismiss handler
 */
const styles = {
  success: "bg-emerald-50 border-emerald-400 text-emerald-800",
  error: "bg-red-50 border-red-400 text-red-800",
  info: "bg-indigo-50 border-indigo-400 text-indigo-800",
};

const icons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const Toast = ({ message, type = "info", onClose }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`toast-enter flex items-start gap-3 border rounded-lg px-4 py-3 text-sm font-medium ${styles[type]}`}
    >
      <span className="shrink-0 text-base leading-5">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
