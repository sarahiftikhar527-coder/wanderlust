import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Experiences from "./pages/Experiences";
import ExperienceDetail from "./pages/ExperienceDetail";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/dashboard/Dashboard";
import MyBookings from "./pages/dashboard/MyBookings";
import Favorites from "./pages/dashboard/Favorites";
import Notifications from "./pages/dashboard/Notifications";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminExperiences from "./pages/admin/AdminExperiences";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminSettings from "./pages/admin/AdminSettings";

import NotFound from "./components/NotFound";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/experiences" element={<Experiences />} />

          <Route
            path="/experiences/:slug"
            element={<ExperienceDetail />}
          />

          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/dashboard/bookings"
            element={<MyBookings />}
          />

          <Route
            path="/dashboard/favorites"
            element={<Favorites />}
          />

          <Route
            path="/dashboard/notifications"
            element={<Notifications />}
          />

          <Route
            path="/dashboard/profile"
            element={<Profile />}
          />

          <Route
            path="/dashboard/settings"
            element={<Settings />}
          />
        </Route>

        <Route
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />

          <Route
            path="/admin/experiences"
            element={<AdminExperiences />}
          />

          <Route
            path="/admin/categories"
            element={<AdminCategories />}
          />

          <Route
            path="/admin/bookings"
            element={<AdminBookings />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/contacts"
            element={<AdminContacts />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettings />}
          />
        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </>
  );
}

export default App;