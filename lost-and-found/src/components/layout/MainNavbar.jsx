import {
  IoMenuOutline,
  IoNotificationsOutline,
  IoPersonCircleOutline,
  IoSearchOutline,
  IoLogOutOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoMailOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import { useAuth } from "../../context/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import SearchSuggestions from "../SearchSuggestions";

function MainNavbar({ onOpenSidebar, items = [] }) {
  const { searchTerm, setSearchTerm } = useSearch();
  const { currentUser, logout } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchTerm);

  const suggestionResults = items.filter(
    (item) =>
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.category?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser?.email) return "?";
    return currentUser.email.charAt(0).toUpperCase();
  };

  // Get username from email (before @)
  const getUsername = () => {
    if (!currentUser?.email) return "User";
    return currentUser.email.split("@")[0];
  };

  // Get domain from email (after @)
  const getDomain = () => {
    if (!currentUser?.email) return "";
    return "@" + currentUser.email.split("@")[1];
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (profileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 py-3 border-b bg-white">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden text-2xl" onClick={onOpenSidebar}>
            <IoMenuOutline />
          </button>

          {/* SEARCH BAR */}
          <div className="relative hidden sm:block w-72">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
            />
            {showSuggestions && (
              <SearchSuggestions
                results={suggestionResults}
                onSelect={(value) => setSearchTerm(value)}
              />
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-gray-600">
          <button className="text-2xl hover:text-orange-500 transition-colors">
            <IoNotificationsOutline />
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none group"
            aria-label="Open profile menu"
          >
            {/* Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-transparent group-hover:ring-orange-300 transition-all">
              {getUserInitials()}
            </div>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          BACKDROP
      ───────────────────────────────────────────── */}
      <div
        onClick={() => setProfileOpen(false)}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          profileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ─────────────────────────────────────────────
          SLIDING SIDEBAR
      ───────────────────────────────────────────── */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          profileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
            Account
          </span>
          <button
            onClick={() => setProfileOpen(false)}
            className="text-xl text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close profile menu"
          >
            <IoCloseOutline />
          </button>
        </div>

        {/* ── User Info ── */}
        <div className="px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {/* Large Avatar */}
            <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {getUserInitials()}
            </div>

            {/* Name & Email */}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate capitalize">
                {getUsername()}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>

          {/* Verified Badge */}
          {currentUser?.emailVerified && (
            <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-medium">
              <IoShieldCheckmarkOutline className="text-base flex-shrink-0" />
              Full Sail email verified
            </div>
          )}
        </div>

        {/* ── Menu Items (future use) ── */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Profile item (placeholder) */}
          <button
            disabled
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 cursor-not-allowed"
          >
            <IoPersonCircleOutline className="text-lg flex-shrink-0" />
            <span>My Profile</span>
            <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          {/* My Reports (placeholder) */}
          <button
            disabled
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 cursor-not-allowed"
          >
            <IoCheckmarkCircle className="text-lg flex-shrink-0" />
            <span>My Reports</span>
            <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>

          {/* Contact (placeholder) */}
          <button
            disabled
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 cursor-not-allowed"
          >
            <IoMailOutline className="text-lg flex-shrink-0" />
            <span>Contact Support</span>
            <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </button>
        </div>

        {/* ── Logout ── */}
        <div className="px-5 py-5 border-t border-gray-100">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing out...
              </>
            ) : (
              <>
                <IoLogOutOutline className="text-lg" />
                Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default MainNavbar;