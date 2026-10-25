import { Link } from "react-router-dom";

const features = [
  {
    icon: "📋",
    title: "Report Lost Items",
    desc: "Describe what you lost — category, location, date, and distinctive features. Your report goes live instantly.",
  },
  {
    icon: "🔍",
    title: "Report Found Items",
    desc: "Found something on campus? Log it here. Your report helps reunite items with their rightful owners.",
  },
  {
    icon: "🤖",
    title: "AI Image Matching",
    desc: "Upload a photo when reporting. Our CLIP-powered AI automatically matches found items to lost reports using visual similarity.",
  },
  {
    icon: "📬",
    title: "Instant Notifications",
    desc: "Get notified the moment a match is found. Real-time updates keep you in the loop without manual checking.",
  },
];

const steps = [
  { num: "01", title: "Report", desc: "Log your lost or found item with details." },
  { num: "02", title: "Match", desc: "The platform surfaces potential matches." },
  { num: "03", title: "Reunite", desc: "Coordinate with the other student to claim." },
];

const LandingPage = () => (
  <div className="min-h-screen bg-white">
    {/* ── Navbar ─────────────────────────────────────────────────── */}
    <nav className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg">VisionTracker</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>

    {/* ── Hero ───────────────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full mb-6 tracking-wide uppercase">
        Chitkara University • Campus Lost & Found
      </span>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
        Lost something on campus?
        <br />
        <span className="text-indigo-600">We'll help you find it.</span>
      </h1>
      <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
        VisionTracker is a smart campus Lost &amp; Found platform. Report lost
        and found items, browse the feed, and get matched — all in one place.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/register"
          className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
        >
          Create Free Account
        </Link>
        <Link
          to="/login"
          className="w-full sm:w-auto px-8 py-3.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
        >
          Sign In
        </Link>
      </div>
    </section>

    {/* ── How it works ──────────────────────────────────────────── */}
    <section className="bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
          How VisionTracker works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {step.num}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Features ──────────────────────────────────────────────── */}
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
        Everything you need to recover lost items
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-200 transition-all duration-200"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-semibold text-slate-900 mb-2 text-sm">{f.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────────────────── */}
    <section className="bg-indigo-600 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to find what you lost?
        </h2>
        <p className="text-indigo-200 mb-8 text-sm">
          Join hundreds of Chitkara students who use VisionTracker every day.
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
        >
          Get Started — It's Free
        </Link>
      </div>
    </section>

    {/* ── Footer ────────────────────────────────────────────────── */}
    <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
      <p>
        VisionTracker — Back End Engineering (24CAI0303) • Chitkara University •{" "}
        {new Date().getFullYear()}
      </p>
    </footer>
  </div>
);

export default LandingPage;
