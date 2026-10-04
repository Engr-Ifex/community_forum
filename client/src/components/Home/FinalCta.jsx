import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { inverseButtonClass } from "../common/ui";

/**
 * Closing call to action.
 *
 * Uses the one dark surface on the page so the section reads as an ending
 * rather than another content block. Swaps to a "keep going" message for
 * visitors who are already signed in instead of asking them to register again.
 *
 * The two buttons use `inverseButtonClass`, NOT `buttonClass`. Extending a
 * variant with a `bg-*` override does not work in Tailwind v4: utility rules are
 * emitted in a fixed property order, so `buttonClass("primary","lg","bg-white
 * text-slate-900")` emits both `bg-blue-600` and `bg-white` (and both `text-white`
 * and `text-slate-900`) with the winner chosen by Tailwind, not by us - which
 * produced white-on-white text here. Composing the classes outright removes the
 * collision: one solid white pill plus one outlined pill, both legible on
 * slate-900.
 */
const FinalCta = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="relative isolate overflow-hidden rounded-2xl bg-slate-900 px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {isAuthenticated
            ? "Ready to start something?"
            : "Ready to join the conversation?"}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          {isAuthenticated
            ? "You are already part of the community. Put a question out there and see who answers."
            : "Create an account in under a minute. Pick a topic that matters to you and say the first thing."}
        </p>

        {loading ? (
          <span className="mt-8 block h-12" aria-hidden="true" />
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={isAuthenticated ? "/create-discussion" : "/register"}
              className={inverseButtonClass("solid", "lg", "w-full sm:w-auto")}
            >
              {isAuthenticated ? "Start a discussion" : "Create Account"}
            </Link>

            <Link
              to="/discussions"
              className={inverseButtonClass("outline", "lg", "w-full sm:w-auto")}
            >
              Browse Discussions
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FinalCta;
