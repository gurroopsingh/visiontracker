import { useState, useEffect } from "react";
import { getItems } from "../services/itemService.js";
import ItemCard from "../components/ItemCard.jsx";
import Spinner from "../components/Spinner.jsx";
import Toast from "../components/Toast.jsx";

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Books & Stationery",
  "Accessories",
  "ID & Cards",
  "Bags & Luggage",
  "Keys",
  "Sports Equipment",
  "Other",
];

/**
 * ItemsListPage — reusable for both Lost and Found feeds.
 * Props:
 *   type: "lost" | "found"
 *
 * Demonstrates:
 *   - useState for search, category, loading, error, items
 *   - useEffect to fetch on mount and when filters change
 */
const ItemsListPage = ({ type }) => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch items whenever type, category changes (search is debounced below)
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");
      try {
        const filters = { type };
        if (category !== "All") filters.category = category;
        if (search.trim()) filters.search = search.trim();
        const data = await getItems(filters);
        setItems(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input by 400ms to avoid hammering the API
    const timer = setTimeout(fetchItems, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [type, category, search]);

  const isLost = type === "lost";
  const accentClass = isLost ? "bg-red-600" : "bg-emerald-600";
  const badgeClass = isLost
    ? "bg-red-50 text-red-700"
    : "bg-emerald-50 text-emerald-700";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isLost ? "Lost Items" : "Found Items"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isLost
              ? "Browse items reported lost on campus."
              : "Browse items found and turned in on campus."}
          </p>
        </div>
        <span
          className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
        >
          {loading ? "…" : items.length} results
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
          <input
            id={`${type}-search`}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          />
        </div>

        {/* Category filter */}
        <select
          id={`${type}-category`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {error && <Toast message={error} type="error" />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label={`Loading ${type} items…`} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-16 text-center">
          <p className="text-5xl mb-4">{isLost ? "😔" : "🔍"}</p>
          <p className="font-semibold text-slate-700">No {type} items found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search || category !== "All"
              ? "Try adjusting your filters."
              : `No ${type} items have been reported yet.`}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsListPage;
