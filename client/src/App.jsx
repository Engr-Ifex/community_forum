import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Admin from "./components/Admin/Admin";
import Categories from "./components/Categories/Categories";
import CategoryPage from "./components/Categories/CategoryPage";
import Discussions from "./components/Discussions/Discussions";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Moderation from "./components/Moderation/Moderation";
import Profile from "./components/Profile/Profile";
import PublicProfile from "./components/Profile/PublicProfile";
import Users from "./components/Profile/Users";
import Register from "./components/Register/Register";
import Footer from "./components/common/Footer";
import Navbar from "./components/common/Navbar";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
          <Navbar />

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/discussions" element={<Discussions />} />
              <Route path="/categories" element={<Categories />} />
              <Route
                path="/categories/:categoryId"
                element={<CategoryPage />}
              />

              {/* Logged-in users only */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/create-discussion"
                  element={<Discussions />}
                />

                <Route path="/users" element={<Users />} />
                <Route path="/moderation" element={<Moderation />} />
                <Route path="/admin" element={<Admin />} />
              </Route>

              {/* Own profile is public so logged-out users can
                  see the login/register prompt. */}
              <Route path="/profile" element={<Profile />} />

              {/* Other users' public profiles */}
              <Route
                path="/profile/:username"
                element={<PublicProfile />}
              />

              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;