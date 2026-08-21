import API from "./axios";

export const authService = {
  register: (data) => API.post("/auth/register", data),

  login: (data) => API.post("/auth/login", data),

  logout: () => API.post("/auth/logout"),

  getMe: () => API.get("/auth/me"),

  updateProfile: (data) => API.put("/auth/profile", data),

  changePassword: (data) => API.put("/auth/password", data),

  toggleFavorite: (experienceId) =>
    API.post(`/auth/favorites/${experienceId}`),

  getFavorites: (params = {}) =>
    API.get("/auth/favorites", { params }),

  deleteAccount: () =>
    API.delete("/auth/account"),
};

export const experienceService = {
  getAll: (params = {}) =>
    API.get("/experiences", { params }),

  getFeatured: () =>
    API.get("/experiences/featured"),

  getBySlug: (slug) =>
    API.get(`/experiences/${slug}`),

  getStats: () =>
    API.get("/experiences/stats"),

  create: (data) =>
    API.post("/experiences", data),

  update: (id, data) =>
    API.put(`/experiences/${id}`, data),

  delete: (id) =>
    API.delete(`/experiences/${id}`),

  addReview: (id, data) =>
    API.post(`/experiences/${id}/reviews`, data),

  deleteReview: (id, reviewId) =>
    API.delete(`/experiences/${id}/reviews/${reviewId}`),
};

export const categoryService = {
  getAll: (params = {}) =>
    API.get("/categories", { params }),

  getBySlug: (slug) =>
    API.get(`/categories/${slug}`),

  create: (data) =>
    API.post("/categories", data),

  update: (id, data) =>
    API.put(`/categories/${id}`, data),

  delete: (id) =>
    API.delete(`/categories/${id}`),
};

export const bookingService = {
  create: (data) =>
    API.post("/bookings", data),

  getMy: (params = {}) =>
    API.get("/bookings/me", { params }),

  getAll: (params = {}) =>
    API.get("/bookings", { params }),

  getById: (id) =>
    API.get(`/bookings/${id}`),

  cancel: (id, reason = "") =>
    API.put(`/bookings/${id}/cancel`, { reason }),

  updateStatus: (id, status) =>
    API.put(`/bookings/${id}/status`, { status }),
};

export const notificationService = {
  getMy: (params = {}) =>
    API.get("/notifications", { params }),

  markAsRead: (id) =>
    API.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    API.put("/notifications/read-all"),

  delete: (id) =>
    API.delete(`/notifications/${id}`),

  clearAll: () =>
    API.delete("/notifications"),
};

export const adminService = {
  getStats: () =>
    API.get("/admin/stats"),

  getUsers: (params = {}) =>
    API.get("/admin/users", { params }),

  updateUser: (id, data) =>
    API.put(`/admin/users/${id}`, data),

  deleteUser: (id) =>
    API.delete(`/admin/users/${id}`),
};

export const loginActivityService = {
  getAll: (params = {}) =>
    API.get("/login-activities", { params }),

  getByUser: (userId, params = {}) =>
    API.get(`/login-activities/user/${userId}`, { params }),

  getStats: () =>
    API.get("/login-activities/stats"),
};

export const contactService = {
  create: (data) =>
    API.post("/contacts", data),

  getAll: (params = {}) =>
    API.get("/contacts", { params }),

  getById: (id) =>
    API.get(`/contacts/${id}`),

  updateStatus: (id, status) =>
    API.patch(`/contacts/${id}/status`, { status }),

  delete: (id) =>
    API.delete(`/contacts/${id}`),
};

export default {
  authService,
  experienceService,
  categoryService,
  bookingService,
  notificationService,
  adminService,
  loginActivityService,
  contactService,
};