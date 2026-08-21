import { motion } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  FileText,
  Image,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../api/services";
import {
  getErrorMessage,
  getValidationErrors,
  cn,
} from "../../utils/helpers";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    phone: "",
    avatar: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      phone: user?.phone || "",
      avatar: user?.avatar || "",
    });

    setAvatarError(false);
    setErrors({});
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "avatar") {
      setAvatarError(false);
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const name = form.name.trim();
    const bio = form.bio.trim();
    const location = form.location.trim();
    const phone = form.phone.trim();
    const avatar = form.avatar.trim();

    if (!name) {
      newErrors.name = "Full name is required.";
    } else if (name.length < 2) {
      newErrors.name = "Full name must be at least 2 characters.";
    }

    if (bio.length > 500) {
      newErrors.bio = "Bio cannot exceed 500 characters.";
    }

    if (location.length > 100) {
      newErrors.location = "Location cannot exceed 100 characters.";
    }

    if (phone.length > 30) {
      newErrors.phone = "Phone number cannot exceed 30 characters.";
    }

    if (avatar) {
      try {
        const url = new URL(avatar);

        if (!["http:", "https:"].includes(url.protocol)) {
          newErrors.avatar = "Please enter a valid image URL.";
        }
      } catch {
        newErrors.avatar = "Please enter a valid image URL.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        avatar: form.avatar.trim(),
      };

      const response = await authService.updateProfile(payload);

      const updatedUser =
        response?.data?.data?.user ||
        response?.data?.user ||
        response?.data?.data ||
        null;

      if (updatedUser && typeof updatedUser === "object") {
        updateUser(updatedUser);

        setForm({
          name: updatedUser?.name || "",
          bio: updatedUser?.bio || "",
          location: updatedUser?.location || "",
          phone: updatedUser?.phone || "",
          avatar: updatedUser?.avatar || "",
        });
      } else {
        const mergedUser = {
          ...(user || {}),
          ...payload,
        };

        updateUser(mergedUser);

        setForm(payload);
      }

      setErrors({});
      setAvatarError(false);

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      const validationErrors = getValidationErrors(error);

      if (
        validationErrors &&
        typeof validationErrors === "object" &&
        Object.keys(validationErrors).length > 0
      ) {
        setErrors(validationErrors);
      }

      toast.error(
        getErrorMessage(error) ||
          error?.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const avatarLetter =
    form?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const displayName =
    form?.name?.trim() || user?.name || "User";

  const role =
    String(user?.role || "USER").toUpperCase();

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
          Profile
        </h1>

        <p className="text-gray-500">
          Update your personal information and profile details.
        </p>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
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
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white/20 border-4 border-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              {form.avatar && !avatarError ? (
                <img
                  src={form.avatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-white text-3xl font-extrabold">
                  {avatarLetter}
                </span>
              )}
            </div>

            <div className="text-white min-w-0">
              <h2 className="font-display font-bold text-2xl truncate">
                {displayName}
              </h2>

              <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />

                <span className="truncate">
                  {user?.email || "No email available"}
                </span>
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase">
                <Shield className="w-3.5 h-3.5" />
                {role}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 lg:p-8 space-y-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>

              <div>
                <h3 className="font-display font-bold">
                  Personal Information
                </h3>

                <p className="text-xs text-gray-500">
                  Keep your profile information up to date.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="avatar"
                  className="label"
                >
                  Avatar URL
                </label>

                <div className="relative">
                  <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    id="avatar"
                    type="url"
                    value={form.avatar}
                    onChange={(event) =>
                      handleChange(
                        "avatar",
                        event.target.value
                      )
                    }
                    className={cn(
                      "input pl-12",
                      errors.avatar &&
                        "border-error-400 focus:border-error-500"
                    )}
                    placeholder="https://example.com/avatar.jpg"
                    maxLength={1000}
                    disabled={submitting}
                  />
                </div>

                {errors.avatar && (
                  <p className="text-xs text-error-500 mt-1">
                    {errors.avatar}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  Use a publicly accessible image URL.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="label"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleChange(
                        "name",
                        event.target.value
                      )
                    }
                    className={cn(
                      "input pl-12",
                      errors.name &&
                        "border-error-400 focus:border-error-500"
                    )}
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                    disabled={submitting}
                  />
                </div>

                {errors.name && (
                  <p className="text-xs text-error-500 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="label"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="input pl-12 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  Your email address cannot be changed from here.
                </p>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="label"
                >
                  Bio
                </label>

                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />

                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(event) =>
                      handleChange(
                        "bio",
                        event.target.value
                      )
                    }
                    rows={4}
                    maxLength={500}
                    className={cn(
                      "input pl-12 resize-none",
                      errors.bio &&
                        "border-error-400 focus:border-error-500"
                    )}
                    placeholder="Tell us something about yourself..."
                    disabled={submitting}
                  />
                </div>

                <div className="flex justify-between mt-1">
                  {errors.bio ? (
                    <p className="text-xs text-error-500">
                      {errors.bio}
                    </p>
                  ) : (
                    <span />
                  )}

                  <p className="text-xs text-gray-400">
                    {form.bio.length}/500
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="location"
                    className="label"
                  >
                    Location
                  </label>

                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <input
                      id="location"
                      type="text"
                      value={form.location}
                      onChange={(event) =>
                        handleChange(
                          "location",
                          event.target.value
                        )
                      }
                      className={cn(
                        "input pl-12",
                        errors.location &&
                          "border-error-400 focus:border-error-500"
                      )}
                      placeholder="City, Country"
                      maxLength={100}
                      disabled={submitting}
                    />
                  </div>

                  {errors.location && (
                    <p className="text-xs text-error-500 mt-1">
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="label"
                  >
                    Phone
                  </label>

                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        handleChange(
                          "phone",
                          event.target.value
                        )
                      }
                      className={cn(
                        "input pl-12",
                        errors.phone &&
                          "border-error-400 focus:border-error-500"
                      )}
                      placeholder="+92 300 1234567"
                      maxLength={30}
                      disabled={submitting}
                    />
                  </div>

                  {errors.phone && (
                    <p className="text-xs text-error-500 mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">
                  Save your changes
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Your updated information will be saved to your
                  account.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary min-w-[150px] justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;