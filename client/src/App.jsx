import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Admin from "./components/Admin/Admin";
import Categories from "./components/Categories/Categories";
import Discussions from "./components/Discussions/Discussions";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Moderation from "./components/Moderation/Moderation";
import Profile from "./components/Profile/Profile";
import Register from "./components/Register/Register";
import Footer from "./components/common/Footer";
import Navbar from "./components/common/Navbar";

const App = () => {
  return (
    <AuthProvider>
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/discussions" element={<Discussions />} />
            <Route path="/categories" element={<Categories />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/moderation" element={<Moderation />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
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
