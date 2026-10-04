import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { buttonClass, icons } from "../common/ui";

const SparkIcon = icons.spark;

/**
 * Landing hero.
 *
 * The decorative layer is pure CSS/SVG (a masked grid, two blurred colour
 * washes, and a radial fade) so the page needs no hero image, no icon package,
 * and nothing to download before it paints. Text sits on a light surface with
 * a solid backing, which keeps contrast readable regardless of the wash behind.
 */
const Hero = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* Decorative background - hidden from assistive tech. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Faint grid, faded out toward the edges. */}
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(226 232 240 / 0.7) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.7) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />

        {/* Two soft colour washes, blurred well past recognition. */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <SparkIcon className="h-3.5 w-3.5 text-blue-600" />
            A place to think out loud
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Connect. Discuss.{" "}
            <span className="text-blue-600">Learn. Grow.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Ask the questions you have been sitting on, share what you have
            figured out, and find people who care about the same things. Every
            good conversation starts with someone going first.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {loading ? (
              <span className="h-12 w-56" aria-hidden="true" />
            ) : (
              <>
                <Link
                  to={isAuthenticated ? "/create-discussion" : "/register"}
                  className={buttonClass("primary", "lg")}
                >
                  {isAuthenticated ? "Start a discussion" : "Join the Community"}
                </Link>

                <Link to="/discussions" className={buttonClass("secondary", "lg")}>
                  Explore Discussions
                </Link>
              </>
            )}
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Free to join. No noise, no algorithm - just people and ideas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
