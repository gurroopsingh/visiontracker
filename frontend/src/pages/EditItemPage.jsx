import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getItemById, updateItem } from "../services/itemService.js";
import { useAuth } from "../context/AuthContext.jsx";
import Toast from "../components/Toast.jsx";
import Spinner from "../components/Spinner.jsx";

const CATEGORIES = [
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
 * EditItemPage — lets the item owner edit their report.
 * Route: /dashboard/items/:id/edit
 * Ownership check is performed on the backend (PUT /api/items/:id).
 */
const EditItemPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [status, setStatus] = useState("active");
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [item, setItem] = useState(null);

  // Fetch the item and populate the form
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getItemById(id);
        const i = data.item;
        setItem(i);

        // Ownership guard — redirect if not the owner
        const ownerId = i.reportedBy?._id || i.reportedBy;
        if (user && ownerId?.toString() !== user.id?.toString()) {
          navigate(`/dashboard/items/${id}`, { replace: true });
          return;
        }

        // Populate form fields
        setTitle(i.title || "");
        setDescription(i.description || "");
        setCategory(i.category || "");
        setBrand(i.brand || "");
        setColor(i.color || "");
        setLocation(i.location || "");
        setDate(i.date ? i.date.substring(0, 10) : "");
        setAdditionalDetails(i.additionalDetails || "");
        setStatus(i.status || "active");
        setExistingImageUrl(i.imageUrl || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, user, navigate]);

  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!description.trim()) return "Description is required.";
    if (!category) return "Please select a category.";
    if (!location.trim()) return "Location is required.";
    if (!date) return "Date is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("color", color);
      formData.append("location", location);
      formData.append("date", date);
      formData.append("additionalDetails", additionalDetails);
      formData.append("status", status);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await updateItem(id, formData);
      setSuccess("Item updated successfully!");
      setTimeout(() => navigate(`/dashboard/items/${id}`), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Loading item…" />
      </div>
    );
  }

  if (!item) return null;

  const isLost = item.type === "lost";
  const accentColor = isLost ? "indigo" : "emerald";

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">Edit Item Report</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update the details for your {item.type} item report.
        </p>
      </div>

      {error && <Toast message={error} type="error" onClose={() => setError("")} />}
      {success && <Toast message={success} type="success" />}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
      >
        {/* Title */}
        <Field label="Title *" htmlFor="edit-title">
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </Field>

        {/* Description */}
        <Field label="Description *" htmlFor="edit-description">
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </Field>

        {/* Category */}
        <Field label="Category *" htmlFor="edit-category">
          <select
            id="edit-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {/* Brand & Color */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Brand" htmlFor="edit-brand">
            <input
              id="edit-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Color" htmlFor="edit-color">
            <input
              id="edit-color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Location */}
        <Field label="Location *" htmlFor="edit-location">
          <input
            id="edit-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
        </Field>

        {/* Date */}
        <Field label="Date *" htmlFor="edit-date">
          <input
            id="edit-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </Field>

        {/* Status */}
        <Field label="Status" htmlFor="edit-status">
          <select
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </Field>

        {/* Additional Details */}
        <Field label="Additional Details" htmlFor="edit-additional">
          <textarea
            id="edit-additional"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </Field>

        {/* Image */}
        <Field label="Photo" htmlFor="edit-image">
          {existingImageUrl && !imageFile && (
            <div className="mb-3">
              <img
                src={existingImageUrl}
                alt="Current item"
                className="h-32 rounded-xl object-cover border border-slate-200"
              />
              <p className="text-xs text-slate-400 mt-1">Current image — upload a new one to replace it.</p>
            </div>
          )}
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-5 text-center hover:border-indigo-300 transition-colors">
            <input
              id="edit-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <label htmlFor="edit-image" className="cursor-pointer">
              <svg className="w-7 h-7 text-slate-300 mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {imageFile ? (
                <p className="text-sm text-indigo-600 font-medium">{imageFile.name}</p>
              ) : (
                <p className="text-sm text-slate-400">Click to upload new photo (optional)</p>
              )}
            </label>
          </div>
        </Field>

        {/* Submit */}
        <button
          id="edit-item-submit"
          type="submit"
          disabled={saving}
          className={`w-full py-3 bg-${accentColor}-600 text-white font-semibold rounded-lg text-sm hover:bg-${accentColor}-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
        >
          {saving ? <><Spinner size="sm" /> Saving…</> : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

const Field = ({ label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white";

export default EditItemPage;
