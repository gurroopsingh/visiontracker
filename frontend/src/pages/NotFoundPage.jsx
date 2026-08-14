import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div className="text-center">
      <p className="text-8xl font-extrabold text-indigo-100 select-none">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-2">
        Page not found
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
