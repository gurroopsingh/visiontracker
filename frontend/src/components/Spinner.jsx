/**
 * Spinner — reusable loading indicator.
 * Props:
 *   size: "sm" | "md" | "lg"  (default "md")
 *   label: string (screen-reader accessible label)
 */
const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-4",
};

const Spinner = ({ size = "md", label = "Loading…" }) => (
  <div role="status" aria-label={label} className="flex items-center justify-center">
    <div
      className={`${sizeMap[size]} rounded-full border-indigo-200 border-t-indigo-600 animate-spin`}
    />
    <span className="sr-only">{label}</span>
  </div>
);

export default Spinner;
