import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { notificationService } from "../api/services";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }

  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(true);
  const requestRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (requestRef.current) {
        requestRef.current = null;
      }
    };
  }, []);

  const clearNotifications = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const normalizeNotifications = useCallback((response) => {
    const responseData = response?.data;

    const payload =
      responseData?.data &&
      typeof responseData.data === "object"
        ? responseData.data
        : responseData || {};

    let items = [];

    if (Array.isArray(payload?.notifications)) {
      items = payload.notifications;
    } else if (Array.isArray(payload?.items)) {
      items = payload.items;
    } else if (Array.isArray(payload?.results)) {
      items = payload.results;
    } else if (Array.isArray(payload)) {
      items = payload;
    }

    const unreadFromServer =
      typeof payload?.unreadCount === "number"
        ? payload.unreadCount
        : typeof payload?.unread === "number"
          ? payload.unread
          : null;

    const calculatedUnread = items.filter(
      (notification) => !notification?.isRead
    ).length;

    return {
      notifications: items,
      unreadCount:
        unreadFromServer !== null
          ? Math.max(0, unreadFromServer)
          : calculatedUnread,
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      clearNotifications();
      return {
        notifications: [],
        unreadCount: 0,
      };
    }

    if (requestRef.current) {
      return requestRef.current;
    }

    setLoading(true);

    const request = notificationService
      .getMy({
        page: 1,
        limit: 20,
      })
      .then((response) => {
        const normalized = normalizeNotifications(response);

        if (mountedRef.current) {
          setNotifications(normalized.notifications);
          setUnreadCount(normalized.unreadCount);
        }

        return normalized;
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          clearNotifications();
        }

        throw error;
      })
      .finally(() => {
        requestRef.current = null;

        if (mountedRef.current) {
          setLoading(false);
        }
      });

    requestRef.current = request;

    return request;
  }, [
    isAuthenticated,
    clearNotifications,
    normalizeNotifications,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearNotifications();
      return;
    }

    let cancelled = false;

    const loadNotifications = async () => {
      try {
        await refresh();
      } catch (error) {
        if (
          !cancelled &&
          error?.response?.status !== 401
        ) {
          console.error(
            "Failed to load notifications:",
            error
          );
        }
      }
    };

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    refresh,
    clearNotifications,
  ]);

  const markAsRead = useCallback(
    async (id) => {
      if (!id) {
        return;
      }

      const notification = notifications.find(
        (item) => item?._id === id
      );

      if (!notification || notification.isRead) {
        return;
      }

      const previousNotifications = notifications;
      const previousUnreadCount = unreadCount;

      setNotifications((previous) =>
        previous.map((item) =>
          item?._id === id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );

      try {
        await notificationService.markAsRead(id);
      } catch (error) {
        if (mountedRef.current) {
          setNotifications(previousNotifications);
          setUnreadCount(previousUnreadCount);
        }

        if (error?.response?.status === 401) {
          clearNotifications();
        }

        console.error(
          "Failed to mark notification as read:",
          error
        );

        throw error;
      }
    },
    [
      notifications,
      unreadCount,
      clearNotifications,
    ]
  );

  const markAllAsRead = useCallback(async () => {
    if (unreadCount <= 0) {
      return;
    }

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      if (mountedRef.current) {
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
      }

      if (error?.response?.status === 401) {
        clearNotifications();
      }

      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      throw error;
    }
  }, [
    notifications,
    unreadCount,
    clearNotifications,
  ]);

  const deleteNotification = useCallback(
    async (id) => {
      if (!id) {
        return;
      }

      const notification = notifications.find(
        (item) => item?._id === id
      );

      if (!notification) {
        return;
      }

      const previousNotifications = notifications;
      const previousUnreadCount = unreadCount;

      setNotifications((previous) =>
        previous.filter(
          (item) => item?._id !== id
        )
      );

      if (!notification.isRead) {
        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }

      try {
        await notificationService.delete(id);
      } catch (error) {
        if (mountedRef.current) {
          setNotifications(previousNotifications);
          setUnreadCount(previousUnreadCount);
        }

        if (error?.response?.status === 401) {
          clearNotifications();
        }

        console.error(
          "Failed to delete notification:",
          error
        );

        throw error;
      }
    },
    [
      notifications,
      unreadCount,
      clearNotifications,
    ]
  );

  const clearAll = useCallback(async () => {
    if (notifications.length === 0) {
      return;
    }

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications([]);
    setUnreadCount(0);

    try {
      await notificationService.clearAll();
    } catch (error) {
      if (mountedRef.current) {
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
      }

      if (error?.response?.status === 401) {
        clearNotifications();
      }

      console.error(
        "Failed to clear notifications:",
        error
      );

      throw error;
    }
  }, [
    notifications,
    unreadCount,
    clearNotifications,
  ]);

  const getNotificationById = useCallback(
    (id) => {
      if (!id) {
        return null;
      }

      return (
        notifications.find(
          (notification) =>
            notification?._id === id
        ) || null
      );
    },
    [notifications]
  );

  const hasUnread = unreadCount > 0;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      hasUnread,
      loading,
      refresh,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      clearNotifications,
      getNotificationById,
    }),
    [
      notifications,
      unreadCount,
      hasUnread,
      loading,
      refresh,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      clearNotifications,
      getNotificationById,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;