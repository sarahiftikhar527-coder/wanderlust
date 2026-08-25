import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authService } from "../api/services";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const normalizeRole = useCallback((value) => {
    return String(value || "").trim().toLowerCase();
  }, []);

  const isObject = useCallback((value) => {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }, []);

  const extractUser = useCallback(
    (response) => {
      const root = response?.data;

      if (!root) {
        return null;
      }

      if (isObject(root?.user)) {
        return root.user;
      }

      if (isObject(root?.currentUser)) {
        return root.currentUser;
      }

      if (isObject(root?.profile)) {
        return root.profile;
      }

      if (isObject(root?.data?.user)) {
        return root.data.user;
      }

      if (isObject(root?.data?.currentUser)) {
        return root.data.currentUser;
      }

      if (isObject(root?.data?.profile)) {
        return root.data.profile;
      }

      if (isObject(root?.data?.data?.user)) {
        return root.data.data.user;
      }

      if (isObject(root?.data?.data?.currentUser)) {
        return root.data.data.currentUser;
      }

      if (isObject(root?.data?.data?.profile)) {
        return root.data.data.profile;
      }

      if (isObject(root) && (root._id || root.id)) {
        return root;
      }

      if (
        isObject(root?.data) &&
        (root.data._id || root.data.id)
      ) {
        return root.data;
      }

      return null;
    },
    [isObject]
  );

  const extractAuthData = useCallback(
    (response) => {
      const root = response?.data;

      let data = root;

      if (isObject(root?.data)) {
        data = root.data;
      }

      if (isObject(data?.data)) {
        data = data.data;
      }

      const authenticatedUser = extractUser(response);

      return {
        token:
          data?.token ||
          data?.accessToken ||
          data?.access_token ||
          root?.token ||
          root?.accessToken ||
          root?.access_token ||
          null,

        refreshToken:
          data?.refreshToken ||
          data?.refresh_token ||
          root?.refreshToken ||
          root?.refresh_token ||
          null,

        user: authenticatedUser,
      };
    },
    [extractUser, isObject]
  );

  const saveAuth = useCallback(
    ({
      token,
      refreshToken = null,
      authenticatedUser = null,
    }) => {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }

      if (refreshToken) {
        localStorage.setItem(
          REFRESH_TOKEN_KEY,
          refreshToken
        );
      }

      if (authenticatedUser) {
        const normalizedUser = {
          ...authenticatedUser,
          _id:
            authenticatedUser._id ||
            authenticatedUser.id,
          role: normalizeRole(authenticatedUser.role),
        };

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(normalizedUser)
        );

        setUser(normalizedUser);
      }
    },
    [normalizeRole]
  );

  const loadStoredUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedUser) {
        return null;
      }

      const parsedUser = JSON.parse(storedUser);

      if (
        !parsedUser ||
        typeof parsedUser !== "object"
      ) {
        localStorage.removeItem(USER_KEY);
        return null;
      }

      if (!parsedUser._id && !parsedUser.id) {
        localStorage.removeItem(USER_KEY);
        return null;
      }

      const normalizedUser = {
        ...parsedUser,
        _id: parsedUser._id || parsedUser.id,
        role: normalizeRole(parsedUser.role),
      };

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(normalizedUser)
      );

      return normalizedUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }, [normalizeRole]);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const storedUser = loadStoredUser();

    if (storedUser) {
      setUser(storedUser);
    }

    try {
      const response = await authService.getMe();

      const currentUser = extractUser(response);

      if (
        currentUser &&
        typeof currentUser === "object"
      ) {
        saveAuth({
          token,
          authenticatedUser: currentUser,
        });
      } else if (!storedUser) {
        throw new Error(
          "Unable to retrieve authenticated user."
        );
      }
    } catch (error) {
      if (!storedUser) {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  }, [
    clearAuth,
    extractUser,
    loadStoredUser,
    saveAuth,
  ]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (credentials) => {
      try {
        const response = await authService.login(
          credentials
        );

        const {
          token,
          refreshToken,
          user: loggedInUser,
        } = extractAuthData(response);

        if (!token) {
          throw new Error(
            "Authentication token was not returned by the server."
          );
        }

        if (
          !loggedInUser ||
          typeof loggedInUser !== "object"
        ) {
          throw new Error(
            "User information was not returned by the server."
          );
        }

        const normalizedUser = {
          ...loggedInUser,
          _id:
            loggedInUser._id ||
            loggedInUser.id,
          role: normalizeRole(loggedInUser.role),
        };

        saveAuth({
          token,
          refreshToken,
          authenticatedUser: normalizedUser,
        });

        return {
          success: true,
          token,
          refreshToken,
          user: normalizedUser,
        };
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [
      clearAuth,
      extractAuthData,
      normalizeRole,
      saveAuth,
    ]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const response =
          await authService.register(userData);

        const {
          token,
          refreshToken,
          user: registeredUser,
        } = extractAuthData(response);

        if (!token) {
          throw new Error(
            "Authentication token was not returned by the server."
          );
        }

        if (
          !registeredUser ||
          typeof registeredUser !== "object"
        ) {
          throw new Error(
            "User information was not returned by the server."
          );
        }

        const normalizedUser = {
          ...registeredUser,
          _id:
            registeredUser._id ||
            registeredUser.id,
          role: normalizeRole(
            registeredUser.role
          ),
        };

        saveAuth({
          token,
          refreshToken,
          authenticatedUser: normalizedUser,
        });

        return {
          success: true,
          token,
          refreshToken,
          user: normalizedUser,
        };
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [
      clearAuth,
      extractAuthData,
      normalizeRole,
      saveAuth,
    ]
  );

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
      if (
        token &&
        typeof authService.logout === "function"
      ) {
        await authService.logout();
      }
    } catch {
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const updateUser = useCallback(
    (updatedUser) => {
      if (
        !updatedUser ||
        typeof updatedUser !== "object"
      ) {
        return;
      }

      const userId =
        updatedUser._id ||
        updatedUser.id;

      if (!userId) {
        return;
      }

      const normalizedUser = {
        ...updatedUser,
        _id: userId,
        role: normalizeRole(updatedUser.role),
      };

      setUser(normalizedUser);

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(normalizedUser)
      );
    },
    [normalizeRole]
  );

  const refreshUser = useCallback(async () => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (!token) {
      clearAuth();
      return null;
    }

    try {
      const response =
        await authService.getMe();

      const currentUser =
        extractUser(response);

      if (
        !currentUser ||
        typeof currentUser !== "object"
      ) {
        throw new Error(
          "Unable to retrieve authenticated user."
        );
      }

      const normalizedUser = {
        ...currentUser,
        _id:
          currentUser._id ||
          currentUser.id,
        role: normalizeRole(
          currentUser.role
        ),
      };

      saveAuth({
        token,
        authenticatedUser:
          normalizedUser,
      });

      return normalizedUser;
    } catch (error) {
      const storedUser =
        loadStoredUser();

      if (storedUser) {
        setUser(storedUser);
        return storedUser;
      }

      clearAuth();
      throw error;
    }
  }, [
    clearAuth,
    extractUser,
    loadStoredUser,
    normalizeRole,
    saveAuth,
  ]);

  const userRole = useMemo(() => {
    return normalizeRole(user?.role);
  }, [user, normalizeRole]);

  const isAdmin = useMemo(() => {
    return (
      userRole === "admin" ||
      userRole === "owner" ||
      userRole === "superadmin" ||
      userRole === "super_admin"
    );
  }, [userRole]);

  const isOwner = useMemo(() => {
    return userRole === "owner";
  }, [userRole]);

  const isAuthenticated = useMemo(() => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    return Boolean(
      user &&
      (user._id || user.id) &&
      token
    );
  }, [user]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null;

  const value = useMemo(
    () => ({
      user,
      loading,
      token,
      userRole,
      isAuthenticated,
      isAdmin,
      isOwner,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      clearAuth,
    }),
    [
      user,
      loading,
      token,
      userRole,
      isAuthenticated,
      isAdmin,
      isOwner,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      clearAuth,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;