import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Heart,
  Calendar,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  ChevronRight,
  ExternalLink,
  Map,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { Toaster } from "react-hot-toast";
import { cn } from "../utils/helpers";

const DashboardLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links = useMemo(
    () => [
      {
        to: "/dashboard",
        label: "Overview",
        description: "Your travel overview",
        icon: LayoutDashboard,
      },
      {
        to: "/dashboard/bookings",
        label: "My Bookings",
        description: "Your reservations",
        icon: Calendar,
      },
      {
        to: "/dashboard/favorites",
        label: "Favorites",
        description: "Saved experiences",
        icon: Heart,
      },
      {
        to: "/dashboard/notifications",
        label: "Notifications",
        description: "Updates & alerts",
        icon: Bell,
        badge: unreadCount,
      },
      {
        to: "/dashboard/profile",
        label: "Profile",
        description: "Personal information",
        icon: User,
      },
      {
        to: "/dashboard/settings",
        label: "Settings",
        description: "Account preferences",
        icon: Settings,
      },
    ],
    [unreadCount]
  );

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen, closeSidebar]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Dashboard logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, logout, navigate]);

  const isActive = useCallback(
    (path) => {
      if (path === "/dashboard") {
        return location.pathname === "/dashboard";
      }

      return (
        location.pathname === path ||
        location.pathname.startsWith(`${path}/`)
      );
    },
    [location.pathname]
  );

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const displayName = user?.name || "Traveler";
  const displayEmail = user?.email || "Welcome back";

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 overflow-x-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[280px]",
          "bg-[#080a12] text-slate-300",
          "border-r border-white/[0.07]",
          "shadow-[20px_0_70px_rgba(2,6,23,0.18)]",
          "overflow-hidden",
          "transform transition-transform duration-500",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              x: [0, 35, 0],
              y: [0, 25, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-32 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-[100px]"
          />

          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 30, 0],
              scale: [1, 1.12, 1],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-violet-600/10 blur-[110px]"
          />

          <motion.div
            animate={{
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-32 left-10 w-72 h-72 rounded-full bg-fuchsia-600/[0.07] blur-[100px]"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.07),transparent_35%)]" />
        </div>

        <div className="relative h-full flex flex-col">
          <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-3 group min-w-0"
              >
                <motion.div
                  whileHover={{
                    scale: 1.08,
                    rotate: -5,
                  }}
                  whileTap={{
                    scale: 0.94,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  }}
                  className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_8px_30px_rgba(99,102,241,0.35)]"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-2xl bg-indigo-400"
                  />

                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 16,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Compass
                      className="relative z-10 w-5 h-5 text-white"
                      strokeWidth={2.4}
                    />
                  </motion.div>
                </motion.div>

                <div className="min-w-0">
                  <div className="flex items-center">
                    <span className="font-display font-black text-[18px] tracking-tight text-white truncate">
                      Wanderlust
                    </span>
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">
                    Travel Dashboard
                  </span>
                </div>
              </Link>

              <motion.button
                type="button"
                onClick={closeSidebar}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.92,
                }}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.07] transition-all"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="relative p-4">
            <motion.div
              whileHover={{
                y: -3,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
            >
              <motion.div
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-12"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-violet-500/[0.07]" />

              <div className="relative flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <motion.div
                    whileHover={{
                      scale: 1.06,
                    }}
                    className="w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center ring-1 ring-white/10 shadow-lg"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span className="text-white text-sm font-black">
                        {userInitial}
                      </span>
                    )}
                  </motion.div>

                  <motion.span
                    animate={{
                      opacity: [0.45, 1, 0.45],
                      scale: [0.9, 1, 0.9],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-indigo-400 border-2 border-[#10121d]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">
                    {displayName}
                  </p>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {displayEmail}
                  </p>
                </div>

                <motion.div
                  whileHover={{
                    rotate: 8,
                    scale: 1.08,
                  }}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          <nav
            className="relative flex-1 px-3 pb-4 overflow-y-auto dashboard-sidebar-scroll"
            aria-label="Dashboard navigation"
          >
            <div className="px-3 mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
                My Space
              </span>
            </div>

            <div className="space-y-1.5">
              {links.map((link, index) => {
                const Icon = link.icon;
                const active = isActive(link.to);

                return (
                  <motion.div
                    key={link.to}
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.055,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      to={link.to}
                      aria-current={
                        active ? "page" : undefined
                      }
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl group overflow-hidden",
                        "transition-all duration-300",
                        active
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-100"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="dashboardActiveBackground"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/90 via-indigo-600/70 to-violet-600/50 shadow-[0_8px_25px_rgba(79,70,229,0.2)]"
                        />
                      )}

                      {!active && (
                        <div className="absolute inset-0 rounded-xl bg-white/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      )}

                      {active && (
                        <motion.div
                          layoutId="dashboardActiveLine"
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.85)]"
                        />
                      )}

                      <motion.div
                        whileHover={{
                          scale: 1.08,
                          rotate: 2,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                        }}
                        className={cn(
                          "relative z-10 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                          active
                            ? "bg-white/[0.12] text-white"
                            : "bg-white/[0.035] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-200"
                        )}
                      >
                        <Icon
                          className="w-[17px] h-[17px]"
                          strokeWidth={2}
                        />
                      </motion.div>

                      <div className="relative z-10 flex-1 min-w-0">
                        <p className="text-[13px] font-semibold truncate">
                          {link.label}
                        </p>

                        <p
                          className={cn(
                            "text-[10px] mt-0.5 truncate transition-colors",
                            active
                              ? "text-indigo-100/70"
                              : "text-slate-600 group-hover:text-slate-500"
                          )}
                        >
                          {link.description}
                        </p>
                      </div>

                      {link.badge > 0 && (
                        <motion.span
                          initial={{
                            scale: 0,
                          }}
                          animate={{
                            scale: 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 20,
                          }}
                          className="relative z-10 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-[0_4px_12px_rgba(244,63,94,0.3)]"
                          aria-label={`${link.badge} unread notifications`}
                        >
                          {link.badge > 9
                            ? "9+"
                            : link.badge}
                        </motion.span>
                      )}

                      <motion.div
                        initial={false}
                        animate={{
                          x: active ? 0 : -5,
                          opacity: active ? 1 : 0,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className="relative z-10"
                      >
                        <ChevronRight className="w-4 h-4 text-white/70" />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          <div className="relative p-3 border-t border-white/[0.06] space-y-1">
            <Link
              to="/"
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.045] transition-all duration-300"
            >
              <motion.div
                whileHover={{
                  scale: 1.08,
                }}
                className="w-9 h-9 rounded-xl bg-white/[0.035] group-hover:bg-white/[0.08] flex items-center justify-center transition-all"
              >
                <ExternalLink className="w-[16px] h-[16px]" />
              </motion.div>

              <span className="flex-1 text-[13px] font-semibold">
                Explore Wanderlust
              </span>

              <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>

            <Link
              to="/experiences"
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.045] transition-all duration-300"
            >
              <motion.div
                whileHover={{
                  scale: 1.08,
                }}
                className="w-9 h-9 rounded-xl bg-white/[0.035] group-hover:bg-white/[0.08] flex items-center justify-center transition-all"
              >
                <Map className="w-[16px] h-[16px]" />
              </motion.div>

              <span className="flex-1 text-[13px] font-semibold">
                Discover Experiences
              </span>

              <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>

            <motion.button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              whileHover={{
                x: 2,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-300 hover:bg-rose-500/[0.07] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <motion.div
                animate={
                  loggingOut
                    ? {
                        rotate: [0, -10, 10, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 0.5,
                  repeat: loggingOut ? Infinity : 0,
                }}
                className="w-9 h-9 rounded-xl bg-white/[0.035] group-hover:bg-rose-500/10 flex items-center justify-center transition-all"
              >
                <LogOut className="w-[16px] h-[16px]" />
              </motion.div>

              <span className="text-[13px] font-semibold">
                {loggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </span>
            </motion.button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen flex-1 min-w-0 lg:ml-[280px]">
        <header className="lg:hidden sticky top-0 z-30 h-[68px] bg-white/85 backdrop-blur-2xl border-b border-slate-200/70 px-4 flex items-center justify-between shadow-sm">
          <motion.button
            type="button"
            whileTap={{
              scale: 0.9,
            }}
            whileHover={{
              scale: 1.04,
            }}
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Open dashboard sidebar"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </motion.button>

          <Link
            to="/"
            className="flex items-center gap-2.5"
          >
            <motion.div
              whileTap={{
                scale: 0.94,
              }}
              whileHover={{
                rotate: -4,
                scale: 1.05,
              }}
              className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-[0_6px_20px_rgba(99,102,241,0.25)]"
            >
              <Compass className="w-4 h-4 text-white" />
            </motion.div>

            <div>
              <p className="text-sm font-black text-slate-900 leading-none">
                Wanderlust
              </p>

              <p className="text-[9px] uppercase tracking-[0.16em] text-slate-400 mt-1">
                Traveler Space
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/notifications"
            className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
          >
            <motion.div
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              <Bell className="w-5 h-5 text-slate-600" />
            </motion.div>

            {unreadCount > 0 && (
              <>
                <motion.span
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500"
                />

                <motion.span
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                  }}
                  className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center"
                >
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </motion.span>
              </>
            )}
          </Link>
        </header>

        <motion.main
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="min-h-screen"
        >
          <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <Outlet />
          </div>
        </motion.main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "13px 16px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow:
              "0 20px 50px rgba(15,23,42,0.18)",
          },
          success: {
            iconTheme: {
              primary: "#8b5cf6",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#fff",
            },
          },
        }}
      />

      <style>{`
        .dashboard-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.16) transparent;
        }

        .dashboard-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .dashboard-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .dashboard-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.16);
          border-radius: 999px;
        }

        .dashboard-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.28);
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;