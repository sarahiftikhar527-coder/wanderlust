export const formatCurrency = (
  amount,
  currency = "USD",
  locale = "en-US"
) => {
  const value = Number(amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
};

export const formatNumber = (
  value,
  locale = "en-US",
  options = {}
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat(locale, options).format(number);
};

export const formatCompactNumber = (
  value,
  locale = "en-US"
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

export const formatPercentage = (
  value,
  locale = "en-US",
  fractionDigits = 0
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0%";

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(number / 100);
};

export const formatDate = (
  date,
  locale = "en-US"
) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Invalid date";
  }

  return value.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatLongDate = (
  date,
  locale = "en-US"
) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Invalid date";
  }

  return value.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (
  date,
  locale = "en-US"
) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Invalid date";
  }

  return value.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (
  date,
  locale = "en-US"
) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Invalid time";
  }

  return value.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const timeAgo = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Unknown";
  }

  const seconds = Math.floor(
    (Date.now() - value.getTime()) / 1000
  );

  if (seconds < 0 || seconds < 10) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(months / 12);

  return `${years}y ago`;
};

export const getErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message.trim();
  }

  if (
    typeof responseData?.error === "string" &&
    responseData.error.trim()
  ) {
    return responseData.error.trim();
  }

  if (
    typeof error?.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  if (error?.code === "ERR_NETWORK") {
    return "Unable to connect to the server. Please try again.";
  }

  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  return "Something went wrong. Please try again.";
};

export const getValidationErrors = (error) => {
  const errors =
    error?.response?.data?.errors ||
    error?.response?.data?.validationErrors;

  if (!errors) {
    return {};
  }

  if (Array.isArray(errors)) {
    return errors.reduce((acc, item) => {
      if (item?.field) {
        acc[item.field] =
          item.message || "Invalid value";
      }

      return acc;
    }, {});
  }

  if (
    typeof errors === "object" &&
    !Array.isArray(errors)
  ) {
    return Object.entries(errors).reduce(
      (acc, [key, value]) => {
        acc[key] = Array.isArray(value)
          ? value[0]
          : value?.message || value || "Invalid value";

        return acc;
      },
      {}
    );
  }

  return {};
};

export const getStatusCode = (error) => {
  return error?.response?.status || null;
};

export const isUnauthorized = (error) => {
  return getStatusCode(error) === 401;
};

export const isForbidden = (error) => {
  return getStatusCode(error) === 403;
};

export const isNotFound = (error) => {
  return getStatusCode(error) === 404;
};

export const isServerError = (error) => {
  const status = getStatusCode(error);

  return status >= 500 && status <= 599;
};

export const truncate = (
  str,
  length = 100
) => {
  if (!str) return "";

  const value = String(str);
  const maxLength = Math.max(
    0,
    Number(length) || 100
  );

  if (value.length <= maxLength) {
    return value;
  }

  return `${value
    .slice(0, maxLength)
    .trimEnd()}...`;
};

export const capitalize = (str) => {
  if (!str) return "";

  const value = String(str);

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
};

export const capitalizeWords = (str) => {
  if (!str) return "";

  return String(str)
    .trim()
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(" ");
};

export const slugify = (str) => {
  if (!str) return "";

  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const isValidEmail = (email) => {
  if (!email) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );
};

export const isStrongPassword = (
  password
) => {
  if (!password) return false;

  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

export const getPasswordStrength = (
  password
) => {
  if (!password) {
    return {
      score: 0,
      label: "",
      color: "gray",
    };
  }

  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return {
      score,
      label: "Weak",
      color: "red",
    };
  }

  if (score <= 4) {
    return {
      score,
      label: "Good",
      color: "amber",
    };
  }

  return {
    score,
    label: "Strong",
    color: "emerald",
  };
};

export const isValidUrl = (url) => {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    return ["http:", "https:"].includes(
      parsed.protocol
    );
  } catch {
    return false;
  }
};

export const isValidPhone = (phone) => {
  if (!phone) return false;

  const normalized = String(phone)
    .replace(/[\s()-]/g, "");

  return /^\+?[0-9]{7,15}$/.test(
    normalized
  );
};

export const getInitials = (name) => {
  if (!name) return "";

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");
};

export const getFirstName = (name) => {
  if (!name) return "";

  return String(name)
    .trim()
    .split(/\s+/)[0];
};

