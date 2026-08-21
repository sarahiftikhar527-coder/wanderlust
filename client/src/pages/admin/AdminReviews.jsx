import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Trash2,
  Check,
  X,
  Eye,
  RefreshCw,
  MessageSquare,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getToken = () => {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("wanderlust_access_token") ||
    localStorage.getItem("wanderlust_token")
  );
};

const getUserName = (review) => {
  if (!review?.user) return "Unknown User";

  if (typeof review.user === "string") {
    return review.user;
  }

  return (
    review.user.name ||
    review.user.fullName ||
    review.user.username ||
    review.user.email ||
    "Unknown User"
  );
};

const getExperienceName = (review) => {
  if (!review?.experience) return "Unknown Experience";

  if (typeof review.experience === "string") {
    return review.experience;
  }

  return (
    review.experience.title ||
    review.experience.name ||
    "Unknown Experience"
  );
};

const getExperienceLocation = (review) => {
  if (!review?.experience || typeof review.experience === "string") {
    return "—";
  }

  return (
    review.experience.location ||
    review.experience.city ||
    "—"
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "approved":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    case "rejected":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    default:
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
};

const StarRating = ({ rating = 0, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Number(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-600"
          }
        />
      ))}
    </div>
  );
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteReview, setDeleteReview] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const authHeaders = useMemo(() => {
    const token = getToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  }, []);

  const fetchReviews = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await axios.get(
          `${API_URL}/reviews`,
          {
            headers: authHeaders,
            withCredentials: true,
          }
        );

        const data = response?.data;

        const fetchedReviews =
          data?.reviews ||
          data?.data?.reviews ||
          data?.data ||
          [];

        setReviews(
          Array.isArray(fetchedReviews)
            ? fetchedReviews
            : []
        );
      } catch (err) {
        console.error(
          "Failed to fetch reviews:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load reviews."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authHeaders]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  const updateReviewStatus = async (
    reviewId,
    status
  ) => {
    try {
      setError("");

      await axios.patch(
        `${API_URL}/reviews/${reviewId}/status`,
        {
          status,
        },
        {
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setReviews((previousReviews) =>
        previousReviews.map((review) =>
          review._id === reviewId ||
          review.id === reviewId
            ? {
                ...review,
                status,
              }
            : review
        )
      );

      setSelectedReview((previous) =>
        previous
          ? {
              ...previous,
              status,
            }
          : previous
      );

      setSuccess(
        `Review ${status} successfully.`
      );
    } catch (err) {
      console.error(
        "Failed to update review:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to update review."
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteReview) return;

    const reviewId =
      deleteReview._id || deleteReview.id;

    try {
      setError("");

      await axios.delete(
        `${API_URL}/reviews/${reviewId}`,
        {
          headers: authHeaders,
          withCredentials: true,
        }
      );

      setReviews((previousReviews) =>
        previousReviews.filter(
          (review) =>
            (review._id || review.id) !== reviewId
        )
      );

      setDeleteReview(null);
      setSelectedReview(null);

      setSuccess(
        "Review deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete review:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to delete review."
      );
    }
  };

  const filteredReviews = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return reviews.filter((review) => {
      const userName =
        getUserName(review).toLowerCase();

      const experienceName =
        getExperienceName(review).toLowerCase();

      const comment = (
        review.comment || ""
      ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        userName.includes(normalizedSearch) ||
        experienceName.includes(normalizedSearch) ||
        comment.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        review.status === statusFilter;

      const matchesRating =
        ratingFilter === "all" ||
        Number(review.rating) ===
          Number(ratingFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRating
      );
    });
  }, [
    reviews,
    search,
    statusFilter,
    ratingFilter,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    ratingFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredReviews.length / itemsPerPage
    )
  );

  const paginatedReviews = useMemo(() => {
    const start =
      (currentPage - 1) * itemsPerPage;

    return filteredReviews.slice(
      start,
      start + itemsPerPage
    );
  }, [
    filteredReviews,
    currentPage,
  ]);

  const stats = useMemo(() => {
    const total = reviews.length;

    const approved = reviews.filter(
      (review) =>
        review.status === "approved"
    ).length;

    const pending = reviews.filter(
      (review) =>
        review.status === "pending" ||
        !review.status
    ).length;

    const rejected = reviews.filter(
      (review) =>
        review.status === "rejected"
    ).length;

    const ratedReviews = reviews.filter(
      (review) =>
        Number(review.rating) > 0
    );

    const averageRating =
      ratedReviews.length > 0
        ? (
            ratedReviews.reduce(
              (sum, review) =>
                sum + Number(review.rating),
              0
            ) / ratedReviews.length
          ).toFixed(1)
        : "0.0";

    return {
      total,
      approved,
      pending,
      rejected,
      averageRating,
    };
  }, [reviews]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRatingFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <MessageSquare
                  size={22}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Reviews
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Manage customer reviews and
                  ratings.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchReviews(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-500/30 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        <AnimatePresence>
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
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300"
            >
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1 text-sm">
                {error}
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-300 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300"
            >
              <Check size={20} />
              <span className="text-sm">
                {success}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={MessageSquare}
            label="Total Reviews"
            value={stats.total}
          />

          <StatCard
            icon={Check}
            label="Approved"
            value={stats.approved}
          />

          <StatCard
            icon={AlertCircle}
            label="Pending"
            value={stats.pending}
          />

          <StatCard
            icon={X}
            label="Rejected"
            value={stats.rejected}
          />

          <StatCard
            icon={Star}
            label="Average Rating"
            value={stats.averageRating}
          />
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search reviews..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
            >
              <option value="all">
                All Status
              </option>
              <option value="pending">
                Pending
              </option>
              <option value="approved">
                Approved
              </option>
              <option value="rejected">
                Rejected
              </option>
            </select>

            <select
              value={ratingFilter}
              onChange={(event) =>
                setRatingFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
            >
              <option value="all">
                All Ratings
              </option>
              <option value="5">
                5 Stars
              </option>
              <option value="4">
                4 Stars
              </option>
              <option value="3">
                3 Stars
              </option>
              <option value="2">
                2 Stars
              </option>
              <option value="1">
                1 Star
              </option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-800 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw
                  size={28}
                  className="animate-spin text-emerald-400"
                />

                <span className="text-sm">
                  Loading reviews...
                </span>
              </div>
            </div>
          ) : paginatedReviews.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <MessageSquare
                  size={28}
                  className="text-slate-500"
                />
              </div>

              <h3 className="text-lg font-semibold text-white">
                No reviews found
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                There are no reviews matching
                your current filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Experience
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Rating
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Review
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedReviews.map(
                      (review, index) => {
                        const reviewId =
                          review._id ||
                          review.id;

                        return (
                          <motion.tr
                            key={reviewId}
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            transition={{
                              delay:
                                index * 0.03,
                            }}
                            className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                                  <User
                                    size={17}
                                    className="text-emerald-400"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-white">
                                    {getUserName(
                                      review
                                    )}
                                  </p>

                                  {review.user?.email && (
                                    <p className="mt-0.5 max-w-[160px] truncate text-xs text-slate-500">
                                      {
                                        review
                                          .user
                                          .email
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <div className="max-w-[180px]">
                                <p className="truncate text-sm font-medium text-slate-200">
                                  {getExperienceName(
                                    review
                                  )}
                                </p>

                                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin
                                    size={12}
                                  />

                                  <span className="truncate">
                                    {getExperienceLocation(
                                      review
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <StarRating
                                rating={
                                  review.rating
                                }
                              />
                            </td>

                            <td className="px-6 py-5">
                              <p className="max-w-[260px] truncate text-sm text-slate-400">
                                {review.comment ||
                                  "No comment"}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(
                                  review.status
                                )}`}
                              >
                                {review.status ||
                                  "pending"}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar
                                  size={13}
                                />

                                {formatDate(
                                  review.createdAt
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedReview(
                                      review
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
                                  title="View review"
                                >
                                  <Eye
                                    size={16}
                                  />
                                </button>

                                {review.status !==
                                  "approved" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateReviewStatus(
                                        reviewId,
                                        "approved"
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
                                    title="Approve review"
                                  >
                                    <Check
                                      size={16}
                                    />
                                  </button>
                                )}

                                {review.status !==
                                  "rejected" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateReviewStatus(
                                        reviewId,
                                        "rejected"
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                                    title="Reject review"
                                  >
                                    <X
                                      size={16}
                                    />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteReview(
                                      review
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                                  title="Delete review"
                                >
                                  <Trash2
                                    size={16}
                                  />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-800 lg:hidden">
                {paginatedReviews.map(
                  (review) => {
                    const reviewId =
                      review._id ||
                      review.id;

                    return (
                      <div
                        key={reviewId}
                        className="p-4"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                              <User
                                size={17}
                                className="text-emerald-400"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {getUserName(
                                  review
                                )}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {getExperienceName(
                                  review
                                )}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                              review.status
                            )}`}
                          >
                            {review.status ||
                              "pending"}
                          </span>
                        </div>

                        <div className="mb-3">
                          <StarRating
                            rating={
                              review.rating
                            }
                          />
                        </div>

                        <p className="mb-4 text-sm leading-6 text-slate-400">
                          {review.comment ||
                            "No comment"}
                        </p>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-600">
                            {formatDate(
                              review.createdAt
                            )}
                          </span>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedReview(
                                  review
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400"
                            >
                              <Eye
                                size={16}
                              />
                            </button>

                            {review.status !==
                              "approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateReviewStatus(
                                    reviewId,
                                    "approved"
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-emerald-400"
                              >
                                <Check
                                  size={16}
                                />
                              </button>
                            )}

                            {review.status !==
                              "rejected" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateReviewStatus(
                                    reviewId,
                                    "rejected"
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-red-400"
                              >
                                <X
                                  size={16}
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteReview(
                                  review
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-red-400"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}

          {!loading &&
            filteredReviews.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="text-slate-300">
                    {(currentPage - 1) *
                      itemsPerPage +
                      1}
                  </span>{" "}
                  to{" "}
                  <span className="text-slate-300">
                    {Math.min(
                      currentPage *
                        itemsPerPage,
                      filteredReviews.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-300">
                    {filteredReviews.length}
                  </span>{" "}
                  reviews
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.max(
                            1,
                            page - 1
                          )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft
                      size={17}
                    />
                  </button>

                  <span className="px-2 text-sm text-slate-400">
                    {currentPage} /{" "}
                    {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          Math.min(
                            totalPages,
                            page + 1
                          )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight
                      size={17}
                    />
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>

      <AnimatePresence>
        {selectedReview && (
          <ReviewModal
            review={selectedReview}
            onClose={() =>
              setSelectedReview(null)
            }
            onApprove={() =>
              updateReviewStatus(
                selectedReview._id ||
                  selectedReview.id,
                "approved"
              )
            }
            onReject={() =>
              updateReviewStatus(
                selectedReview._id ||
                  selectedReview.id,
                "rejected"
              )
            }
            onDelete={() => {
              setDeleteReview(
                selectedReview
              );
            }}
          />
        )}

        {deleteReview && (
          <DeleteModal
            review={deleteReview}
            onCancel={() =>
              setDeleteReview(null)
            }
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
        <Icon
          size={19}
          className="text-emerald-400"
        />
      </div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
};

const ReviewModal = ({
  review,
  onClose,
  onApprove,
  onReject,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
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
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Review Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <User
                size={20}
                className="text-emerald-400"
              />
            </div>

            <div>
              <p className="font-medium text-white">
                {getUserName(review)}
              </p>

              {review.user?.email && (
                <p className="text-sm text-slate-500">
                  {review.user.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
                Experience
              </p>

              <p className="text-sm font-medium text-white">
                {getExperienceName(
                  review
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {getExperienceLocation(
                  review
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-600">
                Rating
              </p>

              <StarRating
                rating={review.rating}
                size={18}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-slate-600">
              Review
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {review.comment ||
                  "No comment provided."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-5">
            <div>
              <p className="text-xs text-slate-600">
                Submitted
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {formatDate(
                  review.createdAt
                )}
              </p>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(
                review.status
              )}`}
            >
              {review.status || "pending"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800 px-6 py-4">
          {review.status !== "approved" && (
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
            >
              <Check size={16} />
              Approve
            </button>
          )}

          {review.status !== "rejected" && (
            <button
              type="button"
              onClick={onReject}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <X size={16} />
              Reject
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DeleteModal = ({
  review,
  onCancel,
  onConfirm,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
        }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <Trash2
            size={21}
            className="text-red-400"
          />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-white">
          Delete Review?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Are you sure you want to permanently
          delete this review? This action cannot
          be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-400"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminReviews;