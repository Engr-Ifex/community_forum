import { useAuth } from "../../context/AuthContext";
import Footer from "../common/Footer";
import Navbar from "../common/Navbar";

/**
 * Public (guest) shell - the marketing chrome.
 *
 *   Navbar  (Logo · Home · Discussions · Categories · Login · Register)
 *   page
 *   Footer
 *
 * This is the visitor experience. Signed-in users get `AppLayout` instead (see
 * `SiteShell`), so the public navbar never sits on top of the application.
 *
 * The auth-aware branch below is a belt-and-braces guard for the guest-only
 * routes (`/login`, `/register`): both redirect an existing session to
 * `/dashboard`, and hiding the navbar while that redirect resolves keeps the
 * "navbar is for visitors" rule true even for that single frame.
 */
const PublicShell = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {isAuthenticated ? null : <Navbar />}

      <main className="flex-1">{children}</main>

      {isAuthenticated ? null : <Footer />}
    </div>
  );
};

export default PublicShell;
