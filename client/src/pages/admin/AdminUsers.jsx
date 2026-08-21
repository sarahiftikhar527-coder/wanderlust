import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Eye,
  X,
  Shield,
  User,
  Mail,
  Calendar,
  Trash2,
  RefreshCw,
  Loader2,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { adminService } from "../../api/services";
import { formatDate } from "../../utils/helpers";

const ROLE_OPTIONS = ["ALL", "USER", "ADMIN"];

const DEFAULT_AVATAR_GRADIENT =
  "bg-gradient-to-br from-primary-400 to-primary-600";

const getUserRole = (user) => {
  return user?.role?.toUpperCase() || "USER";
};

const isUserActive = (user) => {
  return (
    user?.isActive !== false &&
    user?.status?.toUpperCase() !== "INACTIVE"
  );
};

const getUserInitial = (user) => {
  return user?.name?.charAt(0)?.toUpperCase() || "U";
};

const getUserId = (user) => {
  return user?._id || user?.id || "";
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const fetchUsers = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await adminService.getUsers({
        page: 1,
        limit: 100,
      });

      const data =
        response?.data?.data?.users ||
        response?.data?.users ||
        response?.data?.data ||
        [];

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Users fetch error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load users. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) => {
      const userRole = getUserRole(user);

      const matchesRole =
        role === "ALL" || userRole === role;

      if (!matchesRole) {
        return false;
      }

      if (!query) {
        return true;
      }

      const name = user?.name?.toLowerCase() || "";
      const email = user?.email?.toLowerCase() || "";
      const id = getUserId(user).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        id.includes(query)
      );
    });
  }, [users, search, role]);

  const stats = useMemo(() => {
    const total = users.length;

    const admins = users.filter(
      (user) => getUserRole(user) === "ADMIN"
    ).length;

    const activeUsers = users.filter((user) =>
      isUserActive(user)
    ).length;

    const inactiveUsers = total - activeUsers;
    const regularUsers = total - admins;

    return {
      total,
      admins,
      regularUsers,
      activeUsers,
      inactiveUsers,
    };
  }, [users]);

  const updateUserRole = async (id, newRole) => {
    if (!id || !newRole) {
      return;
    }

    setUpdatingId(id);
    setUpdatingRole(newRole);
    setError("");
    setSuccess("");

    try {
      await adminService.updateUser(id, {
        role: newRole,
      });

      setUsers((prev) =>
        prev.map((user) =>
          getUserId(user) === id
            ? {
                ...user,
                role: newRole,
              }
            : user
        )
      );

      setSelectedUser((prev) =>
        prev && getUserId(prev) === id
          ? {
              ...prev,
              role: newRole,
            }
          : prev
      );

      showSuccess(
        `User role successfully changed to ${
          newRole === "ADMIN"
            ? "Administrator"
            : "Regular User"
        }.`
      );
    } catch (err) {
      console.error("Role update error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update user role."
      );
    } finally {
      setUpdatingId(null);
      setUpdatingRole(null);
    }
  };

  const deleteUser = async (id) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await adminService.deleteUser(id);

      setUsers((prev) =>
        prev.filter((user) => getUserId(user) !== id)
      );

      setSelectedUser((prev) =>
        prev && getUserId(prev) === id ? null : prev
      );

      showSuccess("User deleted successfully.");
    } catch (err) {
      console.error("Delete user error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRole("ALL");
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>

          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900">
              Users
            </h1>

            <p className="text-gray-500 mt-1">
              Manage registered users and administrator accounts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          {refreshing ? "Refreshing..." : "Refresh Users"}
        </button>
      </motion.div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
              height: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              y: -10,
              height: 0,
            }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>

              <p className="text-sm font-semibold">
                {success}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                Something went wrong
              </p>

              <p className="text-xs mt-1 text-red-600 break-words">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.total}
          className="bg-primary-50 text-primary-600"
          delay={0}
        />

        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={stats.activeUsers}
          className="bg-emerald-50 text-emerald-600"
          delay={0.05}
        />

        <StatCard
          icon={User}
          label="Regular Users"
          value={stats.regularUsers}
          className="bg-blue-50 text-blue-600"
          delay={0.1}
        />

        <StatCard
          icon={Shield}
          label="Administrators"
          value={stats.admins}
          className="bg-purple-50 text-purple-600"
          delay={0.15}
        />
      </div>

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
          delay: 0.1,
        }}
        className="card p-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email or ID..."
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white outline-none text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="appearance-none w-full lg:w-48 px-4 pr-10 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 font-medium text-sm cursor-pointer"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL"
                    ? "All Roles"
                    : option === "USER"
                    ? "Regular Users"
                    : "Administrators"}
                </option>
              ))}
            </select>

            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {(search || role !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {users.length}
            </span>{" "}
            users
          </p>

          {role !== "ALL" && (
            <span className="inline-flex items-center self-start px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold">
              {role === "ADMIN"
                ? "Administrators"
                : "Regular Users"}
            </span>
          )}
        </div>
      </motion.div>

      {loading ? (
        <UsersTableSkeleton />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          search={search}
          role={role}
          onClear={clearFilters}
        />
      ) : (
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    User
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Role
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Joined
                  </th>

                  <th className="text-right px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user, index) => {
                  const userRole = getUserRole(user);
                  const active = isUserActive(user);

                  return (
                    <UserTableRow
                      key={getUserId(user) || index}
                      user={user}
                      userRole={userRole}
                      isActive={active}
                      index={index}
                      deletingId={deletingId}
                      onView={() => setSelectedUser(user)}
                      onDelete={() => deleteUser(getUserId(user))}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            updatingId={updatingId}
            updatingRole={updatingRole}
            deletingId={deletingId}
            onClose={() => setSelectedUser(null)}
            onUpdateRole={updateUserRole}
            onDelete={deleteUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const UserTableRow = ({
  user,
  userRole,
  isActive,
  index,
  deletingId,
  onView,
  onDelete,
}) => {
  const initial = getUserInitial(user);
  const id = getUserId(user);
  const isDeleting = deletingId === id;

  return (
    <motion.tr
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: Math.min(index * 0.025, 0.3),
      }}
      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl overflow-hidden ${DEFAULT_AVATAR_GRADIENT} flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {initial}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-800 truncate max-w-[230px]">
              {user?.name || "Unnamed User"}
            </p>

            <p className="text-xs text-gray-500 truncate max-w-[230px] mt-0.5">
              {user?.email || "No email"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <RoleBadge role={userRole} />
      </td>

      <td className="px-5 py-4">
        <StatusBadge active={isActive} />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />

          {user?.createdAt
            ? formatDate(user.createdAt)
            : "—"}
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="w-9 h-9 rounded-lg border border-red-100 bg-white text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete user"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

const UserDetailsModal = ({
  user,
  updatingId,
  updatingRole,
  deletingId,
  onClose,
  onUpdateRole,
  onDelete,
}) => {
  const userRole = getUserRole(user);
  const active = isUserActive(user);
  const initial = getUserInitial(user);
  const id = getUserId(user);

  const isUpdating = updatingId === id;
  const isDeleting = deletingId === id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900">
              User Details
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Account information and permissions
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating || isDeleting}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-24 h-24 rounded-2xl overflow-hidden ${DEFAULT_AVATAR_GRADIENT} flex items-center justify-center shadow-lg`}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {initial}
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-xl mt-4 text-gray-900">
              {user?.name || "Unnamed User"}
            </h3>

            <p className="text-gray-500 text-sm mt-1 break-all">
              {user?.email || "No email"}
            </p>

            <div className="mt-3">
              <StatusBadge active={active} />
            </div>
          </div>

          <div className="grid gap-3">
            <InfoRow
              icon={Mail}
              label="Email"
              value={user?.email || "—"}
            />

            <InfoRow
              icon={Shield}
              label="Role"
              value={userRole}
            />

            <InfoRow
              icon={Calendar}
              label="Joined"
              value={
                user?.createdAt
                  ? formatDate(user.createdAt)
                  : "—"
              }
            />

            <InfoRow
              icon={active ? UserCheck : UserX}
              label="Account Status"
              value={active ? "Active" : "Inactive"}
            />

            {id && (
              <InfoRow
                icon={User}
                label="User ID"
                value={id}
              />
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  Account Role
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Change this user's permissions.
                </p>
              </div>

              <RoleBadge role={userRole} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={
                  isUpdating ||
                  isDeleting ||
                  userRole === "USER"
                }
                onClick={() =>
                  onUpdateRole(id, "USER")
                }
                className={`py-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition ${
                  userRole === "USER"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdating &&
                updatingRole === "USER" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}

                Regular User
              </button>

              <button
                type="button"
                disabled={
                  isUpdating ||
                  isDeleting ||
                  userRole === "ADMIN"
                }
                onClick={() =>
                  onUpdateRole(id, "ADMIN")
                }
                className={`py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
                  userRole === "ADMIN"
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdating &&
                updatingRole === "ADMIN" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}

                Administrator
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={() => onDelete(id)}
              disabled={isDeleting || isUpdating}
              className="w-full py-3 rounded-xl border border-red-200 bg-white text-red-600 font-semibold text-sm hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting User...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              This action permanently removes the account.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  className,
  delay = 0,
}) => {
  return (
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
        delay,
      }}
      className="card p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">
            {label}
          </p>

          <p className="text-2xl font-display font-extrabold mt-1 text-gray-900">
            {value}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${className}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

const RoleBadge = ({ role }) => {
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
        isAdmin
          ? "bg-purple-50 text-purple-700"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {isAdmin ? (
        <Shield className="w-3.5 h-3.5" />
      ) : (
        <User className="w-3.5 h-3.5" />
      )}

      {isAdmin ? "ADMIN" : "USER"}
    </span>
  );
};

const StatusBadge = ({ active }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-red-500"
        }`}
      />

      {active ? "ACTIVE" : "INACTIVE"}
    </span>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p
          className="text-sm font-semibold text-gray-800 truncate mt-0.5"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

const EmptyState = ({
  search,
  role,
  onClear,
}) => {
  const hasFilters =
    Boolean(search) || role !== "ALL";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="card p-12 text-center"
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center">
        <Users className="w-7 h-7 text-primary-600" />
      </div>

      <h2 className="font-display font-bold text-xl mt-5 text-gray-900">
        {hasFilters
          ? "No matching users"
          : "No users found"}
      </h2>

      <p className="text-gray-500 mt-2 max-w-md mx-auto">
        {hasFilters
          ? "Try changing your search or role filter to find other users."
          : "There are currently no registered users in the system."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
        >
          Clear Filters
        </button>
      )}
    </motion.div>
  );
};

const UsersTableSkeleton = () => {
  return (
    <div className="card overflow-hidden">
      <div className="hidden md:block">
        <div className="h-14 bg-gray-50 border-b border-gray-100" />
      </div>

      <div className="p-5 space-y-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: index * 0.05,
            }}
            className="h-16 rounded-xl skeleton"
          />
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;