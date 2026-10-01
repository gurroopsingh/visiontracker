import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyItems } from "../services/itemService.js";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import Toast from "../components/Toast.jsx";

/**
 * ProfilePage — shows user info, their lost reports, and found reports.
 *
 * Phase 2: Calls GET /api/items/my (a dedicated server-side endpoint that
 * filters by the authenticated user) instead of fetching all items and
 * filtering client-side. This is more efficient and correct.
 */
const ProfilePage = () => {
  const { user } = useAuth();

  const [myLost, setMyLost] = useState([]);
  const [myFound, setMyFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user's own items from the dedicated /api/items/my endpoint
  useEffect(() => {
    if (!user) return;

    const fetchMyItems = async () => {
      setLoading(true);
      try {
        // Two parallel requests: one for each type
        // The backend filters by req.user._id — no client-side filtering needed
        const [lostData, foundData] = await Promise.all([
          getMyItems({ type: "lost" }),
          getMyItems({ type: "found" }),
        ]);

        setMyLost(lostData.items);
        setMyFound(foundData.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyItems();
  }, [user]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900">My Profile</h1>

      {/* User Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="mt-1 inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full capitalize">
              {user?.role || "student"}
            </span>
          </div>
        </div>
      </div>

      {error && <Toast message={error} type="error" />}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Lost Reports */}
          <Section
            title="My Lost Reports"
            count={myLost.length}
            type="lost"
            items={myLost}
          />

          {/* Found Reports */}
          <Section
            title="My Found Reports"
            count={myFound.length}
            type="found"
            items={myFound}
          />
        </>
      )}
    </div>
  );
};

const Section = ({ title, count, type, items }) => {
  const isLost = type === "lost";
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isLost ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {count}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          You haven't submitted any {type} reports yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item._id}
              to={`/dashboard/items/${item._id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-slate-400 truncate">{item.location}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full shrink-0 capitalize font-medium ${
                  item.status === "active"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {item.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
