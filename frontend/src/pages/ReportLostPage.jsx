import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportLostItem } from "../services/itemService.js";
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
 * ReportLostPage — fully controlled form for reporting a lost item.
 * Every field has its own useState variable.
 */
const ReportLostPage = () => {
  // Controlled form state — one per field
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

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

    setLoading(true);
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
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await reportLostItem(formData);
      setSuccess("Lost item reported successfully!");
      setTimeout(() => navigate("/dashboard/items/lost"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Report a Lost Item</h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide as much detail as possible to help identify your item.
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
        <Field label="Title *" htmlFor="lost-title">
          <input
            id="lost-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Black Dell laptop"
            className={inputClass}
          />
        </Field>

        {/* Description */}
        <Field label="Description *" htmlFor="lost-description">
          <textarea
            id="lost-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item in detail — any distinctive marks, stickers, damage…"
            rows={4}
            className={inputClass}
          />
        </Field>

        {/* Category */}
        <Field label="Category *" htmlFor="lost-category">
          <select
            id="lost-category"
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

        {/* Brand & Color — side by side */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Brand" htmlFor="lost-brand">
            <input
              id="lost-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Apple, Samsung"
              className={inputClass}
            />
          </Field>
          <Field label="Color" htmlFor="lost-color">
            <input
              id="lost-color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., Black, Silver"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Location */}
        <Field label="Where did you lose it? *" htmlFor="lost-location">
          <input
            id="lost-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Block A Cafeteria, Library 2nd Floor"
            className={inputClass}
          />
        </Field>

        {/* Date */}
        <Field label="When did you lose it? *" htmlFor="lost-date">
          <input
            id="lost-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </Field>

        {/* Additional Details */}
        <Field label="Additional Details" htmlFor="lost-additional">
          <textarea
            id="lost-additional"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder="Any other info that might help — serial number, contents, etc."
            rows={2}
            className={inputClass}
          />
        </Field>

        {/* Image upload UI */}
        <Field label="Photo (optional)" htmlFor="lost-image">
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-indigo-300 transition-colors cursor-pointer">
            <input
              id="lost-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <label htmlFor="lost-image" className="cursor-pointer">
              <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {imageFile ? (
                <p className="text-sm text-indigo-600 font-medium">{imageFile.name}</p>
              ) : (
                <>
                  <p className="text-sm text-slate-500 font-medium">Click to upload photo</p>
                  <p className="text-xs text-slate-400 mt-0.5">AI image matching • PNG, JPG, WebP up to 10MB</p>
                </>
              )}
            </label>
          </div>
        </Field>

        {/* Submit */}
        <button
          id="report-lost-submit"
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Spinner size="sm" /> Submitting…</> : "Submit Lost Report"}
        </button>
      </form>
    </div>
  );
};

// Reusable form field wrapper
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

export default ReportLostPage;
