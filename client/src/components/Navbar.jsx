import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  Compass,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { cn } from "../utils/helpers";

const Navbar = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();

  const {
    unreadCount = 0,
    notifications = [],
    refresh,
  } = useNotifications();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [notificationMenu, setNotificationMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    {
      to: "/",
      label: "Home",
    },
    {
      to: "/experiences",
      label: "Explore",
    },
    {
      to: "/about",
      label: "About",
    },
    {
      to: "/features",
      label: "Features",
    },
    {
      to: "/faq",
      label: "FAQ",
    },
    {
      to: "/contact",
      label: "Contact",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
    setNotificationMenu(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (isAuthenticated && typeof refresh === "function") {
      refresh();
    }
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenu(false);
      }

      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setNotificationMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      setMobileOpen(false);
      setUserMenu(false);
      setNotificationMenu(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const closeMenus = () => {
    setMobileOpen(false);
    setUserMenu(false);
    setNotificationMenu(false);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const getInitial = () => {
    const name = user?.name?.trim();

    if (!name) {
      return "U";
    }

    return name.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    closeMenus();

    try {
      await logout();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      navigate("/");
    }
  };

  const getNotificationTime = (notification) => {
    const date =
      notification?.createdAt ||
      notification?.updatedAt;

    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const difference = Math.max(
      0,
      Date.now() - parsedDate.getTime()
    );

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d`;
    }

    return parsedDate.toLocaleDateString();
  };

  const notificationItems = Array.isArray(
    notifications
  )
    ? notifications.slice(0, 5)
    : [];

  return (
    <>
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 bg-white transition-all duration-300",
          scrolled
            ? "border-b border-gray-200 shadow-sm"
            : "border-b border-gray-100"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between">
            <Link
              to="/"
              onClick={closeMenus}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                <Compass
                  className="h-5 w-5 text-white"
                  strokeWidth={2.5}
                />
              </div>

              <div>
                <div className="text-xl font-bold tracking-tight text-gray-900">
                  Wanderlust
                </div>

                <div className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400 sm:block">
                  Explore beyond
                </div>
              </div>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive(link.to)
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/experiences"
                onClick={closeMenus}
                aria-label="Search experiences"
                className="hidden h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-indigo-600 sm:flex"
              >
                <Search className="h-5 w-5" />
              </Link>

              {isAuthenticated ? (
                <>
                  <div
                    ref={notificationMenuRef}
                    className="relative hidden sm:block"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationMenu(
                          (value) => !value
                        );
                        setUserMenu(false);
                      }}
                      aria-label="Notifications"
                      aria-expanded={notificationMenu}
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                        notificationMenu
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Bell className="h-5 w-5" />

                      {unreadCount > 0 && (
                        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                          {unreadCount > 9
                            ? "9+"
                            : unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {notificationMenu && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: 8,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                          className="absolute right-0 mt-3 w-[340px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                            <div>
                              <h3 className="text-sm font-bold text-gray-900">
                                Notifications
                              </h3>

                              <p className="mt-1 text-xs text-gray-500">
                                {unreadCount > 0
                                  ? `${unreadCount} unread notification${
                                      unreadCount > 1
                                        ? "s"
                                        : ""
                                    }`
                                  : "You're all caught up"}
                              </p>
                            </div>

                            <Bell className="h-5 w-5 text-indigo-500" />
                          </div>

                          <div className="max-h-[320px] overflow-y-auto">
                            {notificationItems.length >
                            0 ? (
                              notificationItems.map(
                                (notification) => (
                                  <button
                                    key={
                                      notification._id ||
                                      notification.id
                                    }
                                    type="button"
                                    onClick={() => {
                                      closeMenus();
                                      navigate(
                                        "/dashboard/notifications"
                                      );
                                    }}
                                    className="flex w-full gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                                  >
                                    <div
                                      className={cn(
                                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                        notification.isRead
                                          ? "bg-gray-100"
                                          : "bg-indigo-50"
                                      )}
                                    >
                                      <Bell
                                        className={cn(
                                          "h-4 w-4",
                                          notification.isRead
                                            ? "text-gray-400"
                                            : "text-indigo-600"
                                        )}
                                      />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="truncate text-sm font-semibold text-gray-800">
                                          {notification.title ||
                                            "Notification"}
                                        </p>

                                        <span className="shrink-0 text-[10px] text-gray-400">
                                          {getNotificationTime(
                                            notification
                                          )}
                                        </span>
                                      </div>

                                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                                        {notification.message ||
                                          "You have a new notification."}
                                      </p>
                                    </div>
                                  </button>
                                )
                              )
                            ) : (
                              <div className="px-5 py-10 text-center">
                                <Bell className="mx-auto h-7 w-7 text-gray-300" />

                                <p className="mt-3 text-sm font-semibold text-gray-700">
                                  No notifications
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  You're all caught up.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-100 p-3">
                            <button
                              type="button"
                              onClick={() => {
                                closeMenus();
                                navigate(
                                  "/dashboard/notifications"
                                );
                              }}
                              className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                            >
                              View All Notifications
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div
                    ref={userMenuRef}
                    className="relative"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenu(
                          (value) => !value
                        );
                        setNotificationMenu(false);
                      }}
                      aria-label="User menu"
                      aria-expanded={userMenu}
                      className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                    >
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-indigo-600">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {getInitial()}
                          </span>
                        )}
                      </div>

                      <ChevronDown
                        className={cn(
                          "hidden h-4 w-4 text-gray-400 transition-transform sm:block",
                          userMenu && "rotate-180"
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {userMenu && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: 8,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                          className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                        >
                          <div className="border-b border-gray-100 px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-600">
                                {user?.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={
                                      user.name ||
                                      "User"
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="font-bold text-white">
                                    {getInitial()}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-gray-900">
                                  {user?.name ||
                                    "User"}
                                </p>

                                <p className="truncate text-xs text-gray-500">
                                  {user?.email || ""}
                                </p>

                                {isAdmin && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
                                    <Shield className="h-3 w-3" />
                                    Administrator
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-1.5">
                            <Link
                              to="/dashboard"
                              onClick={closeMenus}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <LayoutDashboard className="h-4 w-4 text-gray-400" />
                              Dashboard
                            </Link>

                            <Link
                              to="/dashboard/bookings"
                              onClick={closeMenus}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Calendar className="h-4 w-4 text-gray-400" />
                              My Bookings
                            </Link>

                            <Link
                              to="/dashboard/profile"
                              onClick={closeMenus}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <User className="h-4 w-4 text-gray-400" />
                              Profile
                            </Link>

                            <Link
                              to="/dashboard/favorites"
                              onClick={closeMenus}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Heart className="h-4 w-4 text-gray-400" />
                              Favorites
                            </Link>

                            <Link
                              to="/dashboard/settings"
                              onClick={closeMenus}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Settings className="h-4 w-4 text-gray-400" />
                              Settings
                            </Link>

                            {isAdmin && (
                              <>
                                <div className="my-1 border-t border-gray-100" />

                                <Link
                                  to="/admin"
                                  onClick={closeMenus}
                                  className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                                >
                                  <Shield className="h-4 w-4" />
                                  Admin Panel
                                </Link>
                              </>
                            )}

                            <div className="my-1 border-t border-gray-100" />

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(
                    (value) => !value
                  );
                  setUserMenu(false);
                  setNotificationMenu(false);
                }}
                aria-label={
                  mobileOpen
                    ? "Close menu"
                    : "Open menu"
                }
                aria-expanded={mobileOpen}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
                ease: "easeInOut",
              }}
              className="border-t border-gray-100 bg-white md:hidden"
            >
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                <Link
                  to="/experiences"
                  onClick={closeMenus}
                  className="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-500"
                >
                  <Search className="h-4 w-4" />
                  Search experiences
                </Link>

                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeMenus}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium",
                        isActive(link.to)
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {link.label}

                      {isActive(link.to) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      )}
                    </Link>
                  ))}
                </div>

                {isAuthenticated ? (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="mb-3 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-indigo-600">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={
                              user.name || "User"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-white">
                            {getInitial()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {user?.name || "User"}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-400" />
                        Dashboard
                      </Link>

                      <Link
                        to="/dashboard/bookings"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Calendar className="h-4 w-4 text-gray-400" />
                        My Bookings
                      </Link>

                      <Link
                        to="/dashboard/profile"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Profile
                      </Link>

                      <Link
                        to="/dashboard/favorites"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Heart className="h-4 w-4 text-gray-400" />
                        Favorites
                      </Link>

                      <Link
                        to="/dashboard/notifications"
                        onClick={closeMenus}
                        className="flex items-center justify-between rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-gray-400" />
                          Notifications
                        </span>

                        {unreadCount > 0 && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {unreadCount > 9
                              ? "9+"
                              : unreadCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        Settings
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-600"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
                    <Link
                      to="/login"
                      onClick={closeMenus}
                      className="rounded-lg border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMenus}
                      className="rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-[72px]" />
    </>
  );
};

export default Navbar;