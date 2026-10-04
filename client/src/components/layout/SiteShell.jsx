import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";
import AppLayout from "./AppLayout";
import PublicShell from "./PublicShell";

/**
 * Session-aware shell for pages both audiences may read.
 *
 * `/`, `/discussions`, `/discussions/:id`, `/categories`, `/categories/:id` and
 * the 404 page are public *content* - anyone may read them - but they are not
 * public *chrome*. A signed-in user opening them from the sidebar must stay
 * inside the application: sidebar still visible, only the right-hand column
 * changes. Routing them through this component is what makes a sidebar click
 * behave the same for Discussions and Categories as it already did for Profile
 * and My Discussions.
 *
 *   guest         -> PublicShell - navbar + footer, content centred at max-w-5xl
 *   authenticated -> AppLayout   - top bar + sidebar, content fills the column
 *
 * `fullBleed` skips the centred wrapper for the landing page, which manages its
 * own width in either shell.
 *
 * While `loading` is true only a spinner renders. Picking a shell earlier would
 * flash the wrong chrome, and the app branch would build a sidebar from a
 * session that has not arrived yet.
 */
const SiteShell = ({ children, fullBleed = false }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-slate-800">
        <Loader />
      </div>
    );
  }

  if (isAuthenticated) {
    return <AppLayout>{children}</AppLayout>;
  }

  return (
    <PublicShell>
      {fullBleed ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-5xl px-4 py-10">{children}</div>
      )}
    </PublicShell>
  );
};

export default SiteShell;
