import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getItemById, deleteItem } from "../services/itemService.js";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";
import Toast from "../components/Toast.jsx";

/**
 * ItemDetailPage — shows full details of a single item.
 * Route: /dashboard/items/:id
 * Demonstrates useParams() for route parameter access.
 */
const ItemDetailPage = () => {
  const { id } = useParams(); // Route parameter
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // useEffect: fetch item when id changes
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getItemById(id);
        setItem(data.item);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteItem(id);
      navigate(`/dashboard/items/${item.type || "lost"}`);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const isOwner =
    user &&
    item &&
    (item.reportedBy?._id === user.id ||
      item.reportedBy === user.id ||
      item.reportedBy?._id?.toString() === user.id?.toString());

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Loading item details…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <Toast message={error} type="error" />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-indigo-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  if (!item) return null;

  const isLost = item.type === "lost";
  const typeBadge = isLost
    ? "bg-red-100 text-red-700"
    : "bg-emerald-100 text-emerald-700";
  const statusBadge = {
    active: "bg-blue-50 text-blue-700",
    resolved: "bg-gray-100 text-gray-600",
    closed: "bg-gray-100 text-gray-500",
  }[item.status];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${typeBadge}`}>
            {item.type}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge}`}>
            {item.status}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-slate-900">{item.title}</h1>

        {/* Description */}
        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <Detail label="Category" value={item.category} />
          <Detail label="Location" value={item.location} />
          <Detail
            label="Date"
            value={
              item.date
                ? new Date(item.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Unknown"
            }
          />
          <Detail label="Brand" value={item.brand || "Not specified"} />
          <Detail label="Color" value={item.color || "Not specified"} />
          <Detail
            label="Reported by"
            value={item.reportedBy?.name || "Anonymous"}
          />
        </div>

        {item.additionalDetails && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Additional Details
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {item.additionalDetails}
            </p>
          </div>
        )}

        {/* Image placeholder */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Image
          </p>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full max-h-64 object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
              No image provided — AI image matching available in Phase 2
            </div>
          )}
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <Link
              to={`/dashboard/items/${id}/edit`}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Edit Report
            </Link>

            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-600">Are you sure?</span>
                <button
                  id="confirm-delete-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                id="delete-report-btn"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 text-sm font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
      {label}
    </p>
    <p className="text-sm text-slate-800 font-medium">{value}</p>
  </div>
);

export default ItemDetailPage;
