import { Link } from "react-router-dom";

/**
 * Site footer.
 *
 * Three groups: brand line, the primary destinations, and the account actions.
 * Kept intentionally short - it closes the page rather than competing with it.
 */
const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-600 text-xs font-bold text-white">
                CF
              </span>
              <span className="font-semibold tracking-tight">Community Forum</span>
            </Link>

            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              A place to ask questions, share what you know, and follow the
              conversations worth following.
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Explore
              </h2>

              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    to="/discussions"
                    className="rounded text-slate-600 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Discussions
                  </Link>
                </li>

                <li>
                  <Link
                    to="/categories"
                    className="rounded text-slate-600 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Categories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account
              </h2>

              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    to="/login"
                    className="rounded text-slate-600 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Login
                  </Link>
                </li>

                <li>
                  <Link
                    to="/register"
                    className="rounded text-slate-600 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
          Community Forum
        </div>
      </div>
    </footer>
  );
};

export default Footer;
