import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getItems, getMatches } from "../services/itemService.js";
import Spinner from "../components/Spinner.jsx";
import Toast from "../components/Toast.jsx";

/**
 * DashboardPage — overview with stats, quick actions, and recent items.
 * Demonstrates useState (counts, items, loading, error) and
 * useEffect (fetching items on mount).
 */
const DashboardPage = () => {
  const { user } = useAuth();

  // State for fetched data
  const [lostCount, setLostCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [recentItems, setRecentItems] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect: load dashboard data on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lostData, foundData] = await Promise.all([
          getItems({ type: "lost" }),
          getItems({ type: "found" }),
        ]);
        setLostCount(lostData.count);
        setFoundCount(foundData.count);
        // Combine and take the 6 most recent
        const combined = [...lostData.items, ...foundData.items]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);
        setRecentItems(combined);
        // Fetch AI match count (Phase 2 — requires auth; gracefully skip if fails)
        try {
          const matchData = await getMatches();
          setMatchCount(matchData.count ?? matchData.matches?.length ?? 0);
        } catch {
          // not authenticated or no matches yet — silently ignore
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const typeStyles = {
    lost: "bg-red-100 text-red-700",
    found: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening on campus today.
        </p>
      </div>

      {error && <Toast message={error} type="error" />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Lost Reports"
          value={loading ? "—" : lostCount}
          color="text-red-600"
          bg="bg-red-50"
          icon="📋"
        />
        <StatCard
          label="Found Reports"
          value={loading ? "—" : foundCount}
          color="text-emerald-600"
          bg="bg-emerald-50"
          icon="🔍"
        />
        <StatCard
          label="Total Items"
          value={loading ? "—" : lostCount + foundCount}
          color="text-indigo-600"
          bg="bg-indigo-50"
          icon="📦"
        />
        <StatCard
          label="AI Matches"
          value={loading ? "—" : matchCount}
          color="text-violet-600"
          bg="bg-violet-50"
          icon="🤖"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/dashboard/report-lost"
          className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
            📋
          </div>
          <div>
            <p className="font-semibold text-slate-900">Report Lost Item</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Describe what you lost and when.
            </p>
          </div>
        </Link>

        <Link
          to="/dashboard/report-found"
          className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
            🔍
          </div>
          <div>
            <p className="font-semibold text-slate-900">Report Found Item</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Help someone recover their item.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
          <Link
            to="/dashboard/items/lost"
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : recentItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {recentItems.map((item) => (
              <Link
                key={item._id}
                to={`/dashboard/items/${item._id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 capitalize ${
                    typeStyles[item.type]
                  }`}
                >
                  {item.type}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {item.location} •{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {item.category}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, bg, icon }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5">
    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center text-xl mb-3`}>
      {icon}
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
  </div>
);

const EmptyState = () => (
  <div className="bg-white border border-slate-200 rounded-xl py-14 text-center">
    <p className="text-4xl mb-3">📭</p>
    <p className="text-sm font-medium text-slate-600">No items reported yet</p>
    <p className="text-xs text-slate-400 mt-1">
      Be the first — report a lost or found item.
    </p>
  </div>
);

export default DashboardPage;
