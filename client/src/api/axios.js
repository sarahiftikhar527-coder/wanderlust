import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 15000,
});

const TOKEN_KEYS = [
  "token",
  "accessToken",
  "access_token",
  "wanderlust_access_token",
];

const getAuthToken = () => {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  return "";
};

const clearAuthStorage = () => {
  TOKEN_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  localStorage.removeItem("user");
};

API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      const isAuthPage =
        currentPath === "/login" ||
        currentPath === "/register";

      if (!isAuthPage) {
        clearAuthStorage();

        const redirectPath = encodeURIComponent(
          `${currentPath}${window.location.search}`
        );

        window.location.replace(
          `/login?expired=true&from=${redirectPath}`
        );
      }
    }

    if (status === 403) {
      console.warn(
        "Access denied:",
        error.response?.data?.message ||
          "You do not have permission to perform this action."
      );
    }

    if (status === 429) {
      console.warn(
        "Rate limit exceeded:",
        error.response?.data?.message ||
          "Too many requests. Please try again later."
      );
    }

    return Promise.reject(error);
  }
);

export const api = API;

export default API;