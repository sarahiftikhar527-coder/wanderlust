import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Compass,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  UserPlus,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

import { adminService } from "../../api/services";
import { formatCurrency, formatDate } from "../../utils/helpers";

/* =========================================================
   COLORS
========================================================= */

const STATUS_COLORS = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
  REJECTED: "#8b5cf6",
};

const DEFAULT_PIE_COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

const getStatusColor = (status, index = 0) => {
  const normalized = String(status || "UNKNOWN").toUpperCase();

  return (
    STATUS_COLORS[normalized] ||
    DEFAULT_PIE_COLORS[index % DEFAULT_PIE_COLORS.length]
  );
};

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const getResponseData = (response) => {
  /*
    Handles common API response structures:

    1.
    {
      data: {
        users: {...}
      }
    }

    2.
    {
      data: {
        data: {
          users: {...}
        }
      }
    }

    3.
    {
      success: true,
      data: {
        users: {...}
      }
    }
  */

  const root = response?.data;

  if (!root) {
    return {};
  }

  if (root?.data?.data) {
    return root.data.data;
  }

  if (root?.data) {
    return root.data;
  }

  return root;
};

const normalizeStats = (raw = {}) => {
  /*
    Backend getAdminStats():

    {
      users: {
        total,
        active
      },
      experiences: {
        total,
        published
      },
      bookings: {
        total
      },
      categories: {
        total
      },
      revenue: {
        total
      }
    }
  */

  const users = raw?.users || {};
  const experiences = raw?.experiences || {};
  const bookings = raw?.bookings || {};
  const categories = raw?.categories || {};
  const revenue = raw?.revenue || {};

  return {
    ...raw,

    totalUsers: Number(
      raw?.totalUsers ??
        users?.total ??
        0
    ),

    activeUsers: Number(
      raw?.activeUsers ??
        users?.active ??
        0
    ),

    inactiveUsers: Number(
      raw?.inactiveUsers ??
        users?.inactive ??
        0
    ),

    totalExperiences: Number(
      raw?.totalExperiences ??
        experiences?.total ??
        0
    ),

    publishedExperiences: Number(
      raw?.publishedExperiences ??
        experiences?.published ??
        0
    ),

    draftExperiences: Number(
      raw?.draftExperiences ??
        experiences?.draft ??
        0
    ),

    archivedExperiences: Number(
      raw?.archivedExperiences ??
        experiences?.archived ??
        0
    ),

    totalBookings: Number(
      raw?.totalBookings ??
        bookings?.total ??
        0
    ),

    totalCategories: Number(
      raw?.totalCategories ??
        categories?.total ??
        0
    ),

    totalRevenue: Number(
      raw?.totalRevenue ??
        revenue?.total ??
        0
    ),

    monthlyRevenue:
      raw?.monthlyRevenue ??
      revenue?.monthly ??
      [],

    bookingsByStatus:
      raw?.bookingsByStatus ??
      bookings?.byStatus ??
      [],

    experiencesByCategory:
      raw?.experiencesByCategory ??
      [],

    recentUsers:
      Array.isArray(raw?.recentUsers)
        ? raw.recentUsers
        : [],

    recentBookings:
      Array.isArray(raw?.recentBookings)
        ? raw.recentBookings
        : [],
  };
};

/* =========================================================
   DATE / MONTH HELPERS
========================================================= */

