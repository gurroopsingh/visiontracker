import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportFoundItem } from "../services/itemService.js";
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
 * ReportFoundPage — controlled form for reporting a found item.
 * Also includes image upload UI (FormData ready, backend integration Phase 2).
 */
const ReportFoundPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [imageFile, setImageFile] = useState(null); // Phase 2: upload via Multer

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
      // Phase 1: send JSON payload (no file upload yet)
      await reportFoundItem({
        title,
        description,
        category,
        brand,
        color,
        location,
        date,
        additionalDetails,
      });
      setSuccess("Found item reported! Someone will be very grateful.");
      setTimeout(() => navigate("/dashboard/items/found"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Report a Found Item</h1>
        <p className="text-sm text-slate-500 mt-1">
          You found something — help it get back to its owner.
        </p>
      </div>

      {error && <Toast message={error} type="error" onClose={() => setError("")} />}
      {success && <Toast message={success} type="success" />}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
      >
        <Field label="Title *" htmlFor="found-title">
          <input
            id="found-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Blue water bottle"
            className={inputClass}
          />
        </Field>

        <Field label="Description *" htmlFor="found-description">
          <textarea
            id="found-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item — colour, brand, distinguishing features…"
            rows={4}
            className={inputClass}
          />
        </Field>

        <Field label="Category *" htmlFor="found-category">
          <select
            id="found-category"
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

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Brand" htmlFor="found-brand">
            <input
              id="found-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Nike, Apple"
              className={inputClass}
            />
          </Field>
          <Field label="Color" htmlFor="found-color">
            <input
              id="found-color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., Blue, Red"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Where did you find it? *" htmlFor="found-location">
          <input
            id="found-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Parking Lot B, Sports Complex"
            className={inputClass}
          />
        </Field>

        <Field label="When did you find it? *" htmlFor="found-date">
          <input
            id="found-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </Field>

        <Field label="Additional Details" htmlFor="found-additional">
          <textarea
            id="found-additional"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder="Where is the item currently? Contact info?"
            rows={2}
            className={inputClass}
          />
        </Field>

        {/* Image upload UI — Phase 2 will wire this to Multer */}
        <Field label="Photo (optional)" htmlFor="found-image">
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-indigo-300 transition-colors cursor-pointer">
            <input
              id="found-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <label htmlFor="found-image" className="cursor-pointer">
              <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {imageFile ? (
                <p className="text-sm text-indigo-600 font-medium">{imageFile.name}</p>
              ) : (
                <>
                  <p className="text-sm text-slate-500 font-medium">Click to upload photo</p>
                  <p className="text-xs text-slate-400 mt-0.5">AI image matching in Phase 2 • PNG, JPG up to 10MB</p>
                </>
              )}
            </label>
          </div>
        </Field>

        <button
          id="report-found-submit"
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Spinner size="sm" /> Submitting…</> : "Submit Found Report"}
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

export default ReportFoundPage;
