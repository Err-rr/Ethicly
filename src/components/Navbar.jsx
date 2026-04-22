import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { logout } from "../services/auth.js";

const navItems = [
  { label: "Upload", to: "/upload" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Report", to: "/report" },
  { label: "Compare", to: "/compare" }
];

export default function Navbar({ user }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        isScrolled
          ? "border-[#e5e7eb]/80 bg-white/76 shadow-glass backdrop-blur-2xl"
          : "border-transparent bg-white/92 backdrop-blur-sm"
      }`}
    >
      <nav className="page-shell flex min-h-16 items-center justify-between gap-4">

        {/* 🔥 LOGO */}
        <NavLink to="/" className="flex items-center gap-3 text-lg font-bold text-[#202124]">

          <motion.span
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.2 }}
            className="grid size-10 place-items-center rounded-xl bg-white shadow-card ring-1 ring-[#e8eaed]"
          >
            {/* 🔥 Updated Logo */}
            <div className="relative w-5 h-5">
              <div className="absolute w-2.5 h-2.5 bg-[#4285F4] rounded-full top-0 left-1/2 -translate-x-1/2" />
              <div className="absolute w-2.5 h-2.5 bg-[#34A853] rounded-full right-0 top-1/2 -translate-y-1/2" />
              <div className="absolute w-2.5 h-2.5 bg-[#FBBC05] rounded-full left-0 top-1/2 -translate-y-1/2" />
              <div className="absolute w-2.5 h-2.5 bg-[#EA4335] rounded-full bottom-0 left-1/2 -translate-x-1/2" />
            </div>
          </motion.span>

          Ethicly
        </NavLink>

        {/* 🔥 NAV ITEMS */}
        <div className="flex items-center gap-1 rounded-xl bg-white/55 p-1 ring-1 ring-[#e8eaed]/80">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                  isActive ? "text-[#4285F4]" : "text-[#5f6368] hover:text-[#202124]"
                }`
              }
            >
              {item.label}
              <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-[#4285F4] transition duration-200 group-hover:scale-x-100" />
            </NavLink>
          ))}
        </div>

        {/* 🔥 PROFILE */}
        {user ? (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="grid size-10 place-items-center overflow-hidden rounded-full bg-white text-sm font-bold text-[#4285F4] shadow-card ring-1 ring-[#dadce0] transition duration-200 hover:scale-[1.05]"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                avatarLetter
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 z-[1000] mt-3 w-72 rounded-xl border border-[#e8eaed] bg-white p-3 shadow-soft"
                >
                  <div className="flex items-center gap-3 pb-3">
                    <div className="grid size-10 place-items-center rounded-full bg-[#edf4ff] text-sm font-bold text-[#4285F4]">
                      {avatarLetter}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#202124]">{displayName}</p>
                      <p className="text-xs text-[#5f6368]">{user.email}</p>
                    </div>
                  </div>

                  <div className="h-px bg-[#e8eaed]" />

                  <button
                    onClick={handleLogout}
                    className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#EA4335] hover:bg-[#f8fafd]"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <NavLink
            to="/auth"
            className="hidden sm:inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-[#4285F4] ring-1 ring-[#d8e7ff] hover:bg-[#edf4ff]"
          >
            Sign in
          </NavLink>
        )}
      </nav>
    </header>
  );
}