export const getFullName = (
  firstName,
  lastName
) => {
  return [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
};

export const cn = (...classes) => {
  return classes
    .flat(Infinity)
    .filter(
      (className) =>
        typeof className === "string" &&
        className.trim()
    )
    .join(" ");
};

export const sleep = (ms = 0) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const debounce = (
  callback,
  delay = 300
) => {
  let timeout;

  const debounced = (...args) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
};

export const throttle = (
  callback,
  limit = 300
) => {
  let waiting = false;

  return (...args) => {
    if (waiting) return;

    callback(...args);

    waiting = true;

    setTimeout(() => {
      waiting = false;
    }, limit);
  };
};

export const clamp = (
  value,
  min,
  max
) => {
  return Math.min(
    Math.max(Number(value) || 0, min),
    max
  );
};

export const randomNumber = (
  min,
  max
) => {
  const minimum = Math.ceil(min);
  const maximum = Math.floor(max);

  return (
    Math.floor(
      Math.random() *
        (maximum - minimum + 1)
    ) + minimum
  );
};

export const generateId = (
  prefix = ""
) => {
  const id =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;

  return prefix ? `${prefix}-${id}` : id;
};

export const copyToClipboard = async (
  text
) => {
  if (!navigator?.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(
      String(text ?? "")
    );

    return true;
  } catch {
    return false;
  }
};

export const getImageUrl = (
  image,
  fallback = "/images/placeholder.jpg"
) => {
  if (!image) return fallback;

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object") {
    return (
      image.url ||
      image.secure_url ||
      image.src ||
      image.path ||
      fallback
    );
  }

  return fallback;
};

export const getArrayValue = (
  value
) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  return [value];
};

export const uniqueArray = (
  array,
  key
) => {
  if (!Array.isArray(array)) {
    return [];
  }

  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();

  return array.filter((item) => {
    const value =
      typeof key === "function"
        ? key(item)
        : item?.[key];

    if (seen.has(value)) {
      return false;
    }

    seen.add(value);

    return true;
  });
};

export const sortBy = (
  array,
  key,
  direction = "asc"
) => {
  if (!Array.isArray(array)) {
    return [];
  }

  const sorted = [...array];

  sorted.sort((a, b) => {
    const aValue =
      typeof key === "function"
        ? key(a)
        : a?.[key];

    const bValue =
      typeof key === "function"
        ? key(b)
        : b?.[key];

    if (aValue === bValue) return 0;

    if (aValue == null) return 1;
    if (bValue == null) return -1;

    const comparison =
      String(aValue).localeCompare(
        String(bValue),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      );

    return direction === "desc"
      ? -comparison
      : comparison;
  });

  return sorted;
};

export const groupBy = (
  array,
  key
) => {
  if (!Array.isArray(array)) {
    return {};
  }

  return array.reduce((groups, item) => {
    const groupKey =
      typeof key === "function"
        ? key(item)
        : item?.[key];

    const normalizedKey =
      String(groupKey ?? "unknown");

    if (!groups[normalizedKey]) {
      groups[normalizedKey] = [];
    }

    groups[normalizedKey].push(item);

    return groups;
  }, {});
};

export const buildQueryString = (
  params = {}
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (
            item !== undefined &&
            item !== null &&
            item !== ""
          ) {
            searchParams.append(
              key,
              String(item)
            );
          }
        });

        return;
      }

      searchParams.set(
        key,
        String(value)
      );
    }
  );

  return searchParams.toString();
};

export const parseQueryString = (
  queryString = ""
) => {
  const query = queryString.startsWith("?")
    ? queryString.slice(1)
    : queryString;

  const params = new URLSearchParams(query);
  const result = {};

  params.forEach((value, key) => {
    if (key in result) {
      result[key] = Array.isArray(
        result[key]
      )
        ? [...result[key], value]
        : [result[key], value];
    } else {
      result[key] = value;
    }
  });

  return result;
};

export const isEmpty = (value) => {
  if (value == null) return true;

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.keys(value).length === 0;
  }

  return false;
};

export const normalizeString = (
  value
) => {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
};

