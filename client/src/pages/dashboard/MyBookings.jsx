import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  DollarSign,
  X,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { bookingService } from "../../api/services";

import {
  formatCurrency,
  formatDate,
  getErrorMessage,
  cn,
} from "../../utils/helpers";

import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";

const FILTERS = [
  {
    value: "ALL",
    label: "All",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] = useState("ALL");

  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [error, setError] = useState("");

  const extractBookings = useCallback((response) => {
    const data = response?.data;

    if (Array.isArray(data?.data?.bookings)) {
      return data.data.bookings;
    }

    if (Array.isArray(data?.data?.items)) {
      return data.data.items;
    }

    if (Array.isArray(data?.bookings)) {
      return data.bookings;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }, []);

  const fetchBookings = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          page: 1,
          limit: 100,
        };

        if (filter !== "ALL") {
          params.status = filter;
        }

        const response = await bookingService.getMy(params);

        const bookingData = extractBookings(response);

        setBookings(
          Array.isArray(bookingData)
            ? bookingData
            : []
        );
      } catch (err) {
        console.error("Fetch bookings error:", err);

        setBookings([]);

        setError(
          getErrorMessage(err) ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Unable to load your bookings. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, extractBookings]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = () => {
    fetchBookings(true);
  };

  const handleFilterChange = (value) => {
    if (value === filter) {
      return;
    }

    setFilter(value);
    setError("");
  };

  const openCancelModal = (booking) => {
    if (!booking?._id) {
      toast.error("Invalid booking.");
      return;
    }

    const status = getBookingStatus(booking);

    if (
      status !== "PENDING" &&
      status !== "CONFIRMED"
    ) {
      toast.error(
        "This booking cannot be cancelled."
      );
      return;
    }

    setCancelModal(booking);
    setCancelReason("");
  };

  const closeCancelModal = () => {
    if (cancelling) {
      return;
    }

    setCancelModal(null);
    setCancelReason("");
  };

  const handleCancel = async () => {
    if (!cancelModal?._id || cancelling) {
      return;
    }

    try {
      setCancelling(true);

      await bookingService.cancel(
        cancelModal._id,
        cancelReason.trim()
      );

      toast.success(
        "Booking cancelled successfully."
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking?._id === cancelModal?._id
            ? {
                ...booking,
                status: "CANCELLED",
                cancellationReason:
                  cancelReason.trim(),
              }
            : booking
        )
      );

      setCancelModal(null);
      setCancelReason("");

      await fetchBookings();
    } catch (err) {
      console.error(
        "Cancel booking error:",
        err
      );

      toast.error(
        getErrorMessage(err) ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to cancel this booking."
      );
    } finally {
      setCancelling(false);
    }
  };

  const getStatusClasses = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "COMPLETED":
        return "bg-indigo-100 text-indigo-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "CONFIRMED":
        return CheckCircle2;

      case "COMPLETED":
        return CheckCircle2;

      case "CANCELLED":
        return AlertCircle;

      case "PENDING":
        return Clock;

      default:
        return Clock;
    }
  };

  const getGuestCount = (booking) => {
    const adults = Number(
      booking?.guests?.adults ??
        booking?.adults ??
        booking?.numberOfAdults ??
        0
    );

    const children = Number(
      booking?.guests?.children ??
        booking?.children ??
        booking?.numberOfChildren ??
        0
    );

    const infants = Number(
      booking?.guests?.infants ??
        booking?.infants ??
        0
    );

    const explicitTotal = Number(
      booking?.guests?.total ??
        booking?.numberOfGuests ??
        booking?.guestCount ??
        booking?.totalGuests ??
        0
    );

    const calculatedTotal =
      adults + children + infants;

    const total =
      explicitTotal > 0
        ? explicitTotal
        : calculatedTotal;

    return {
      adults,
      children,
      infants,
      total,
    };
  };

  const getExperienceTitle = (booking) => {
    return (
      booking?.experienceTitle ||
      booking?.experience?.title ||
      booking?.experience?.name ||
      booking?.title ||
      "Travel Experience"
    );
  };

  const getExperienceLocation = (booking) => {
    return (
      booking?.experienceLocation ||
      booking?.experience?.location ||
      booking?.experience?.destination ||
      booking?.location ||
      booking?.destination ||
      ""
    );
  };

  const getExperienceImage = (booking) => {
    return (
      booking?.experienceImage ||
      booking?.experience?.coverImage ||
      booking?.experience?.image ||
      booking?.experience?.images?.[0] ||
      booking?.image ||
      booking?.coverImage ||
      ""
    );
  };

  const getBookingDate = (booking) => {
    return (
      booking?.bookingDate ||
      booking?.travelDate ||
      booking?.experienceDate ||
      booking?.date ||
      booking?.startDate ||
      ""
    );
  };

  const getTotalPrice = (booking) => {
    const price = Number(
      booking?.totalPrice ??
        booking?.totalAmount ??
        booking?.amount ??
        booking?.price ??
        0
    );

    return Number.isFinite(price) ? price : 0;
  };

  const getBookingStatus = (booking) => {
    return (
      String(
        booking?.status || "PENDING"
      ).toUpperCase()
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmed";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      case "PENDING":
        return "Pending";

      default:
        return status || "Pending";
    }
  };

  const getFilterCount = (value) => {
    if (value === "ALL") {
      return bookings.length;
    }

    return bookings.filter(
      (booking) =>
        getBookingStatus(booking) === value
    ).length;
  };

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
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-1 text-gray-900">
              My Bookings
            </h1>

            <p className="text-gray-500">
              Manage your travel experiences
              and reservations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              refreshing || loading
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={cn(
                "w-4 h-4",
                refreshing &&
                  "animate-spin"
              )}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
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
                Unable to load bookings
              </p>

              <p className="text-sm text-red-600 mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchBookings()
              }
              disabled={loading}
              className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.05,
        }}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        {FILTERS.map((item) => {
          const count =
            getFilterCount(item.value);

          const active =
            filter === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                handleFilterChange(
                  item.value
                )
              }
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <span>{item.label}</span>

              {!loading && (
                <span
                  className={cn(
                    "min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="card p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-28 h-28 rounded-xl skeleton" />

                <div className="flex-1 space-y-3">
                  <div className="h-5 w-2/3 skeleton rounded" />

                  <div className="h-4 w-full skeleton rounded" />

                  <div className="h-4 w-1/2 skeleton rounded" />

                  <div className="h-7 w-24 skeleton rounded-full" />

                  <div className="h-4 w-32 skeleton rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            filter === "ALL"
              ? "No bookings yet"
              : `No ${filter.toLowerCase()} bookings`
          }
          message={
            filter === "ALL"
              ? "You haven't made any bookings yet. Start exploring and plan your next adventure!"
              : "There are no bookings matching this status."
          }
          actionLabel="Browse Experiences"
          actionTo="/experiences"
        />
      ) : (
        <div className="space-y-4">
          {bookings.map(
            (booking, index) => {
              const status =
                getBookingStatus(
                  booking
                );

              const StatusIcon =
                getStatusIcon(status);

              const guests =
                getGuestCount(
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

              const image =
                getExperienceImage(
                  booking
                );

              const bookingDate =
                getBookingDate(
                  booking
                );

              const totalPrice =
                getTotalPrice(
                  booking
                );

              const canCancel =
                status === "PENDING" ||
                status === "CONFIRMED";

              return (
                <motion.div
                  key={
                    booking?._id ||
                    booking?.id ||
                    index
                  }
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.04,
                  }}
                  className="card p-4 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-5">
                    <div className="relative w-full lg:w-36 h-52 sm:h-64 lg:h-36 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-lg text-gray-900 truncate">
                            {title}
                          </h3>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
                            {location && (
                              <span className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-4 h-4 flex-shrink-0" />

                                <span className="truncate max-w-[250px]">
                                  {location}
                                </span>
                              </span>
                            )}

                            {bookingDate && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 flex-shrink-0" />

                                <span>
                                  {formatDate(
                                    bookingDate
                                  )}
                                </span>
                              </span>
                            )}

                            {guests.total >
                              0 && (
                              <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 flex-shrink-0" />

                                <span>
                                  {
                                    guests.total
                                  }{" "}
                                  {guests.total ===
                                  1
                                    ? "guest"
                                    : "guests"}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={cn(
                            "badge inline-flex items-center gap-1.5 self-start",
                            getStatusClasses(
                              status
                            )
                          )}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />

                          {getStatusLabel(
                            status
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" />

                          <span className="font-semibold text-gray-700">
                            {formatCurrency(
                              totalPrice
                            )}
                          </span>
                        </span>

                        {guests.adults >
                          0 && (
                          <span>
                            {
                              guests.adults
                            }{" "}
                            {guests.adults ===
                            1
                              ? "adult"
                              : "adults"}
                          </span>
                        )}

                        {guests.children >
                          0 && (
                          <span>
                            {
                              guests.children
                            }{" "}
                            {guests.children ===
                            1
                              ? "child"
                              : "children"}
                          </span>
                        )}

                        {guests.infants >
                          0 && (
                          <span>
                            {
                              guests.infants
                            }{" "}
                            {guests.infants ===
                            1
                              ? "infant"
                              : "infants"}
                          </span>
                        )}
                      </div>

                      {booking?.createdAt && (
                        <div className="mt-2 text-xs text-gray-400">
                          Booked on{" "}
                          {formatDate(
                            booking.createdAt
                          )}
                        </div>
                      )}

                      {status ===
                        "CANCELLED" &&
                        booking?.cancellationReason && (
                          <div className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                            <p className="text-xs font-semibold text-red-700">
                              Cancellation
                              reason
                            </p>

                            <p className="text-xs text-red-600 mt-1">
                              {
                                booking.cancellationReason
                              }
                            </p>
                          </div>
                        )}

                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            Booking ID
                          </p>

                          <p className="text-xs font-semibold text-gray-600 mt-0.5 break-all">
                            {booking?._id ||
                              "—"}
                          </p>
                        </div>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() =>
                              openCancelModal(
                                booking
                              )
                            }
                            disabled={
                              cancelling
                            }
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />

                            Cancel
                            Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }
          )}
        </div>
      )}

      <Modal
        isOpen={!!cancelModal}
        onClose={closeCancelModal}
        title="Cancel Booking"
        size="sm"
      >
        <div className="space-y-5">
          <div className="rounded-xl bg-red-50 border border-red-100 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />

              <div className="min-w-0">
                <p className="font-semibold text-sm text-red-700">
                  Cancel this booking?
                </p>

                <p className="text-sm text-red-600 mt-1">
                  This will cancel
                  your reservation
                  for{" "}
                  <strong>
                    {cancelModal
                      ? getExperienceTitle(
                          cancelModal
                        )
                      : "this experience"}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="cancelReason"
              className="label"
            >
              Reason{" "}
              <span className="text-gray-400 font-normal">
                (optional)
              </span>
            </label>

            <textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(event) =>
                setCancelReason(
                  event.target.value
                )
              }
              rows={4}
              maxLength={500}
              disabled={cancelling}
              className="input resize-none"
              placeholder="Tell us why you want to cancel..."
            />

            <p className="text-xs text-gray-400 mt-1 text-right">
              {cancelReason.length}/500
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={closeCancelModal}
              disabled={cancelling}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50"
            >
              Keep Booking
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Cancel Booking
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;