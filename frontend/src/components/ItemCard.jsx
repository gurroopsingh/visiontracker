import { Link } from "react-router-dom";

/**
 * ItemCard — displays a lost or found item summary in a card.
 * Props:
 *   item : Item object from API
 */
const typeConfig = {
  lost: {
    badge: "bg-red-100 text-red-700",
    label: "Lost",
    dot: "bg-red-500",
  },
  found: {
    badge: "bg-emerald-100 text-emerald-700",
    label: "Found",
    dot: "bg-emerald-500",
  },
};

const statusConfig = {
  active: "bg-blue-50 text-blue-700",
  resolved: "bg-gray-100 text-gray-600",
  closed: "bg-gray-100 text-gray-500",
};

const ItemCard = ({ item }) => {
  const type = typeConfig[item.type] || typeConfig.lost;
  const statusStyle = statusConfig[item.status] || statusConfig.active;

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown date";

  return (
    <Link
      to={`/dashboard/items/${item._id}`}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${type.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${type.dot}`} />
          {type.label}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyle}`}
        >
          {item.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-slate-900 text-base mb-1 group-hover:text-indigo-700 transition-colors line-clamp-1">
        {item.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
        {item.description}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {item.location}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDate}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {item.category}
        </span>
      </div>

      {/* Reporter */}
      {item.reportedBy && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
          Reported by{" "}
          <span className="font-medium text-slate-600">
            {item.reportedBy.name}
          </span>
        </div>
      )}
    </Link>
  );
};

export default ItemCard;
