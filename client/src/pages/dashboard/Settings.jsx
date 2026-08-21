import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../api/services";
import {
  getErrorMessage,
  getValidationErrors,
  cn,
} from "../../utils/helpers";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [showPw, setShowPw] = useState({
    curr: false,
    new: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const handlePasswordInput = (field, value) => {
    setPwForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setErrors({});

    const currentPassword = pwForm.currentPassword;
    const newPassword = pwForm.newPassword;

    if (!currentPassword.trim()) {
      setErrors({
        currentPassword: "Current password is required.",
      });

      toast.error("Please enter your current password.");
      return;
    }

    if (!newPassword.trim()) {
      setErrors({
        newPassword: "New password is required.",
      });

      toast.error("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setErrors({
        newPassword:
          "New password must be at least 6 characters.",
      });

      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrors({
        newPassword:
          "New password must be different from your current password.",
      });

      toast.error(
        "New password must be different from your current password."
      );
      return;
    }

    setSubmitting(true);

    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully.");

      setPwForm({
        currentPassword: "",
        newPassword: "",
      });

      setShowPw({
        curr: false,
        new: false,
      });

      setErrors({});
    } catch (err) {
      console.error("Change password error:", err);

      const validationErrors = getValidationErrors(err);

      if (
        validationErrors &&
        typeof validationErrors === "object" &&
        Object.keys(validationErrors).length > 0
      ) {
        setErrors(validationErrors);
      }

      toast.error(
        getErrorMessage(err) ||
          err?.response?.data?.message ||
          "Unable to change your password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleting) return;

    setDeleting(true);

    try {
      await authService.deleteAccount();

      toast.success("Your account has been deleted.");

      setDeleteModal(false);

      try {
        await logout();
      } catch (logoutError) {
        console.error("Logout after account deletion error:", logoutError);
      }

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error("Delete account error:", err);

      toast.error(
        getErrorMessage(err) ||
          err?.response?.data?.message ||
          "Unable to delete your account."
      );
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModal(false);
  };

  const handleOpenDeleteModal = () => {
    if (deleting) return;

    setDeleteModal(true);
  };

  const currentPasswordError =
    errors.currentPassword ||
    errors.current_password ||
    "";

  const newPasswordError =
    errors.newPassword ||
    errors.new_password ||
    "";

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
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-1">
          Settings
        </h1>

        <p className="text-gray-500">
          Manage your account security and preferences.
        </p>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.05,
        }}
        className="card overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
            </div>

            <div>
              <h2 className="font-display font-bold text-lg">
                Account Security
              </h2>

              <p className="text-sm text-gray-500 mt-0.5">
                Keep your account secure with a strong password.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <form
            onSubmit={handlePasswordChange}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="currentPassword"
                className="label"
              >
                Current Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  id="currentPassword"
                  type={showPw.curr ? "text" : "password"}
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordInput(
                      "currentPassword",
                      e.target.value
                    )
                  }
                  className={cn(
                    "input pl-12 pr-12",
                    currentPasswordError &&
                      "border-error-400 focus:border-error-500"
                  )}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  disabled={submitting}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPw((prev) => ({
                      ...prev,
                      curr: !prev.curr,
                    }))
                  }
                  disabled={submitting}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  aria-label={
                    showPw.curr
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showPw.curr ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {currentPasswordError && (
                <p className="text-xs text-error-500 mt-1.5">
                  {currentPasswordError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="label"
              >
                New Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  id="newPassword"
                  type={showPw.new ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    handlePasswordInput(
                      "newPassword",
                      e.target.value
                    )
                  }
                  className={cn(
                    "input pl-12 pr-12",
                    newPasswordError &&
                      "border-error-400 focus:border-error-500"
                  )}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  disabled={submitting}
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPw((prev) => ({
                      ...prev,
                      new: !prev.new,
                    }))
                  }
                  disabled={submitting}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  aria-label={
                    showPw.new
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {showPw.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {newPasswordError ? (
                <p className="text-xs text-error-500 mt-1.5">
                  {newPasswordError}
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-1.5">
                  Password must contain at least 6 characters.
                </p>
              )}
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary min-w-[160px] justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="card p-5 sm:p-6 border-error-200 bg-white"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-error-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-error-500" />
          </div>

          <div className="min-w-0">
            <h2 className="font-display font-bold text-lg text-error-600">
              Danger Zone
            </h2>

            <p className="text-sm text-gray-500 mt-1 leading-6">
              Permanently delete your account and all associated
              data. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-error-50/60 border border-error-100 p-4">
          <p className="text-sm text-error-700 leading-6">
            Deleting your account will remove your profile,
            bookings, favorites, and other account information.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenDeleteModal}
          disabled={deleting}
          className="btn-danger mt-5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </motion.div>

      <Modal
        isOpen={deleteModal}
        onClose={closeDeleteModal}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-error-50 border border-error-100">
            <AlertTriangle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold text-error-700 text-sm">
                This action is permanent
              </p>

              <p className="text-xs text-error-600 mt-1 leading-5">
                Once your account is deleted, it cannot be
                recovered.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm text-gray-600 leading-6">
              Are you absolutely sure you want to delete your
              account?
            </p>

            {user?.name && (
              <p className="text-sm text-gray-600 mt-2">
                Account:
                <strong className="ml-1 text-gray-900">
                  {user.name}
                </strong>
              </p>
            )}

            {user?.email && (
              <p className="text-sm text-gray-500 mt-1 break-all">
                {user.email}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deleting}
              className="btn-outline flex-1 justify-center disabled:opacity-60"
            >
              Keep Account
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="btn-danger flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;