const formatMonth = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  if (/^\d{4}-\d{2}$/.test(stringValue)) {
    const [year, month] = stringValue.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    if (Number.isNaN(date.getTime())) {
      return stringValue;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
    });
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    const date = new Date(stringValue);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
      });
    }
  }

  return stringValue;
};

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH STATS
  ======================================================= */

  const fetchStats = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await adminService.getStats();

        const responseData =
          getResponseData(response);

        const normalizedStats =
          normalizeStats(responseData);

        console.log(
          "Admin stats response:",
          response
        );

        console.log(
          "Normalized admin stats:",
          normalizedStats
        );

        setStats(normalizedStats);
      } catch (err) {
        console.error(
          "Admin dashboard error:",
          err
        );

        const status =
          err?.response?.status;

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message;

        if (status === 403) {
          setError(
            "Admin access required. Please make sure the logged-in account has the ADMIN role."
          );
        } else if (status === 401) {
          setError(
            "Your session has expired. Please log in again."
          );
        } else if (
          !err?.response
        ) {
          setError(
            "Unable to connect to the server. Make sure the Wanderlust backend is running on port 5000."
          );
        } else {
          setError(
            message ||
              "Unable to load dashboard statistics."
          );
        }

        setStats(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* =======================================================
     STAT CARDS
  ======================================================= */

  const statCards = useMemo(() => {
    const safeStats = stats || {};

    return [
      {
        icon: Users,
        label: "Total Users",
        value: Number(
          safeStats.totalUsers || 0
        ),
        description: `${
          safeStats.activeUsers || 0
        } active users`,
        iconClass:
          "bg-primary-50 text-primary-600",
      },

      {
        icon: Compass,
        label: "Experiences",
        value: Number(
          safeStats.totalExperiences || 0
        ),
        description: `${
          safeStats.publishedExperiences ||
          0
        } published`,
        iconClass:
          "bg-secondary-50 text-secondary-600",
      },

      {
        icon: Calendar,
        label: "Total Bookings",
        value: Number(
          safeStats.totalBookings || 0
        ),
        description:
          "Customer reservations",
        iconClass:
          "bg-accent-50 text-accent-600",
      },

      {
        icon: DollarSign,
        label: "Revenue",
        value: formatCurrency(
          Number(
            safeStats.totalRevenue || 0
          )
        ),
        description:
          "Total booking revenue",
        iconClass:
          "bg-emerald-50 text-emerald-600",
      },
    ];
  }, [stats]);

  /* =======================================================
     MONTHLY REVENUE
  ======================================================= */

  const monthlyRevenue = useMemo(() => {
    if (
      !Array.isArray(
        stats?.monthlyRevenue
      )
    ) {
      return [];
    }

    return stats.monthlyRevenue
      .map((item) => {
        const rawMonth =
          item?._id ??
          item?.month ??
          "";

        return {
          month:
            formatMonth(rawMonth),

          revenue: Number(
            item?.revenue || 0
          ),

          bookings: Number(
            item?.count ??
              item?.bookings ??
              0
          ),
        };
      })
      .filter(
        (item) => item.month
      );
  }, [stats]);

  /* =======================================================
     BOOKINGS BY STATUS
  ======================================================= */

  const bookingsByStatus = useMemo(() => {
    if (
      !Array.isArray(
        stats?.bookingsByStatus
      )
    ) {
      return [];
    }

    return stats.bookingsByStatus
      .map((item) => ({
        name: String(
          item?._id ??
            item?.status ??
            "UNKNOWN"
        ).toUpperCase(),

        value: Number(
          item?.count ??
            item?.value ??
            0
        ),
      }))
      .filter(
        (item) => item.value > 0
      );
  }, [stats]);

  /* =======================================================
     EXPERIENCES BY CATEGORY
  ======================================================= */

  const experiencesByCategory =
    useMemo(() => {
      if (
        !Array.isArray(
          stats?.experiencesByCategory
        )
      ) {
        return [];
      }

      return stats.experiencesByCategory
        .map((item) => ({
          name:
            item?.name ||
            item?.categoryName ||
            item?._id ||
            "Uncategorized",

          count: Number(
            item?.count ??
              item?.value ??
              0
          ),
        }))
        .filter(
          (item) => item.count > 0
        );
    }, [stats]);

  /* =======================================================
     TOTAL STATUS BOOKINGS
  ======================================================= */

  const totalStatusBookings =
    useMemo(() => {
      return bookingsByStatus.reduce(
        (sum, item) =>
          sum +
          Number(
            item.value || 0
          ),
        0
      );
    }, [bookingsByStatus]);

  /* =======================================================
     RECENT USERS
  ======================================================= */

  const recentUsers = useMemo(() => {
    if (
      !Array.isArray(
        stats?.recentUsers
      )
    ) {
      return [];
    }

    return stats.recentUsers.slice(
      0,
      5
    );
  }, [stats]);

  /* =======================================================
     RECENT BOOKINGS
  ======================================================= */

  const recentBookings = useMemo(() => {
    if (
      !Array.isArray(
        stats?.recentBookings
      )
    ) {
      return [];
    }

    return stats.recentBookings.slice(
      0,
      5
    );
  }, [stats]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <DashboardSkeleton />;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Platform overview and
            performance statistics.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchStats(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </motion.div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" />

            <div className="flex-1">
              <p className="font-semibold">
                Dashboard unavailable
              </p>

              <p className="mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  fetchStats()
                }
                className="mt-3 inline-flex items-center gap-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(
          (stat, index) => {
            const Icon =
              stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay:
                    index * 0.06,
                }}
                whileHover={{
                  y: -3,
                }}
                className="relative card p-5"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconClass}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <TrendingUp className="w-4 h-4 text-gray-300" />
                </div>

                <p className="font-display font-extrabold text-xl sm:text-2xl truncate">
                  {stat.value}
                </p>

                <p className="text-sm font-medium text-gray-700 mt-1">
                  {stat.label}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {stat.description}
                </p>
              </motion.div>
            );
          }
        )}
      </div>

      {/* =================================================
          REVENUE + BOOKING STATUS
      ================================================= */}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* MONTHLY REVENUE */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="relative card p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary-600" />
                </div>

                <h2 className="font-display font-bold text-lg">
                  Monthly Revenue
                </h2>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Revenue generated from
                bookings
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">
                Total
              </p>

              <p className="font-bold text-primary-600">
                {formatCurrency(
                  Number(
                    stats?.totalRevenue ||
                      0
                  )
                )}
              </p>
            </div>
          </div>

          {monthlyRevenue.length >
          0 ? (
            <div className="w-full h-[260px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={
                    monthlyRevenue
                  }
                  margin={{
                    top: 10,
                    right: 10,
                    left: -10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#1c7bf5"
                        stopOpacity={
                          0.28
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#1c7bf5"
                        stopOpacity={
                          0
                        }
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f3f4f6"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 11,
                    }}
                    stroke="#9ca3af"
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                    }}
                    stroke="#9ca3af"
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                    tickFormatter={(
                      value
                    ) =>
                      formatCurrency(
                        value
                      )
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius:
                        "12px",
                      border:
                        "1px solid #f3f4f6",
                      fontSize:
                        "13px",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                    formatter={(
                      value
                    ) => [
                      formatCurrency(
                        Number(
                          value || 0
                        )
                      ),
                      "Revenue",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1c7bf5"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    activeDot={{
                      r: 5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart
              icon={BarChart3}
              title="No revenue data"
              description="Revenue statistics will appear here once bookings are available."
            />
          )}
        </motion.div>

        {/* BOOKING STATUS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="relative card p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-secondary-50 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4 text-secondary-600" />
                </div>

                <h2 className="font-display font-bold text-lg">
                  Bookings by Status
                </h2>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Current reservation
                distribution
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">
                Total
              </p>

              <p className="font-bold">
                {totalStatusBookings}
              </p>
            </div>
          </div>

          {bookingsByStatus.length >
          0 ? (
            <>
              <div className="w-full h-[220px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        bookingsByStatus
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {bookingsByStatus.map(
                        (
                          item,
                          index
                        ) => (
                          <Cell
                            key={`${item.name}-${index}`}
                            fill={getStatusColor(
                              item.name,
                              index
                            )}
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        borderRadius:
                          "12px",
                        border:
                          "1px solid #f3f4f6",
                        fontSize:
                          "13px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {bookingsByStatus.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.name}-legend`}
                      className="flex items-center gap-1.5"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            getStatusColor(
                              item.name,
                              index
                            ),
                        }}
                      />

                      <span className="text-xs text-gray-500">
                        {item.name} (
                        {
                          item.value
                        }
                        )
                      </span>
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <EmptyChart
              icon={PieChartIcon}
              title="No booking data"
              description="Booking status statistics will appear here."
            />
          )}
        </motion.div>
      </div>

      {/* =================================================
          EXPERIENCES BY CATEGORY
      ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.3,
        }}
        className="relative card p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-accent-50 flex items-center justify-center">
                <Compass className="w-4 h-4 text-accent-600" />
              </div>

              <h2 className="font-display font-bold text-lg">
                Experiences by
                Category
              </h2>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Distribution of
              experiences across
              categories
            </p>
          </div>

          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:underline"
          >
            Manage Categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {experiencesByCategory.length >
        0 ? (
          <div className="w-full h-[280px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  experiencesByCategory
                }
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f3f4f6"
                  vertical={
                    false
                  }
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                  }}
                  stroke="#9ca3af"
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  interval={0}
                  angle={
                    experiencesByCategory.length >
                    5
                      ? -25
                      : 0
                  }
                  textAnchor={
                    experiencesByCategory.length >
                    5
                      ? "end"
                      : "middle"
                  }
                />

                <YAxis
                  allowDecimals={
                    false
                  }
                  tick={{
                    fontSize: 11,
                  }}
                  stroke="#9ca3af"
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                />

                <Tooltip
                  contentStyle={{
                    borderRadius:
                      "12px",
                    border:
                      "1px solid #f3f4f6",
                    fontSize:
                      "13px",
                  }}
                  formatter={(
                    value
                  ) => [
                    Number(
                      value || 0
                    ),
                    "Experiences",
                  ]}
                />

                <Bar
                  dataKey="count"
                  fill="#1c7bf5"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  maxBarSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart
            icon={Compass}
            title="No experience data"
            description="Create experiences to see category statistics."
          />
        )}
      </motion.div>

      {/* =================================================
          RECENT USERS + RECENT BOOKINGS
      ================================================= */}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* RECENT USERS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.35,
          }}
          className="relative card p-5"
        >
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display font-bold text-lg">
                Recent Users
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Latest registered
                users
              </p>
            </div>

            <Link
              to="/admin/users"
              className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1 flex-shrink-0"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentUsers.length >
          0 ? (
            <div className="space-y-2">
              {recentUsers.map(
                (
                  user,
                  index
                ) => {
                  const initial =
                    user?.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                    "U";

                  const isAdmin =
                    String(
                      user?.role ||
                        ""
                    ).toUpperCase() ===
                    "ADMIN";

                  return (
                    <motion.div
                      key={
                        user?._id ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          0.4 +
                          index *
                            0.04,
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                        {user?.avatar ? (
                          <img
                            src={
                              user.avatar
                            }
                            alt={
                              user?.name ||
                              "User"
                            }
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span className="text-white text-sm font-bold">
                            {initial}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {user?.name ||
                            "Unknown User"}
                        </p>

                        <p className="text-xs text-gray-500 truncate">
                          {user?.email ||
                            "No email"}
                        </p>
                      </div>

                      <span
                        className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isAdmin
                            ? "bg-primary-100 text-primary-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user?.role ||
                          "USER"}
                      </span>
                    </motion.div>
                  );
                }
              )}
            </div>
          ) : (
            <EmptyList
              icon={UserPlus}
              title="No recent users"
              description="New users will appear here."
            />
          )}
        </motion.div>

        {/* RECENT BOOKINGS */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
          }}
          className="relative card p-5"
        >
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display font-bold text-lg">
                Recent Bookings
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Latest customer
                reservations
              </p>
            </div>

            <Link
              to="/admin/bookings"
              className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1 flex-shrink-0"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentBookings.length >
          0 ? (
            <div className="space-y-2">
              {recentBookings.map(
                (
                  booking,
                  index
                ) => {
                  const status =
                    String(
                      booking?.status ||
                        "PENDING"
                    ).toUpperCase();

                  const experienceTitle =
                    booking?.experienceTitle ||
                    booking?.experience
                      ?.title ||
                    booking?.experience
                      ?.name ||
                    "Experience";

                  const userName =
                    booking?.user
                      ?.name ||
                    booking?.userName ||
                    "Unknown User";

                  const totalPrice =
                    booking?.totalPrice ??
                    booking?.totalAmount ??
                    booking?.amount ??
                    0;

                  return (
                    <motion.div
                      key={
                        booking?._id ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        x: 10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          0.45 +
                          index *
                            0.04,
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-accent-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {
                            experienceTitle
                          }
                        </p>

                        <p className="text-xs text-gray-500 truncate">
                          {userName}{" "}
                          ·{" "}
                          {booking?.createdAt
                            ? formatDate(
                                booking.createdAt
                              )
                            : "—"}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold">
                          {formatCurrency(
                            Number(
                              totalPrice ||
                                0
                            )
                          )}
                        </p>

                        <span
                          className="text-[10px] font-bold"
                          style={{
                            color:
                              getStatusColor(
                                status
                              ),
                          }}
                        >
                          {status}
                        </span>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          ) : (
            <EmptyList
              icon={Calendar}
              title="No recent bookings"
              description="New bookings will appear here."
            />
          )}
        </motion.div>
      </div>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.45,
        }}
        className="relative"
      >
        <div className="mb-4">
          <h2 className="font-display font-bold text-lg">
            Quick Actions
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            Manage your platform
            quickly.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            to="/admin/users"
            icon={Users}
            title="Users"
            description="Manage users"
          />

          <QuickAction
            to="/admin/experiences"
            icon={Compass}
            title="Experiences"
            description="Manage experiences"
          />

          <QuickAction
            to="/admin/bookings"
            icon={Calendar}
            title="Bookings"
            description="Manage reservations"
          />

          <QuickAction
            to="/admin/categories"
            icon={MapPin}
            title="Categories"
            description="Organize experiences"
          />
        </div>
      </motion.div>
    </div>
  );
};

