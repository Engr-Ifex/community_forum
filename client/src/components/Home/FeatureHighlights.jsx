import { icons } from "../common/ui";

/**
 * Feature highlights.
 *
 * Four cards on a 4/2/1 column responsive grid. Uses a `divide`-style border
 * treatment on large screens instead of full card chrome, so the row reads as
 * one band rather than four competing boxes.
 */
const FEATURES = [
  {
    key: "start",
    icon: icons.chat,
    title: "Start Discussions",
    body: "Turn a half-formed thought into a thread. Give it a clear title, pick a category, and let the room weigh in.",
  },
  {
    key: "join",
    icon: icons.users,
    title: "Join Conversations",
    body: "Reply to what resonates. Ask a follow-up question. Add the detail everyone else missed.",
  },
  {
    key: "explore",
    icon: icons.grid,
    title: "Explore Categories",
    body: "Browse by topic when you are not sure where to start, and find the corner of the forum that fits.",
  },
  {
    key: "moderation",
    icon: icons.shield,
    title: "Community Moderation",
    body: "Reports go to real moderators, not a void. Threads can be locked and content removed to keep things civil.",
  },
];

const FeatureHighlights = () => {
  return (
    <section className="border-y border-slate-200 bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything a good forum needs
          </h2>

          <p className="mt-3 text-slate-600">
            Built around the parts that actually matter: writing, replying,
            finding the right room, and keeping it worth reading.
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ key, icon: Icon, title, body }) => (
            <li key={key}>
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm">
                <Icon className="h-5 w-5" />
              </span>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FeatureHighlights;
