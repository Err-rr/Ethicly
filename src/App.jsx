import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { auth } from "./firebase.js";

const formatUser = (firebaseUser) => {
  if (!firebaseUser) {
    return null;
  }

  return {
    name: firebaseUser.displayName || "",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || ""
  };
};

export default function App() {
  const [user, setUser] = useState(null);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) {
      setUser(null);
      return;
    }

    await auth.currentUser.reload();
    setUser(formatUser(auth.currentUser));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(formatUser(firebaseUser));
    });

    return unsubscribe;
  }, []);

  return (
    <div className="app-background min-h-screen text-[#202124]">
      <Navbar user={user} />
      <main className="min-h-[calc(100vh-4rem)]">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/auth" element={<AuthPage refreshUser={refreshUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
