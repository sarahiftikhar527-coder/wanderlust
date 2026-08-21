import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Compass,
  Tags,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Activity,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import { cn } from "../utils/helpers";

const AdminLayout = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links = useMemo(
    () => [
      {
        to: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Overview & analytics",
      },
      {
        to: "/admin/experiences",
        label: "Experiences",
        icon: Compass,
        description: "Manage experiences",
      },
      {
        to: "/admin/categories",
        label: "Categories",
        icon: Tags,
        description: "Organize categories",
      },
      {
        to: "/admin/bookings",
        label: "Bookings",
        icon: Calendar,
        description: "Manage reservations",
      },
      {
        to: "/admin/users",
        label: "Users",
        icon: Users,
        description: "Manage customers",
      },
      {
        to: "/admin/contacts",
        label: "Contacts",
        icon: MessageSquare,
        description: "Manage contact messages",
      },
      {
        to: "/admin/settings",
        label: "Settings",
        icon: Settings,
        description: "System preferences",
      },
    ],
    []
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
      console.error("Admin logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, logout, navigate]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const adminInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "A";

  const displayName = user?.name || "Administrator";
  const displayEmail = user?.email || "Admin Account";

  return (
    <div className="relative min-h-screen bg-[#f5f7fb] text-slate-900">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close admin sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-40 cursor-default bg-slate-950/70 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[285px] overflow-hidden",
          "border-r border-white/[0.07]",
          "bg-[#080a12]",
          "shadow-[25px_0_80px_rgba(2,6,23,0.18)]",
          "transition-transform duration-500",
          "ease-[cubic-bezier(0.22,1,0.36,1)]",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/10 blur-[110px]"
          />

          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-36 top-1/3 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]"
          />

          <motion.div
            animate={{
              x: [0, 25, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[-180px] left-1/3 h-96 w-96 rounded-full bg-blue-600/[0.07] blur-[120px]"
          />
        </div>

        <div className="relative flex h-full flex-col">
          <div className="border-b border-white/[0.06] px-5 pb-5 pt-5">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="group flex min-w-0 items-center gap-3"
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
                    damping: 16,
                  }}
                  className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-blue-700 shadow-[0_10px_35px_rgba(99,102,241,0.32)]"
                >
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 14,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-[5px] rounded-xl border border-white/20"
                  />

                  <motion.div
                    animate={{
                      scale: [1, 1.35, 1],
                      opacity: [0.15, 0, 0.15],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-2xl bg-white"
                  />

                  <div className="absolute -right-4 -top-4 h-10 w-10 rounded-full bg-white/20 blur-xl" />

                  <Shield
                    className="relative z-10 h-5 w-5 text-white"
                    strokeWidth={2.4}
                  />
                </motion.div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[18px] font-black tracking-tight text-white">
                      Wanderlust
                    </span>
                  </div>

                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    Admin Studio
                  </span>
                </div>
              </Link>

              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={closeSidebar}
                className="rounded-xl p-2 text-slate-500 transition-all hover:bg-white/[0.06] hover:text-white lg:hidden"
                aria-label="Close admin sidebar"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          <div className="relative px-4 py-5">
            <motion.div
              whileHover={{
                y: -2,
                scale: 1.01,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5"
            >
              <motion.div
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.035] to-transparent"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-violet-500/[0.06]" />

              <div className="relative flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 ring-1 ring-white/10"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-sm font-black text-white">
                        {adminInitial}
                      </span>
                    )}
                  </motion.div>

                  <motion.span
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [0.9, 1.1, 0.9],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#080a12] bg-indigo-400"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {displayName}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {displayEmail}
                  </p>
                </div>

                <motion.div
                  whileHover={{
                    rotate: 10,
                    scale: 1.08,
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]"
                >
                  <Shield className="h-3.5 w-3.5 text-violet-400" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          <nav
            className="sidebar-scroll relative flex-1 overflow-y-auto px-3 pb-4"
            aria-label="Admin navigation"
          >
            <div className="mb-3 px-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                Workspace
              </span>
            </div>

            <div className="space-y-1.5">
              {links.map((link, index) => {
                const active = isActive(link.to);
                const Icon = link.icon;

                return (
                  <motion.div
                    key={link.to}
                    initial={{
                      opacity: 0,
                      x: -18,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.055,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      to={link.to}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5",
                        "transition-all duration-300",
                        active
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-100"
                      )}
                    >
                      {active ? (
                        <motion.div
                          layoutId="adminActiveBackground"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/95 via-violet-600/75 to-blue-600/45 shadow-[0_10px_30px_rgba(79,70,229,0.2)]"
                        />
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 rounded-xl bg-white/[0.035]"
                        />
                      )}

                      {active && (
                        <motion.div
                          layoutId="adminActiveLine"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                          className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.8)]"
                        />
                      )}

                      <motion.div
                        whileHover={{
                          scale: 1.08,
                          rotate: 3,
                        }}
                        whileTap={{
                          scale: 0.94,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                        }}
                        className={cn(
                          "relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                          active
                            ? "bg-white/[0.13] text-white shadow-[0_5px_18px_rgba(255,255,255,0.06)]"
                            : "bg-white/[0.035] text-slate-500 group-hover:bg-white/[0.08] group-hover:text-slate-200"
                        )}
                      >
                        <Icon
                          className="h-[17px] w-[17px]"
                          strokeWidth={2}
                        />
                      </motion.div>

                      <div className="relative z-10 min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">
                          {link.label}
                        </p>

                        <p
                          className={cn(
                            "mt-0.5 truncate text-[10px] transition-colors",
                            active
                              ? "text-indigo-100/70"
                              : "text-slate-600 group-hover:text-slate-500"
                          )}
                        >
                          {link.description}
                        </p>
                      </div>

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
                        <ChevronRight className="h-4 w-4 text-white/70" />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="my-6 h-px bg-white/[0.05]" />

            <div className="mb-3 px-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
                Quick Access
              </span>
            </div>

            <motion.div whileHover={{ x: 3 }}>
              <Link
                to="/admin"
                className="group mb-1.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 transition-all duration-300 hover:bg-white/[0.035] hover:text-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] transition-all group-hover:bg-white/[0.08]">
                  <BarChart3 className="h-4 w-4" />
                </div>

                <span className="flex-1 text-[13px] font-semibold">
                  Analytics
                </span>

                <ChevronRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ x: 3 }}>
              <Link
                to="/admin"
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 transition-all duration-300 hover:bg-white/[0.035] hover:text-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] transition-all group-hover:bg-white/[0.08]">
                  <Activity className="h-4 w-4" />
                </div>

                <span className="flex-1 text-[13px] font-semibold">
                  System Status
                </span>

                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                  <motion.span
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />
                  Online
                </span>
              </Link>
            </motion.div>
          </nav>

          <div className="relative border-t border-white/[0.06] p-3">
            <motion.div whileHover={{ x: 3 }}>
              <Link
                to="/dashboard"
                className="group mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 transition-all duration-300 hover:bg-white/[0.045] hover:text-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] transition-all group-hover:bg-white/[0.08]">
                  <ExternalLink className="h-4 w-4" />
                </div>

                <span className="flex-1 text-[13px] font-semibold">
                  User Dashboard
                </span>

                <ChevronRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </motion.div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              disabled={loggingOut}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 transition-all duration-300 hover:bg-rose-500/[0.07] hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] transition-all group-hover:bg-rose-500/10">
                <LogOut className="h-4 w-4" />
              </div>

              <span className="text-[13px] font-semibold">
                {loggingOut ? "Signing out..." : "Sign out"}
              </span>
            </motion.button>
          </div>
        </div>
      </aside>

      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col lg:ml-[285px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-2xl lg:hidden">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition-colors hover:bg-slate-200"
            aria-label="Open admin sidebar"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </motion.button>

          <div className="flex items-center gap-2.5">
            <motion.div
              whileTap={{ scale: 0.94 }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-600 shadow-[0_6px_20px_rgba(99,102,241,0.25)]"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-xl bg-white"
              />

              <Shield className="relative z-10 h-4 w-4 text-white" />
            </motion.div>

            <div>
              <p className="text-sm font-black leading-none text-slate-900">
                Admin Studio
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-slate-400">
                Wanderlust
              </p>
            </div>
          </div>

          <motion.div
            animate={{
              rotate: [0, 8, 0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex h-10 w-10 items-center justify-center"
          >
            <Zap className="h-5 w-5 text-indigo-500" />
          </motion.div>
        </header>

        <motion.main
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative min-w-0 flex-1"
        >
          <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </motion.main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0b0d16",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "13px 16px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 20px 60px rgba(15,23,42,0.22)",
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
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.16) transparent;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.16);
          border-radius: 999px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.28);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;