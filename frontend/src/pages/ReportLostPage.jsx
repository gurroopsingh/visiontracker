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
      await reportLostItem({
        title,
        description,
        category,
        brand,
        color,
        location,
        date,
        additionalDetails,
      });
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