export const safeJsonParse = (
  value,
  fallback = null
) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const safeJsonStringify = (
  value,
  fallback = ""
) => {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

export const storage = {
  get(key, fallback = null) {
    try {
      const value =
        localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return safeJsonParse(
        value,
        value
      );
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(
        key,
        typeof value === "string"
          ? value
          : JSON.stringify(value)
      );

      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);

      return true;
    } catch {
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();

      return true;
    } catch {
      return false;
    }
  },
};

export const sessionStorageHelper = {
  get(key, fallback = null) {
    try {
      const value =
        window.sessionStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return safeJsonParse(
        value,
        value
      );
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      window.sessionStorage.setItem(
        key,
        typeof value === "string"
          ? value
          : JSON.stringify(value)
      );

      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      window.sessionStorage.removeItem(key);

      return true;
    } catch {
      return false;
    }
  },

  clear() {
    try {
      window.sessionStorage.clear();

      return true;
    } catch {
      return false;
    }
  },
};

export const getBookingStatusLabel = (
  status
) => {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
    rejected: "Rejected",
    paid: "Paid",
    failed: "Failed",
  };

  return (
    labels?.[
      String(status)
        .toLowerCase()
        .trim()
    ] || capitalizeWords(status || "Unknown")
  );
};

export const getBookingStatusClass = (
  status
) => {
  const classes = {
    pending:
      "bg-amber-100 text-amber-700 border-amber-200",
    confirmed:
      "bg-blue-100 text-blue-700 border-blue-200",
    cancelled:
      "bg-red-100 text-red-700 border-red-200",
    completed:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected:
      "bg-red-100 text-red-700 border-red-200",
    paid:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    failed:
      "bg-red-100 text-red-700 border-red-200",
  };

  return (
    classes?.[
      String(status)
        .toLowerCase()
        .trim()
    ] ||
    "bg-gray-100 text-gray-700 border-gray-200"
  );
};

export const getRoleLabel = (role) => {
  const roles = {
    admin: "Administrator",
    user: "Traveler",
    moderator: "Moderator",
  };

  return (
    roles?.[
      String(role)
        .toLowerCase()
        .trim()
    ] || capitalizeWords(role || "User")
  );
};

export const calculateAverage = (
  values
) => {
  if (!Array.isArray(values) || !values.length) {
    return 0;
  }

  const numbers = values
    .map(Number)
    .filter(Number.isFinite);

  if (!numbers.length) return 0;

  return (
    numbers.reduce(
      (sum, value) => sum + value,
      0
    ) / numbers.length
  );
};

export const calculatePercentage = (
  value,
  total
) => {
  const current = Number(value);
  const maximum = Number(total);

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(maximum) ||
    maximum === 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (current / maximum) * 100
    )
  );
};

export const isDateInPast = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return false;
  }

  return value.getTime() < Date.now();
};

export const isDateToday = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return false;
  }

  const now = new Date();

  return (
    value.getFullYear() ===
      now.getFullYear() &&
    value.getMonth() === now.getMonth() &&
    value.getDate() === now.getDate()
  );
};

export const daysBetween = (
  startDate,
  endDate
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  const difference =
    Math.abs(end.getTime() - start.getTime());

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};

export const formatDuration = (
  minutes
) => {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value < 0) {
    return "0 min";
  }

  const hours = Math.floor(value / 60);
  const remainingMinutes = Math.round(
    value % 60
  );

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const formatRating = (
  rating,
  decimals = 1
) => {
  const value = Number(rating);

  if (!Number.isFinite(value)) {
    return "0.0";
  }

  return value.toFixed(decimals);
};

export const getRatingPercentage = (
  rating,
  maxRating = 5
) => {
  const value = Number(rating);

  if (
    !Number.isFinite(value) ||
    !Number.isFinite(maxRating) ||
    maxRating <= 0
  ) {
    return 0;
  }

  return clamp(
    (value / maxRating) * 100,
    0,
    100
  );
};

export const parseNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

export const parseBoolean = (
  value,
  fallback = false
) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized =
      value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return fallback;
};

export const downloadFile = (
  url,
  filename = "download"
) => {
  if (!url) return;

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

export const scrollToTop = (
  behavior = "smooth"
) => {
  window.scrollTo({
    top: 0,
    behavior,
  });
};

export const scrollToElement = (
  id,
  behavior = "smooth"
) => {
  const element =
    document.getElementById(id);

  if (!element) return;

  element.scrollIntoView({
    behavior,
    block: "start",
  });
};