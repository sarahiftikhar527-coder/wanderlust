import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  Trash2,
  BellOff,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

import { useNotifications } from "../../context/NotificationContext";

import {
  timeAgo,
  cn,
  getErrorMessage,
} from "../../utils/helpers";

import EmptyState from "../../components/EmptyState";

import toast from "react-hot-toast";

const Notifications = () => {
  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
  } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState("");

  const [error, setError] = useState("");

  const loadNotifications = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        await refresh();
      } catch (err) {
        console.error(
          "Notifications fetch error:",
          err
        );

        setError(
          getErrorMessage(err) ||
            err?.response?.data?.message ||
            "Unable to load notifications. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refresh]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    if (!id || actionId || actionType) {
      return;
    }

    try {
      setActionId(id);
      setActionType("read");

      await markAsRead(id);

      toast.success("Notification marked as read.");
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );

      toast.error(
        getErrorMessage(err) ||
          err?.response?.data?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setActionId(null);
      setActionType("");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount <= 0 || actionType) {
      return;
    }

    try {
      setActionType("all-read");

      await markAllAsRead();

      toast.success(
        "All notifications marked as read."
      );
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err
      );

      toast.error(
        getErrorMessage(err) ||
          err?.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setActionType("");
    }
  };

  const handleDelete = async (id) => {
    if (!id || actionId || actionType) {
      return;
    }

    try {
      setActionId(id);
      setActionType("delete");

      await deleteNotification(id);

      toast.success("Notification deleted.");
    } catch (err) {
      console.error(
        "Delete notification error:",
        err
      );

      toast.error(
        getErrorMessage(err) ||
          err?.response?.data?.message ||
          "Unable to delete notification."
      );
    } finally {
      setActionId(null);
      setActionType("");
    }
  };

  const handleClearAll = async () => {
    if (!notifications.length || actionType) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all notifications?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionType("clear");

      await clearAll();

      toast.success(
        "All notifications cleared."
      );
    } catch (err) {
      console.error(
        "Clear notifications error:",
        err
      );

      toast.error(
        getErrorMessage(err) ||
          err?.response?.data?.message ||
          "Unable to clear notifications."
      );
    } finally {
      setActionType("");
    }
  };

  const handleRetry = () => {
    loadNotifications();
  };

  const totalNotifications = notifications.length;

  const unreadLabel =
    unreadCount === 1
      ? "notification unread"
      : "notifications unread";

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
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-1">
                  Notifications
                </h1>

                <p className="text-gray-500">
                  {loading
                    ? "Loading notifications..."
                    : `${unreadCount} ${unreadLabel}`}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadNotifications(true)
            }
            disabled={
              refreshing ||
              loading ||
              Boolean(actionType)
            }
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={cn(
                "w-4 h-4",
                refreshing && "animate-spin"
              )}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </motion.div>

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
            className="rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-red-700">
                  Unable to load notifications
                </p>

                <p className="text-sm text-red-600 mt-1 break-words">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                disabled={loading}
                className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading &&
        !error &&
        totalNotifications > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="card p-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-blue-600" />

                  <p className="font-semibold text-sm">
                    Notification Center
                  </p>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {totalNotifications} total{" "}
                  {totalNotifications === 1
                    ? "notification"
                    : "notifications"}

                  {unreadCount > 0 &&
                    ` • ${unreadCount} unread`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={
                      handleMarkAllAsRead
                    }
                    disabled={
                      Boolean(actionType) ||
                      loading
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionType ===
                    "all-read" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}

                    {actionType ===
                    "all-read"
                      ? "Marking..."
                      : "Mark all read"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={
                    Boolean(actionType) ||
                    totalNotifications === 0
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionType ===
                  "clear" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}

                  {actionType === "clear"
                    ? "Clearing..."
                    : "Clear all"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

      {loading ? (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="space-y-3"
        >
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="card p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl skeleton flex-shrink-0" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 skeleton rounded" />

                  <div className="h-4 w-4/5 skeleton rounded" />

                  <div className="h-3 w-20 skeleton rounded" />
                </div>

                <div className="w-16 h-8 skeleton rounded-lg" />
              </div>
            </div>
          ))}
        </motion.div>
      ) : totalNotifications === 0 ? (
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <EmptyState
            icon={BellOff}
            title="No notifications"
            message="You're all caught up! New notifications will appear here."
          />
        </motion.div>
      ) : (
        <motion.div
          layout
          className="space-y-3"
        >
          {notifications.map(
            (notification, index) => {
              const id =
                notification?._id ||
                notification?.id;

              const isRead = Boolean(
                notification?.isRead
              );

              const isDeleting =
                actionId === id &&
                actionType === "delete";

              const isMarkingRead =
                actionId === id &&
                actionType === "read";

              const hasActiveAction =
                Boolean(actionId) ||
                Boolean(actionType);

              return (
                <motion.div
                  key={id || index}
                  layout
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                    height: 0,
                  }}
                  transition={{
                    delay: index * 0.03,
                  }}
                  className={cn(
                    "card p-4 sm:p-5 transition-all",
                    !isRead &&
                      "border-blue-200 bg-blue-50/40"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        isRead
                          ? "bg-gray-100"
                          : "bg-blue-100"
                      )}
                    >
                      {isRead ? (
                        <Bell className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Bell className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                          )}

                          <p
                            className={cn(
                              "font-semibold text-sm truncate",
                              !isRead &&
                                "text-gray-900"
                            )}
                          >
                            {notification?.title ||
                              "Notification"}
                          </p>
                        </div>

                        {notification?.createdAt && (
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {timeAgo(
                              notification.createdAt
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 mt-1 leading-relaxed break-words">
                        {notification?.message ||
                          "You have a new notification."}
                      </p>

                      {notification?.type && (
                        <span className="inline-flex mt-2 px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wide">
                          {notification.type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isRead && id && (
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(id)
                          }
                          disabled={
                            hasActiveAction
                          }
                          className="w-9 h-9 rounded-lg hover:bg-blue-50 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Mark as read"
                        >
                          {isMarkingRead ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                          )}
                        </button>
                      )}

                      {id && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(id)
                          }
                          disabled={
                            hasActiveAction
                          }
                          className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete notification"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            }
          )}
        </motion.div>
      )}

      {!loading &&
        !error &&
        totalNotifications > 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl bg-blue-50 border border-blue-100 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <p className="font-semibold text-blue-900">
                  Stay updated
                </p>

                <p className="text-sm text-blue-700 mt-1">
                  Your booking updates, account
                  activity, and other important
                  messages will appear here.
                </p>
              </div>
            </div>
          </motion.div>
        )}
    </div>
  );
};

export default Notifications;