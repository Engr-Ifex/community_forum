import { Link } from "react-router-dom";

import { buttonClass } from "./ui";

const NotFound = () => {
  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        404
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Page not found
      </h1>

      <p className="mt-3 text-slate-600">
        The page you are looking for does not exist or may have been moved.
      </p>

      <Link to="/" className={buttonClass("primary", "md", "mt-6")}>
        Back to home
      </Link>
    </section>
  );
};

export default NotFound;