/* =========================================================
   SKELETON
========================================================= */

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 skeleton rounded-xl" />

          <div className="h-4 w-72 skeleton rounded-lg" />
        </div>

        <div className="h-11 w-28 skeleton rounded-xl" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-36 skeleton rounded-2xl"
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-[340px] skeleton rounded-2xl" />

        <div className="h-[340px] skeleton rounded-2xl" />
      </div>

      <div className="h-[340px] skeleton rounded-2xl" />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-[340px] skeleton rounded-2xl" />

        <div className="h-[340px] skeleton rounded-2xl" />
      </div>

      <div className="h-32 skeleton rounded-2xl" />
    </div>
  );
};

/* =========================================================
   EMPTY CHART
========================================================= */

const EmptyChart = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="h-[260px] flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-300" />
      </div>

      <h3 className="font-semibold text-gray-700 mt-4">
        {title}
      </h3>

      <p className="text-xs text-gray-400 max-w-xs mt-1">
        {description}
      </p>
    </div>
  );
};

/* =========================================================
   EMPTY LIST
========================================================= */

const EmptyList = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="min-h-[220px] flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-300" />
      </div>

      <h3 className="font-semibold text-gray-700 mt-4">
        {title}
      </h3>

      <p className="text-xs text-gray-400 mt-1">
        {description}
      </p>
    </div>
  );
};

/* =========================================================
   QUICK ACTION
========================================================= */

const QuickAction = ({
  to,
  icon: Icon,
  title,
  description,
}) => {
  return (
    <Link
      to={to}
      className="relative card p-4 group hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <p className="font-bold text-sm">
            {title}
          </p>

          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {description}
          </p>
        </div>

        <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
};

export default AdminDashboard;