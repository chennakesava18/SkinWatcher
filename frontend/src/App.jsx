import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import ChatAssistant from "./components/ui/ChatAssistant.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import History from "./pages/History.jsx";
import Landing from "./pages/Landing.jsx";
import Learn from "./pages/Learn.jsx";
import Login from "./pages/Login.jsx";
import Predict from "./pages/Predict.jsx";
import Profile from "./pages/Profile.jsx";
import Signup from "./pages/Signup.jsx";
import Admin from "./pages/Admin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Doctors from "./pages/Doctors.jsx";

function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return user?.role === "admin" ? children : <Navigate to="/app/dashboard" replace />;
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="predict" element={<Predict />} />
            <Route path="history" element={<History />} />
            <Route path="profile" element={<Profile />} />
            <Route path="learn" element={<Learn />} />
            <Route path="doctors" element={<Doctors />} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/app/dashboard" replace /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><Navigate to="/app/doctors" replace /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AppLayout /></AdminRoute>}>
            <Route index element={<Admin />} />
            <Route path="users" element={<Admin section="Users" />} />
            <Route path="doctors" element={<Admin section="Doctors" />} />
            <Route path="analytics" element={<Admin section="Analytics" />} />
            <Route path="status" element={<Admin section="Website Status" />} />
            <Route path="activity" element={<Admin section="Activity Logs" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <ChatAssistant />
    </>
  );
}
