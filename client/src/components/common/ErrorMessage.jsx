/**
 * Form / request error display.
 *
 * Two modes, so every existing caller keeps working:
 *
 *   <ErrorMessage message="Could not load discussions." />
 *     -> one line of text
 *
 *   <ErrorMessage message="Validation failed" errors={[{ field, message }]} />
 *     -> the summary plus a per-field list
 *
 * Pass `fieldErrors` (a `{ field: message }` map from `getFieldErrors`) to show
 * only the per-field detail when the caller already renders its own summary.
 */
const ErrorMessage = ({ message = "Something went wrong.", errors, fieldErrors }) => {
  const list = Array.isArray(errors) ? errors.filter((e) => e?.message) : [];

  const fromMap = fieldErrors
    ? Object.entries(fieldErrors).map(([field, fieldMessage]) => ({
        field,
        message: fieldMessage,
      }))
    : [];

  const details = list.length ? list : fromMap;

  // Nothing to say beyond the summary.
  if (!details.length) {
    return (
      <p role="alert" className="text-sm text-red-700">
        {message}
      </p>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <p className="font-medium">{message}</p>

      <ul className="mt-2 list-disc space-y-1 pl-5">
        {details.map((entry, index) => (
          <li key={`${entry.field ?? "error"}-${index}`}>
            {entry.field ? (
              <>
                <span className="font-medium capitalize">
                  {String(entry.field).replace(/\./g, " › ")}
                </span>
                {": "}
              </>
            ) : null}
            {entry.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorMessage;
