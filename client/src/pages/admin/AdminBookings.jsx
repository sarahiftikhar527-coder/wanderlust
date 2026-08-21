import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Search,
  Eye,
  X,
  Check,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
  Loader2,
  RefreshCw,
  Mail,
  Hash,
  Users,
  Phone,
  Copy,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/helpers";
import API from "../../api/axios";

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const normalizeStatus = (value) =>
  String(value || "PENDING")
    .trim()
    .toUpperCase();

const getStatus = (booking) => normalizeStatus(booking?.status);

const getBookingId = (booking) =>
  booking?._id ||
  booking?.id ||
  booking?.bookingId ||
  "";

const getExperienceTitle = (booking) =>
  booking?.experienceTitle ||
  booking?.experience?.title ||
  booking?.experience?.name ||
  booking?.title ||
  "Experience";

const getExperienceLocation = (booking) => {
  if (booking?.experienceLocation) {
    return booking.experienceLocation;
  }

  if (
    booking?.experience?.location &&
    typeof booking.experience.location === "object"
  ) {
    return [
      booking.experience.location.city,
      booking.experience.location.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return (
    booking?.location ||
    booking?.experience?.city ||
    booking?.experience?.destination ||
    ""
  );
};

const getUserName = (booking) =>
  booking?.user?.name ||
  booking?.user?.fullName ||
  booking?.userName ||
  booking?.customer?.name ||
  booking?.customer?.fullName ||
  booking?.name ||
  booking?.fullName ||
  "Unknown User";

const getUserEmail = (booking) =>
  booking?.user?.email ||
  booking?.userEmail ||
  booking?.email ||
  booking?.customer?.email ||
  "No email";

const getUserPhone = (booking) =>
  booking?.user?.phone ||
  booking?.user?.phoneNumber ||
  booking?.contactPhone ||
  booking?.phone ||
  booking?.phoneNumber ||
  booking?.customer?.phone ||
  booking?.customer?.phoneNumber ||
  "";

const getUserAvatar = (booking) =>
  booking?.user?.avatar ||
  booking?.user?.profileImage ||
  booking?.user?.image ||
  booking?.user?.photo ||
  booking?.user?.profilePicture ||
  booking?.avatar ||
  booking?.profileImage ||
  booking?.image ||
  booking?.customer?.avatar ||
  booking?.customer?.profileImage ||
  booking?.customer?.image ||
  "";

const getBookingDate = (booking) =>
  booking?.bookingDate ||
  booking?.date ||
  booking?.scheduledDate ||
  booking?.startDate ||
  null;

const getBookingTime = (booking) =>
  booking?.time ||
  booking?.bookingTime ||
  booking?.scheduledTime ||
  booking?.startTime ||
  "";

const getGuests = (booking) => {
  if (
    booking?.guests &&
    typeof booking.guests === "object"
  ) {
    const adults = Number(booking.guests.adults || 0);
    const children = Number(booking.guests.children || 0);
    const total = adults + children;

    return {
      adults,
      children,
      total: total > 0 ? total : 1,
    };
  }

  const value =
    booking?.numberOfGuests ??
    booking?.participants ??
    booking?.guestCount ??
    booking?.numberOfParticipants ??
    1;

  const total = Number(value);

  return {
    adults: total > 0 ? total : 1,
    children: 0,
    total: total > 0 ? total : 1,
  };
};

const getAmount = (booking) => {
  const value =
    booking?.totalPrice ??
    booking?.totalAmount ??
    booking?.amount ??
    booking?.grandTotal ??
    booking?.price ??
    0;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const getNotes = (booking) =>
  booking?.specialRequests ||
  booking?.notes ||
  booking?.message ||
  booking?.additionalNotes ||
  booking?.comment ||
  "";

const getStatusClass = (status) =>
  statusStyles[normalizeStatus(status)] ||
  "bg-gray-100 text-gray-600 border-gray-200";

const getStatusLabel = (status) =>
  statusLabels[normalizeStatus(status)] ||
  normalizeStatus(status);

const getInitials = (name) => {
  const safeName = String(name || "U").trim();

  if (!safeName) return "U";

  const parts = safeName.split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const extractBookings = (response) => {
  const root = response?.data;

  const candidates = [
    root?.data?.bookings,
    root?.bookings,
    root?.data?.items,
    root?.items,
    root?.data,
    root,
  ];

  const result = candidates.find((item) =>
    Array.isArray(item)
  );

  return Array.isArray(result) ? result : [];
};

const getApiErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.response?.data?.errors?.[0]?.msg ||
  error?.message ||
  "Unable to complete the request.";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [viewing, setViewing] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchBookings = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await API.get("/bookings", {
          params: {
            page: 1,
            limit: 100,
          },
        });

        const data = extractBookings(response);

        setBookings(data);

        if (isRefresh) {
          setSuccess("Bookings refreshed successfully.");
        }
      } catch (err) {
        console.error("Admin bookings fetch error:", err);

        setError(getApiErrorMessage(err));

        if (!isRefresh) {
          setBookings([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchBookings]);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setViewing(null);
      }
    };

    if (viewing) {
      document.addEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [viewing]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const bookingStatus = getStatus(booking);

      const matchesStatus =
        status === "ALL" ||
        bookingStatus === status;

      if (!matchesStatus) return false;

      if (!query) return true;

      const searchableText = [
        getUserName(booking),
        getUserEmail(booking),
        getUserPhone(booking),
        getExperienceTitle(booking),
        getExperienceLocation(booking),
        getBookingId(booking),
        getStatus(booking),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [bookings, search, status]);

  const stats = useMemo(() => {
    const total = bookings.length;

    const pending = bookings.filter(
      (booking) =>
        getStatus(booking) === "PENDING"
    ).length;

    const confirmed = bookings.filter(
      (booking) =>
        getStatus(booking) === "CONFIRMED"
    ).length;

    const completed = bookings.filter(
      (booking) =>
        getStatus(booking) === "COMPLETED"
    ).length;

    const cancelled = bookings.filter(
      (booking) =>
        getStatus(booking) === "CANCELLED"
    ).length;

    const revenue = bookings.reduce(
      (sum, booking) =>
        sum + getAmount(booking),
      0
    );

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      revenue,
    };
  }, [bookings]);

  const updateStatus = async (
    id,
    newStatus
  ) => {
    if (!id || updatingId) return;

    const normalizedNewStatus =
      normalizeStatus(newStatus);

    const currentBooking = bookings.find(
      (booking) =>
        String(getBookingId(booking)) ===
        String(id)
    );

    const currentStatus =
      getStatus(currentBooking);

    if (
      currentStatus === normalizedNewStatus
    ) {
      return;
    }

    setUpdatingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await API.put(
        `/bookings/${id}/status`,
        {
          status: normalizedNewStatus,
        }
      );

      const updatedBooking =
        response?.data?.data?.booking ||
        response?.data?.booking ||
        response?.data?.data ||
        null;

      setBookings((previous) =>
        previous.map((booking) =>
          String(getBookingId(booking)) ===
          String(id)
            ? {
                ...booking,
                ...(updatedBooking || {}),
                status: normalizedNewStatus,
              }
            : booking
        )
      );

      setViewing((previous) =>
        previous &&
        String(getBookingId(previous)) ===
          String(id)
          ? {
              ...previous,
              ...(updatedBooking || {}),
              status: normalizedNewStatus,
            }
          : previous
      );

      setSuccess(
        `Booking status updated to ${getStatusLabel(
          normalizedNewStatus
        )}.`
      );

      await fetchBookings();
    } catch (err) {
      console.error(
        "Update booking status error:",
        err
      );

      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const copyBookingId = async (id) => {
    if (!id) return;

    try {
      await navigator.clipboard.writeText(
        String(id)
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error(
        "Copy booking ID error:",
        err
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
  };

  const handleAvatarError = (event) => {
    event.currentTarget.style.display = "none";
  };

  return (
    <div className="min-h-full w-full space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 p-6 sm:p-8 text-white shadow-xl shadow-primary-600/10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -bottom-28 right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Bookings
            </h1>

            <p className="text-primary-50/90 mt-2 max-w-xl text-sm sm:text-base">
              Manage reservations, monitor booking
              activity and keep every customer
              experience organized.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchBookings(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-700 font-bold shadow-lg hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={
                refreshing
                  ? "w-4 h-4 animate-spin"
                  : "w-4 h-4"
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Bookings"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -12,
            }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>

              <p className="text-sm font-semibold text-emerald-800">
                {success}
              </p>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="ml-auto w-8 h-8 rounded-lg hover:bg-emerald-100 flex items-center justify-center text-emerald-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -12,
            }}
            className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>

              <div className="min-w-0">
                <p className="font-bold text-red-800">
                  Something went wrong
                </p>

                <p className="text-sm text-red-700 mt-1 break-words">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          icon={Calendar}
          label="Total Bookings"
          value={stats.total}
          iconClass="bg-primary-50 text-primary-600"
        />

        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          icon={Check}
          label="Confirmed"
          value={stats.confirmed}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          icon={DollarSign}
          label="Total Value"
          value={formatCurrency(stats.revenue)}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customer, email, phone, experience or booking ID..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/60 outline-none transition focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
            />
          </div>

          <div className="relative min-w-[200px]">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="appearance-none w-full px-4 pr-10 py-3.5 rounded-xl border border-gray-200 bg-gray-50/60 outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 font-semibold cursor-pointer"
            >
              {STATUS_OPTIONS.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option === "ALL"
                    ? "All Statuses"
                    : getStatusLabel(option)}
                </option>
              ))}
            </select>

            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-800">
              {filteredBookings.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-800">
              {bookings.length}
            </span>{" "}
            bookings
          </p>

          {(search || status !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-bold text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 space-y-3">
            {Array.from({ length: 7 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-xl skeleton"
                />
              )
            )}
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-primary-50 flex items-center justify-center">
            <Calendar className="w-9 h-9 text-primary-600" />
          </div>

          <h2 className="font-display font-extrabold text-2xl mt-5">
            No bookings found
          </h2>

          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            {search || status !== "ALL"
              ? "Try changing your search or status filter."
              : "There are no bookings available yet."}
          </p>

          {(search || status !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 px-5 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <TableHeading>
                    Customer
                  </TableHeading>

                  <TableHeading>
                    Experience
                  </TableHeading>

                  <TableHeading>
                    Date
                  </TableHeading>

                  <TableHeading>
                    Guests
                  </TableHeading>

                  <TableHeading>
                    Amount
                  </TableHeading>

                  <TableHeading>
                    Status
                  </TableHeading>

                  <th className="text-right px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map(
                  (booking, index) => {
                    const bookingId =
                      getBookingId(booking);

                    const bookingStatus =
                      getStatus(booking);

                    const userName =
                      getUserName(booking);

                    const userEmail =
                      getUserEmail(booking);

                    const avatar =
                      getUserAvatar(booking);

                    const experienceTitle =
                      getExperienceTitle(booking);

                    const bookingDate =
                      getBookingDate(booking);

                    const guests =
                      getGuests(booking);

                    return (
                      <motion.tr
                        key={
                          bookingId ||
                          `booking-${index}`
                        }
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.025,
                        }}
                        className="border-b border-gray-100 last:border-0 hover:bg-primary-50/20 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-white font-bold">
                                {getInitials(
                                  userName
                                )}
                              </span>

                              {avatar && (
                                <img
                                  src={avatar}
                                  alt={userName}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={
                                    handleAvatarError
                                  }
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-sm text-gray-800 truncate max-w-[190px]">
                                {userName}
                              </p>

                              <p className="text-xs text-gray-500 truncate max-w-[190px] mt-0.5">
                                {userEmail}
                              </p>

                              {getUserPhone(
                                booking
                              ) && (
                                <p className="text-xs text-gray-400 truncate max-w-[190px] mt-0.5">
                                  {getUserPhone(
                                    booking
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-sm text-gray-800 max-w-[210px] truncate">
                            {experienceTitle}
                          </p>

                          {getExperienceLocation(
                            booking
                          ) && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                              <MapPin className="w-3.5 h-3.5" />

                              <span className="truncate max-w-[180px]">
                                {getExperienceLocation(
                                  booking
                                )}
                              </span>
                            </div>
                          )}

                          <p className="text-[11px] text-gray-400 mt-1">
                            #
                            {bookingId
                              ? String(
                                  bookingId
                                ).slice(-8)
                              : "N/A"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-800">
                            {bookingDate
                              ? formatDate(
                                  bookingDate
                                )
                              : "N/A"}
                          </p>

                          {getBookingTime(
                            booking
                          ) && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                              <Clock className="w-3.5 h-3.5" />

                              {
                                getBookingTime(
                                  booking
                                )
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                            <Users className="w-4 h-4 text-primary-500" />

                            <span className="font-bold text-sm">
                              {guests.total}
                            </span>

                            <span className="text-xs text-gray-400">
                              guests
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-extrabold text-sm text-gray-800">
                            {formatCurrency(
                              getAmount(
                                booking
                              )
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusClass(
                              bookingStatus
                            )}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />

                            {getStatusLabel(
                              bookingStatus
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setViewing(
                                booking
                              )
                            }
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </motion.tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setViewing(null);
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              transition={{
                duration: 0.2,
              }}
              className="w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-5 sm:px-7 py-5 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>

                    <div>
                      <h2 className="font-display font-extrabold text-xl">
                        Booking Details
                      </h2>

                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400 truncate max-w-[220px] sm:max-w-[380px]">
                          #
                          {getBookingId(
                            viewing
                          ) || "N/A"}
                        </p>

                        {getBookingId(
                          viewing
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              copyBookingId(
                                getBookingId(
                                  viewing
                                )
                              )
                            }
                            className="text-gray-400 hover:text-primary-600 transition"
                            title="Copy booking ID"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewing(null)
                  }
                  className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-5 sm:p-7 space-y-6">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-500 p-5 text-white">
                  <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl" />

                  <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-extrabold">
                        {getInitials(
                          getUserName(
                            viewing
                          )
                        )}
                      </span>

                      {getUserAvatar(
                        viewing
                      ) && (
                        <img
                          src={getUserAvatar(
                            viewing
                          )}
                          alt={getUserName(
                            viewing
                          )}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={
                            handleAvatarError
                          }
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-display font-extrabold text-xl truncate">
                        {getUserName(
                          viewing
                        )}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-primary-50 mt-1">
                        <Mail className="w-4 h-4 flex-shrink-0" />

                        <span className="truncate">
                          {getUserEmail(
                            viewing
                          )}
                        </span>
                      </div>

                      {getUserPhone(
                        viewing
                      ) && (
                        <div className="flex items-center gap-2 text-sm text-primary-50 mt-1">
                          <Phone className="w-4 h-4 flex-shrink-0" />

                          <span>
                            {getUserPhone(
                              viewing
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="self-start sm:self-center inline-flex px-3 py-1.5 rounded-full border text-xs font-bold bg-white/10 border-white/20 text-white">
                      {getStatusLabel(
                        getStatus(viewing)
                      )}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
                  <p className="text-[11px] uppercase tracking-[0.15em] font-extrabold text-gray-400 mb-2">
                    Experience
                  </p>

                  <h3 className="font-display font-extrabold text-xl text-gray-900">
                    {getExperienceTitle(
                      viewing
                    )}
                  </h3>

                  {getExperienceLocation(
                    viewing
                  ) && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <MapPin className="w-4 h-4 text-primary-500" />

                      <span>
                        {getExperienceLocation(
                          viewing
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <DetailBox
                    icon={Calendar}
                    label="Booking Date"
                    value={
                      getBookingDate(
                        viewing
                      )
                        ? formatDate(
                            getBookingDate(
                              viewing
                            )
                          )
                        : "N/A"
                    }
                  />

                  <DetailBox
                    icon={Clock}
                    label="Booking Time"
                    value={
                      getBookingTime(
                        viewing
                      ) ||
                      "Not specified"
                    }
                  />

                  <DetailBox
                    icon={Users}
                    label="Guests"
                    value={
                      getGuests(
                        viewing
                      ).total
                    }
                  />

                  <DetailBox
                    icon={DollarSign}
                    label="Total Amount"
                    value={formatCurrency(
                      getAmount(
                        viewing
                      )
                    )}
                  />

                  <DetailBox
                    icon={Hash}
                    label="Booking ID"
                    value={
                      getBookingId(
                        viewing
                      )
                        ? `#${String(
                            getBookingId(
                              viewing
                            )
                          ).slice(-10)}`
                        : "N/A"
                    }
                  />

                  <DetailBox
                    icon={Clock}
                    label="Created"
                    value={
                      viewing?.createdAt
                        ? formatDate(
                            viewing.createdAt
                          )
                        : "N/A"
                    }
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-extrabold text-gray-800">
                      Guest Information
                    </p>

                    <Users className="w-4 h-4 text-primary-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniInfo
                      label="Adults"
                      value={
                        getGuests(
                          viewing
                        ).adults
                      }
                    />

                    <MiniInfo
                      label="Children"
                      value={
                        getGuests(
                          viewing
                        ).children
                      }
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <DetailBox
                    icon={CheckCircle2}
                    label="Payment Status"
                    value={
                      viewing?.paymentStatus ||
                      "PENDING"
                    }
                  />

                  <DetailBox
                    icon={Phone}
                    label="Contact Phone"
                    value={
                      viewing?.contactPhone ||
                      getUserPhone(
                        viewing
                      ) ||
                      "N/A"
                    }
                  />
                </div>

                {getNotes(viewing) && (
                  <div>
                    <p className="text-xs uppercase tracking-wide font-extrabold text-gray-400 mb-2">
                      Additional Information
                    </p>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                        {getNotes(viewing)}
                      </p>
                    </div>
                  </div>
                )}

                {viewing?.cancellationReason && (
                  <div>
                    <p className="text-xs uppercase tracking-wide font-extrabold text-gray-400 mb-2">
                      Cancellation Reason
                    </p>

                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                      <p className="text-sm text-red-700 leading-6 whitespace-pre-wrap">
                        {
                          viewing.cancellationReason
                        }
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-extrabold text-gray-800">
                        Booking Status
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Update the reservation status
                        from here.
                      </p>
                    </div>

                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusClass(
                        getStatus(viewing)
                      )}`}
                    >
                      {getStatusLabel(
                        getStatus(viewing)
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <StatusButton
                      label="Confirm"
                      icon={Check}
                      status="CONFIRMED"
                      current={
                        viewing?.status
                      }
                      loading={
                        updatingId ===
                        getBookingId(
                          viewing
                        )
                      }
                      onClick={() =>
                        updateStatus(
                          getBookingId(
                            viewing
                          ),
                          "CONFIRMED"
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    />

                    <StatusButton
                      label="Complete"
                      icon={CheckCircle2}
                      status="COMPLETED"
                      current={
                        viewing?.status
                      }
                      loading={
                        updatingId ===
                        getBookingId(
                          viewing
                        )
                      }
                      onClick={() =>
                        updateStatus(
                          getBookingId(
                            viewing
                          ),
                          "COMPLETED"
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700"
                    />

                    <StatusButton
                      label="Cancel"
                      icon={XCircle}
                      status="CANCELLED"
                      current={
                        viewing?.status
                      }
                      loading={
                        updatingId ===
                        getBookingId(
                          viewing
                        )
                      }
                      onClick={() =>
                        updateStatus(
                          getBookingId(
                            viewing
                          ),
                          "CANCELLED"
                        )
                      }
                      className="bg-red-600 hover:bg-red-700"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TableHeading = ({ children }) => (
  <th className="text-left px-5 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-[0.12em]">
    {children}
  </th>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconClass,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
      className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
            {label}
          </p>

          <p className="text-xl sm:text-2xl font-display font-extrabold text-gray-900 mt-1 truncate">
            {value}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

const DetailBox = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        <Icon className="w-4 h-4" />

        <span className="text-[10px] font-extrabold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="font-bold text-gray-800 break-words">
        {value}
      </p>
    </div>
  );
};

const MiniInfo = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
    <p className="text-xs text-gray-400 font-semibold">
      {label}
    </p>

    <p className="text-lg font-extrabold text-gray-800 mt-1">
      {value}
    </p>
  </div>
);

const StatusButton = ({
  label,
  icon: Icon,
  status,
  current,
  loading,
  onClick,
  className,
}) => {
  const active =
    normalizeStatus(current) === status;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || active}
      className={`px-4 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}

      {active ? "Current" : label}
    </button>
  );
};

export default AdminBookings;