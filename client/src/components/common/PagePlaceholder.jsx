/**
 * Shared shell for not-yet-implemented pages.
 * Keeps the eight placeholder routes to a few lines each and visually consistent.
 */
const PagePlaceholder = ({ title, description, children }) => {
  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>

      {description ? <p className="mt-3 text-slate-600">{description}</p> : null}

      <p className="mt-6 text-sm text-slate-400">
        Placeholder route - functionality arrives in a later phase.
      </p>

      {children}
    </section>
  );
};

export default PagePlaceholder;
