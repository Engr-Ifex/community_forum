import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import Admin from "./components/Admin/Admin";
import Categories from "./components/Categories/Categories";
import CategoryPage from "./components/Categories/CategoryPage";
import Dashboard from "./components/Dashboard/Dashboard";
import MyDiscussions from "./components/Dashboard/MyDiscussions";
import CreateDiscussion from "./components/Discussions/CreateDiscussion";
import DiscussionDetails from "./components/Discussions/DiscussionDetails";
import Discussions from "./components/Discussions/Discussions";
import DiscussionDetail from "./components/Discussions/DiscussionDetail";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Moderation from "./components/Moderation/Moderation";
import Profile from "./components/Profile/Profile";
import PublicProfile from "./components/Profile/PublicProfile";
import Users from "./components/Profile/Users";
import Register from "./components/Register/Register";
import NotFound from "./components/common/NotFound";
import AppLayout from "./components/layout/AppLayout";
import PublicShell from "./components/layout/PublicShell";
import SiteShell from "./components/layout/SiteShell";

/**
 * Centred, narrow container for the guest-only auth pages.
 */
const Page = ({ children }) => (
  <div className="mx-auto w-full max-w-5xl px-4 py-10">{children}</div>
);

/**
 * Two shells, chosen by session state - and each route declares which one it
 * belongs to.
 *
 *   APPLICATION (AppLayout)  - top bar + sidebar. Every signed-in page, plus the
 *                              shared pages when a session exists.
 *   PUBLIC      (PublicShell) - marketing navbar + footer. Visitors only.
 *
 * Three route groups:
 *
 *   1. SIGNED-IN ONLY  - `ProtectedRoute` + `AppLayout`. Redirects anonymous
 *      visitors to `/login` (remembering where they were headed).
 *
 *   2. GUEST ONLY      - `/login` and `/register` in `PublicShell`. Both
 *      components redirect an existing session to `/dashboard`.
 *
 *   3. SHARED          - `SiteShell` picks the shell per request: a visitor gets
 *      the public site, a signed-in user gets the application with the sidebar
 *      still in place. This is what makes sidebar clicks on Discussions and
 *      Categories swap only the right-hand content, exactly like Profile and My
 *      Discussions.
 *
 * `ProtectedRoute` remains the single gate, and the backend stays the authority:
 * sidebar links are hidden by role for clarity, but every destination is
 * independently guarded server-side.
 */
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ---------- 1. Signed-in only, inside the application shell ---------- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-discussions" element={<MyDiscussions />} />
              <Route path="/create-discussion" element={<CreateDiscussion />} />
              {/* Alias kept so older links keep working. */}
              <Route path="/discussions/new" element={<CreateDiscussion />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Moderator or admin. */}
          <Route element={<ProtectedRoute roles={["moderator", "admin"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/moderation" element={<Moderation />} />
            </Route>
          </Route>

          {/* Admin only. */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>

          {/* ---------- 2. Guest only ---------- */}
          <Route
            path="/login"
            element={
              <PublicShell>
                <Page>
                  <Login />
                </Page>
              </PublicShell>
            }
          />

          <Route
            path="/register"
            element={
              <PublicShell>
                <Page>
                  <Register />
                </Page>
              </PublicShell>
            }
          />

          {/* ---------- 3. Shared: the shell follows the session ---------- */}
          {/* Landing page manages its own width in either shell. */}
          <Route
            path="/"
            element={
              <SiteShell fullBleed>
                <Home />
              </SiteShell>
            }
          />

          <Route
            path="/discussions"
            element={
              <SiteShell>
                <Discussions />
              </SiteShell>
            }
          />

          <Route
            path="/discussions/:id"
            element={
              <SiteShell>
                <DiscussionDetails />
              </SiteShell>
            }
          />

          <Route
            path="/categories"
            element={
              <SiteShell>
                <Categories />
              </SiteShell>
            }
          />

          <Route
            path="/categories/:id"
            element={
              <SiteShell>
                <CategoryPage />
              </SiteShell>
            }
          />

          {/* ---------- Anything else ---------- */}
          <Route
            path="*"
            element={
              <SiteShell>
                <NotFound />
              </SiteShell>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
