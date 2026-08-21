import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar,
  Heart,
  Bell,
  DollarSign,
  Compass,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  bookingService,
  notificationService,
} from "../../api/services";

import { useAuth } from "../../context/AuthContext";

import {
  formatCurrency,
  formatDate,
  timeAgo,
} from "../../utils/helpers";

import EmptyState from "../../components/EmptyState";

const Dashboard = () => {
  const auth = useAuth();

  const user = auth?.user || null;

  const authLoading = Boolean(
    auth?.loading ??
      auth?.isLoading ??
      auth?.initializing ??
      false
  );

  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const extractArray = useCallback((response, keys = []) => {
    const root = response?.data;

    if (Array.isArray(root)) {
      return root;
    }

    if (Array.isArray(root?.data)) {
      return root.data;
    }

    for (const key of keys) {
      if (Array.isArray(root?.[key])) {
        return root[key];
      }

      if (Array.isArray(root?.data?.[key])) {
        return root.data[key];
      }

      if (Array.isArray(root?.data?.data?.[key])) {
        return root.data.data[key];
      }
    }

    if (Array.isArray(root?.data?.data)) {
      return root.data.data;
    }

    return [];
  }, []);

  const getErrorMessage = useCallback(
    (reason, fallback) => {
      return (
        reason?.response?.data?.message ||
        reason?.response?.data?.error ||
        reason?.message ||
        fallback
      );
    },
    []
  );

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      if (!user) {
        setBookings([]);
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const results = await Promise.allSettled([
          bookingService.getMy({
            page: 1,
            limit: 5,
          }),
          notificationService.getMy({
            page: 1,
            limit: 5,
          }),
        ]);

        const bookingResult = results[0];
        const notificationResult = results[1];

        if (bookingResult.status === "fulfilled") {
          const bookingData = extractArray(
            bookingResult.value,
            ["bookings", "results", "items"]
          );

          setBookings(bookingData);
        } else {
          setBookings([]);
        }

        if (notificationResult.status === "fulfilled") {
          const notificationData = extractArray(
            notificationResult.value,
            ["notifications", "results", "items"]
          );

          setNotifications(notificationData);
        } else {
          setNotifications([]);
        }

        if (
          bookingResult.status === "rejected" &&
          notificationResult.status === "rejected"
        ) {
          setError(
            getErrorMessage(
              bookingResult.reason,
              getErrorMessage(
                notificationResult.reason,
                "Unable to load dashboard data. Please try again."
              )
            )
          );
        } else if (
          bookingResult.status === "rejected"
        ) {
          setError(
            getErrorMessage(
              bookingResult.reason,
              "Unable to load your bookings."
            )
          );
        } else if (
          notificationResult.status === "rejected"
        ) {
          setError(
            getErrorMessage(
              notificationResult.reason,
              "Unable to load your notifications."
            )
          );
        }
      } catch (err) {
        console.error(
          "Dashboard data error:",
          err
        );

        setError(
          getErrorMessage(
            err,
            "Unable to load dashboard data. Please try again."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      user,
      extractArray,
      getErrorMessage,
    ]
  );

  useEffect(() => {
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [
    authLoading,
    fetchDashboardData,
  ]);

  const stats = useMemo(() => {
    const totalBookings =
      bookings.length;

    const totalFavorites =
      Array.isArray(user?.favorites)
        ? user.favorites.length
        : 0;

    const totalNotifications =
      notifications.length;

    const totalSpent = bookings
      .filter(
        (booking) =>
          String(
            booking?.status || ""
          ).toUpperCase() !== "CANCELLED"
      )
      .reduce((sum, booking) => {
        const price =
          Number(
            booking?.totalPrice ??
              booking?.price ??
              booking?.amount ??
              0
          ) || 0;

        return sum + price;
      }, 0);

    return [
      {
        icon: Calendar,
        label: "Total Bookings",
        value: totalBookings,
        iconWrapper:
          "bg-primary-50",
        iconColor:
          "text-primary-600",
      },
      {
        icon: Heart,
        label: "Favorites",
        value: totalFavorites,
        iconWrapper:
          "bg-error-50",
        iconColor:
          "text-error-600",
      },
      {
        icon: Bell,
        label: "Notifications",
        value: totalNotifications,
        iconWrapper:
          "bg-secondary-50",
        iconColor:
          "text-secondary-600",
      },
      {
        icon: DollarSign,
        label: "Total Spent",
        value:
          formatCurrency(totalSpent),
        iconWrapper:
          "bg-accent-50",
        iconColor:
          "text-accent-600",
      },
    ];
  }, [
    bookings,
    notifications,
    user,
  ]);

  const getBookingStatusClass = (
    status
  ) => {
    switch (
      String(
        status || ""
      ).toUpperCase()
    ) {
      case "CONFIRMED":
        return "bg-accent-100 text-accent-700";

      case "COMPLETED":
        return "bg-primary-100 text-primary-700";

      case "CANCELLED":
        return "bg-error-100 text-error-700";

      case "PENDING":
        return "bg-warning-100 text-warning-700";

      case "REJECTED":
        return "bg-error-100 text-error-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getBookingStatusText = (
    status
  ) => {
    const normalized =
      String(
        status || "PENDING"
      ).toUpperCase();

    return (
      normalized.charAt(0) +
      normalized
        .slice(1)
        .toLowerCase()
    );
  };

  const getExperienceTitle = (
    booking
  ) => {
    const title =
      booking?.experienceTitle ||
      booking?.experience?.title ||
      booking?.experience?.name ||
      booking?.title;

    if (
      typeof title === "string" &&
      title.trim()
    ) {
      return title;
    }

    return "Experience";
  };

  const getExperienceLocation = (
    booking
  ) => {
    const location =
      booking?.experienceLocation ||
      booking?.experience?.location ||
      booking?.location;

    if (
      typeof location === "string" &&
      location.trim()
    ) {
      return location;
    }

    if (
      location &&
      typeof location === "object"
    ) {
      if (
        location.city &&
        location.country
      ) {
        return `${location.city}, ${location.country}`;
      }

      if (location.city) {
        return String(
          location.city
        );
      }

      if (location.name) {
        return String(
          location.name
        );
      }
    }

    return "Location unavailable";
  };

  const getExperienceImage = (
    booking
  ) => {
    const images =
      booking?.experience?.images;

    const image =
      booking?.experienceImage ||
      booking?.experience?.coverImage ||
      booking?.experience?.image ||
      (Array.isArray(images)
        ? images[0]
        : "");

    return typeof image ===
      "string"
      ? image
      : "";
  };

  const getBookingDate = (
    booking
  ) => {
    const date =
      booking?.bookingDate ||
      booking?.date ||
      booking?.travelDate ||
      booking?.experienceDate ||
      booking?.startDate ||
      "";

    if (
      typeof date === "string" ||
      typeof date === "number"
    ) {
      return date;
    }

    return "";
  };

  const getBookingGuests = (
    booking
  ) => {
    const guests =
      booking?.guests ??
      booking?.numberOfGuests ??
      booking?.participants ??
      booking?.people ??
      null;

    if (
      guests === null ||
      guests === undefined
    ) {
      return null;
    }

    if (
      typeof guests === "number" ||
      typeof guests === "string"
    ) {
      const numericGuests =
        Number(guests);

      if (
        Number.isFinite(
          numericGuests
        )
      ) {
        return {
          label:
            numericGuests === 1
              ? "1 Guest"
              : `${numericGuests} Guests`,
          count:
            numericGuests,
        };
      }

      return {
        label: String(guests),
        count: null,
      };
    }

    if (
      typeof guests === "object" &&
      !Array.isArray(guests)
    ) {
      const adults =
        Number(
          guests?.adults || 0
        );

      const children =
        Number(
          guests?.children || 0
        );

      const infants =
        Number(
          guests?.infants || 0
        );

      const total =
        adults +
        children +
        infants;

      const parts = [];

      if (adults > 0) {
        parts.push(
          `${adults} ${
            adults === 1
              ? "Adult"
              : "Adults"
          }`
        );
      }

      if (children > 0) {
        parts.push(
          `${children} ${
            children === 1
              ? "Child"
              : "Children"
          }`
        );
      }

      if (infants > 0) {
        parts.push(
          `${infants} ${
            infants === 1
              ? "Infant"
              : "Infants"
          }`
        );
      }

      if (parts.length > 0) {
        return {
          label:
            parts.join(", "),
          count: total,
        };
      }

      return {
        label: "Guests",
        count: 0,
      };
    }

    if (
      Array.isArray(guests)
    ) {
      const total =
        guests.length;

      return {
        label:
          total === 1
            ? "1 Guest"
            : `${total} Guests`,
        count: total,
      };
    }

    return {
      label: "Guests",
      count: null,
    };
  };

  const getBookingPrice = (
    booking
  ) => {
    const rawPrice =
      booking?.totalPrice ??
      booking?.price ??
      booking?.amount ??
      0;

    if (
      rawPrice &&
      typeof rawPrice ===
        "object"
    ) {
      return (
        Number(
          rawPrice?.total ??
            rawPrice?.amount ??
            rawPrice?.value ??
            0
        ) || 0
      );
    }

    return Number(
      rawPrice
    ) || 0;
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (authLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="card p-6">
          <div className="h-5 w-40 skeleton rounded mb-3" />

          <div className="h-9 w-72 skeleton rounded mb-2" />

          <div className="h-4 w-56 skeleton rounded" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="card p-5"
            >
              <div className="w-10 h-10 skeleton rounded-xl mb-3" />

              <div className="h-8 w-20 skeleton rounded mb-2" />

              <div className="h-4 w-24 skeleton rounded" />
            </div>
          ))}
        </div>

        <div className="card p-5">
          <div className="h-6 w-40 skeleton rounded mb-5" />

          <div className="space-y-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-20 skeleton rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-sm font-semibold text-primary-600 mb-1">
            Traveler Dashboard
          </p>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-1 text-gray-900">
            Welcome back,{" "}
            {user?.name?.split(
              " "
            )[0] || "Traveler"}
            !
          </h1>

          <p className="text-gray-500">
            Here's your travel overview
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={
            loading ||
            refreshing
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-red-800">
                Unable to load some dashboard data
              </p>

              <p className="text-sm text-red-600 mt-1 break-words">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchDashboardData()
              }
              disabled={loading}
              className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(
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
                className="card p-5 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${stat.iconWrapper} flex items-center justify-center mb-3`}
                >
                  <Icon
                    className={`w-5 h-5 ${stat.iconColor}`}
                  />
                </div>

                {loading ? (
                  <>
                    <div className="h-8 w-20 skeleton rounded-lg mb-2" />

                    <div className="h-4 w-24 skeleton rounded" />
                  </>
                ) : (
                  <>
                    <p className="font-display font-bold text-2xl text-gray-900">
                      {stat.value}
                    </p>

                    <p className="text-sm text-gray-500">
                      {stat.label}
                    </p>
                  </>
                )}
              </motion.div>
            );
          }
        )}
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="card p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900">
              Recent Bookings
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Your latest travel reservations
            </p>
          </div>

          <Link
            to="/dashboard/bookings"
            className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1 w-fit"
          >
            View all

            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-20 skeleton rounded-xl"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            message="Start exploring and book your first adventure!"
            actionLabel="Browse Experiences"
            actionTo="/experiences"
          />
        ) : (
          <div className="space-y-2">
            {bookings.map(
              (booking, index) => {
                const image =
                  getExperienceImage(
                    booking
                  );

                const title =
                  getExperienceTitle(
                    booking
                  );

                const location =
                  getExperienceLocation(
                    booking
                  );

                const bookingDate =
                  getBookingDate(
                    booking
                  );

                const guests =
                  getBookingGuests(
                    booking
                  );

                const price =
                  getBookingPrice(
                    booking
                  );

                const status =
                  booking?.status ||
                  "PENDING";

                return (
                  <motion.div
                    key={
                      booking?._id ||
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
                        index * 0.04,
                    }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <Compass className="w-6 h-6 text-primary-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {title}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />

                            {location}
                          </span>

                          {bookingDate && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3.5 h-3.5" />

                              {formatDate(
                                bookingDate
                              )}
                            </span>
                          )}

                          {guests && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3.5 h-3.5" />

                              {guests.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 flex-shrink-0">
                      <p className="font-semibold text-sm text-gray-900">
                        {formatCurrency(
                          price
                        )}
                      </p>

                      <span
                        className={`badge ${getBookingStatusClass(
                          status
                        )}`}
                      >
                        {getBookingStatusText(
                          status
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        )}
      </motion.div>

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
          delay: 0.1,
        }}
        className="card p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900">
              Recent Notifications
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Latest updates from your account
            </p>
          </div>

          <Link
            to="/dashboard/notifications"
            className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1 w-fit"
          >
            View all

            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-16 skeleton rounded-xl"
              />
            ))}
          </div>
        ) : notifications.length ===
          0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-400" />
            </div>

            <p className="text-sm font-semibold text-gray-600 mt-3">
              No notifications
            </p>

            <p className="text-xs text-gray-400 mt-1">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(
              (
                notification,
                index
              ) => {
                const isRead =
                  Boolean(
                    notification?.isRead
                  );

                return (
                  <motion.div
                    key={
                      notification?._id ||
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
                        index * 0.04,
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                      isRead
                        ? "hover:bg-gray-50"
                        : "bg-primary-50/50 hover:bg-primary-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isRead
                          ? "bg-gray-100"
                          : "bg-primary-100"
                      }`}
                    >
                      {isRead ? (
                        <Bell className="w-4 h-4 text-gray-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-primary-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-sm text-gray-800">
                          {typeof notification?.title ===
                          "string"
                            ? notification.title
                            : "Notification"}
                        </p>

                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary-600 mt-1.5 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {typeof notification?.message ===
                        "string"
                          ? notification.message
                          : "You have a new notification."}
                      </p>

                      {notification?.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(
                            notification.createdAt
                          )}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              }
            )}
          </div>
        )}
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/experiences"
          className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6 text-primary-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800">
              Explore Experiences
            </p>

            <p className="text-sm text-gray-500">
              Discover new adventures
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>

        <Link
          to="/dashboard/favorites"
          className="card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 rounded-2xl bg-error-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-error-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800">
              Your Favorites
            </p>

            <p className="text-sm text-gray-500">
              Saved experiences
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-error-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;