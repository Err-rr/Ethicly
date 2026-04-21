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
    if (!isProfileOpen) {
      return undefined;
    }

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
        <NavLink to="/" className="flex items-center gap-3 text-lg font-bold text-[#202124]">
          <motion.span
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.18 }}
            className="grid size-10 place-items-center rounded-xl bg-white shadow-card ring-1 ring-[#e8eaed]"
          >
            <span className="size-4 rounded-full bg-google-blue shadow-[12px_0_0_#34A853,-12px_0_0_#FBBC05,0_12px_0_#EA4335]" />
          </motion.span>
          Ethicly
        </NavLink>

        <div className="flex items-center gap-1 rounded-xl bg-white/55 p-1 ring-1 ring-[#e8eaed]/80">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                  isActive ? "text-google-blue" : "text-[#5f6368] hover:text-[#202124]"
                }`
              }
            >
              {item.label}
              <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-google-blue transition duration-200 group-hover:scale-x-100" />
            </NavLink>
          ))}
        </div>
        {user ? (
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="grid size-10 place-items-center overflow-hidden rounded-full bg-white text-sm font-bold text-google-blue shadow-card ring-1 ring-[#dadce0] transition duration-200 hover:scale-[1.04] hover:ring-google-blue"
              aria-label="Open profile menu"
              aria-expanded={isProfileOpen}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                avatarLetter
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  onClick={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 z-[1000] mt-3 w-72 origin-top-right overflow-hidden rounded-xl border border-[#e8eaed] bg-white p-3 shadow-soft"
                >
                  <div className="flex items-center gap-3 px-1 pb-3">
                    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#edf4ff] text-sm font-bold text-google-blue ring-1 ring-[#d8e7ff]">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        avatarLetter
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#202124]">{displayName}</p>
                      <p className="mt-0.5 truncate text-xs text-[#5f6368]">{user.email}</p>
                    </div>
                  </div>
                  <div className="h-px bg-[#e8eaed]" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-google-red transition duration-200 hover:bg-[#f8fafd]"
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
            className={({ isActive }) =>
              `hidden rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 sm:inline-flex ${
                isActive
                  ? "bg-google-blue text-white shadow-card"
                  : "text-google-blue ring-1 ring-[#d8e7ff] hover:bg-[#edf4ff]"
              }`
            }
          >
            Sign in
          </NavLink>
        )}
      </nav>
    </header>
  );
}
