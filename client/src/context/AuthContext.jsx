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

  const isObject = useCallback((value) => {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    );
  }, []);

  const extractResponseData = useCallback(
    (response) => {
      let data = response?.data;

      if (!data) {
        return {};
      }

      if (
        isObject(data) &&
        isObject(data.data)
      ) {
        data = data.data;
      }

      return data;
    },
    [isObject]
  );

  const extractUser = useCallback(
    (response) => {
      const root = response?.data;

      if (!root) {
        return null;
      }

      if (
        root?.user &&
        typeof root.user === "object"
      ) {
        return root.user;
      }

      if (
        root?.currentUser &&
        typeof root.currentUser === "object"
      ) {
        return root.currentUser;
      }

      if (
        root?.profile &&
        typeof root.profile === "object"
      ) {
        return root.profile;
      }

      if (
        root?.data?.user &&
        typeof root.data.user === "object"
      ) {
        return root.data.user;
      }

      if (
        root?.data?.currentUser &&
        typeof root.data.currentUser === "object"
      ) {
        return root.data.currentUser;
      }

      if (
        root?.data?.profile &&
        typeof root.data.profile === "object"
      ) {
        return root.data.profile;
      }

      if (
        root?.data?.data?.user &&
        typeof root.data.data.user === "object"
      ) {
        return root.data.data.user;
      }

      if (
        root?.data?.data?.currentUser &&
        typeof root.data.data.currentUser === "object"
      ) {
        return root.data.data.currentUser;
      }

      if (
        root?.data?.data?.profile &&
        typeof root.data.data.profile === "object"
      ) {
        return root.data.data.profile;
      }

      if (
        typeof root === "object" &&
        root._id
      ) {
        return root;
      }

      if (
        typeof root?.data === "object" &&
        root.data?._id
      ) {
        return root.data;
      }

      return null;
    },
    []
  );

  const extractAuthData = useCallback(
    (response) => {
      const root = response?.data;

      let data = root;

      if (
        root?.data &&
        typeof root.data === "object"
      ) {
        data = root.data;
      }

      if (
        data?.data &&
        typeof data.data === "object"
      ) {
        data = data.data;
      }

      const authenticatedUser =
        extractUser(response);

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
    [extractUser]
  );

  const saveAuth = useCallback(
    ({
      token,
      refreshToken = null,
      authenticatedUser = null,
    }) => {
      if (token) {
        localStorage.setItem(
          TOKEN_KEY,
          token
        );
      }

      if (refreshToken) {
        localStorage.setItem(
          REFRESH_TOKEN_KEY,
          refreshToken
        );
      }

      if (authenticatedUser) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(authenticatedUser)
        );

        setUser(authenticatedUser);
      }
    },
    []
  );

  const loadStoredUser = useCallback(() => {
    try {
      const storedUser =
        localStorage.getItem(USER_KEY);

      if (!storedUser) {
        return null;
      }

      const parsedUser =
        JSON.parse(storedUser);

      if (
        !parsedUser ||
        typeof parsedUser !== "object"
      ) {
        localStorage.removeItem(USER_KEY);
        return null;
      }

      if (
        !parsedUser._id &&
        !parsedUser.id
      ) {
        localStorage.removeItem(USER_KEY);
        return null;
      }

      return parsedUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }, []);

  const loadUser = useCallback(async () => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const storedUser =
      loadStoredUser();

    if (storedUser) {
      setUser(storedUser);
    }

    try {
      const response =
        await authService.getMe();

      const currentUser =
        extractUser(response);

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
        const response =
          await authService.login(
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

        saveAuth({
          token,
          refreshToken,
          authenticatedUser:
            loggedInUser,
        });

        return {
          success: true,
          token,
          refreshToken,
          user: loggedInUser,
        };
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [
      clearAuth,
      extractAuthData,
      saveAuth,
    ]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const response =
          await authService.register(
            userData
          );

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

        saveAuth({
          token,
          refreshToken,
          authenticatedUser:
            registeredUser,
        });

        return {
          success: true,
          token,
          refreshToken,
          user: registeredUser,
        };
      } catch (error) {
        clearAuth();
        throw error;
      }
    },
    [
      clearAuth,
      extractAuthData,
      saveAuth,
    ]
  );

  const logout = useCallback(async () => {
    const token =
      localStorage.getItem(TOKEN_KEY);

    try {
      if (
        token &&
        typeof authService.logout ===
          "function"
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
        _id:
          updatedUser._id ||
          updatedUser.id,
      };

      setUser(normalizedUser);

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(normalizedUser)
      );
    },
    []
  );

  const refreshUser = useCallback(
    async () => {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

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

        saveAuth({
          token,
          authenticatedUser:
            currentUser,
        });

        return currentUser;
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
    },
    [
      clearAuth,
      extractUser,
      loadStoredUser,
      saveAuth,
    ]
  );

  const isAdmin = useMemo(() => {
    const role = String(
      user?.role || ""
    ).toLowerCase();

    return role === "admin";
  }, [user]);

  const isAuthenticated = useMemo(() => {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    return Boolean(
      user &&
      (user._id || user.id) &&
      token
    );
  }, [user]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          TOKEN_KEY
        )
      : null;

  const value = useMemo(
    () => ({
      user,
      loading,
      token,
      isAuthenticated,
      isAdmin,
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
      isAuthenticated,
      isAdmin,
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