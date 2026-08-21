import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Compass,
  ArrowRight,
  ShieldCheck,
  Globe2,
  CheckCircle2,
  Loader2,
  Plane,
  MapPin,
  Heart,
  Star,
  UserPlus,
  CircleCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getErrorMessage,
  getValidationErrors,
  cn,
} from "../utils/helpers";
import toast from "react-hot-toast";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = useMemo(() => {
    const password = form.password;

    if (!password) {
      return {
        score: 0,
        label: "",
        width: "0%",
        color: "bg-gray-200",
        textColor: "text-gray-400",
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        score,
        label: "Weak",
        width: "25%",
        color: "bg-red-500",
        textColor: "text-red-500",
      };
    }

    if (score <= 3) {
      return {
        score,
        label: "Good",
        width: "60%",
        color: "bg-amber-500",
        textColor: "text-amber-600",
      };
    }

    return {
      score,
      label: "Strong",
      width: "100%",
      color: "bg-blue-500",
      textColor: "text-blue-600",
    };
  }, [form.password]);

  const passwordRequirements = [
    {
      label: "6+ characters",
      valid: form.password.length >= 6,
    },
    {
      label: "Uppercase letter",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "Number",
      valid: /[0-9]/.test(form.password),
    },
    {
      label: "Special character",
      valid: /[^A-Za-z0-9]/.test(form.password),
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);

    try {
      const result = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      toast.success(
        `Welcome to Wanderlust, ${result?.user?.name || form.name}!`
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      const message = getErrorMessage(err);

      setErrors(validationErrors || {});

      toast.error(
        message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pageVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 25,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const errorVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      y: -5,
    },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: {
        duration: 0.25,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
            rotate: [0, 20, -15, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-blue-400/20 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -80, 50, 0],
            y: [0, 70, -40, 0],
            scale: [1, 0.88, 1.15, 1],
            rotate: [0, -20, 15, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-48 -right-48 w-[34rem] h-[34rem] rounded-full bg-sky-400/20 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1, 1.2, 0.95, 1],
            opacity: [0.2, 0.35, 0.15, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-blue-300/20 blur-3xl"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        {Array.from({ length: 24 }).map((_, i) => (
          <motion.span
            key={`particle-${i}`}
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 0.65, 0],
              scale: [0.5, 1, 0.3],
              y: [-20, -100, -180],
              x: [
                0,
                Math.sin(i * 2) * 45,
                Math.cos(i * 3) * 70,
              ],
            }}
            transition={{
              duration: 5 + (i % 5),
              repeat: Infinity,
              delay: i * 0.25,
              ease: "easeOut",
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-blue-500/40"
            style={{
              left: `${(i * 19) % 100}%`,
              top: `${45 + ((i * 11) % 50)}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-10 sm:py-14">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl"
        >
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              variants={itemVariants}
              className="hidden lg:block"
            >
              <div className="relative max-w-xl">
                <motion.div
                  whileHover={{
                    y: -3,
                    scale: 1.02,
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white shadow-sm text-blue-700 text-sm font-semibold mb-7"
                >
                  <Compass className="w-4 h-4" />
                  Begin Your Journey
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="font-display font-extrabold text-5xl xl:text-6xl leading-[1.05] text-gray-900 mb-6"
                >
                  Create your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500">
                    adventure.
                  </span>
                  Explore the world.
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-lg text-gray-500 leading-relaxed max-w-lg mb-8"
                >
                  Join Wanderlust and unlock a world of unforgettable
                  experiences, hidden gems, and adventures waiting to
                  be discovered.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="space-y-4"
                >
                  {[
                    {
                      icon: Globe2,
                      text: "Discover experiences around the world",
                    },
                    {
                      icon: ShieldCheck,
                      text: "Your account stays secure and protected",
                    },
                    {
                      icon: Heart,
                      text: "Save your favorite adventures",
                    },
                    {
                      icon: CheckCircle2,
                      text: "Manage your bookings effortlessly",
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={index}
                        initial={{
                          opacity: 0,
                          x: -20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: 0.7 + index * 0.12,
                          duration: 0.5,
                        }}
                        whileHover={{
                          x: 8,
                        }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <motion.div
                          whileHover={{
                            scale: 1.12,
                            rotate: 5,
                          }}
                          className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center"
                        >
                          <Icon className="w-4 h-4 text-blue-600" />
                        </motion.div>

                        <span className="text-sm font-medium">
                          {item.text}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-10 top-10 opacity-20"
                >
                  <Plane className="w-20 h-20 text-blue-500" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 12, 0],
                    rotate: [0, 8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-4 bottom-0 opacity-20"
                >
                  <MapPin className="w-16 h-16 text-sky-500" />
                </motion.div>

                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -left-32 -bottom-32 opacity-[0.025]"
                >
                  <Compass
                    className="w-96 h-96"
                    strokeWidth={1}
                  />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
              style={{
                perspective: 1200,
              }}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 40,
                  scale: 0.94,
                  rotateX: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 35px 90px rgba(0,0,0,0.12)",
                }}
                className="relative overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-blue-900/5"
              >
                <motion.div
                  initial={{
                    scaleX: 0,
                  }}
                  animate={{
                    scaleX: 1,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.4,
                    ease: "easeOut",
                  }}
                  className="absolute top-0 left-0 right-0 h-1 origin-left bg-gradient-to-r from-blue-500 via-sky-500 to-blue-600"
                />

                <motion.div
                  animate={{
                    x: ["-120%", "120%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] pointer-events-none"
                />

                <div className="p-6 sm:p-8 md:p-9">
                  <motion.div
                    variants={itemVariants}
                    className="text-center mb-7"
                  >
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.4,
                        rotate: -30,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3,
                        type: "spring",
                        stiffness: 180,
                        damping: 12,
                      }}
                      whileHover={{
                        scale: 1.08,
                        rotate: 6,
                      }}
                      className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/25"
                    >
                      <Compass
                        className="w-8 h-8 text-white"
                        strokeWidth={2.5}
                      />

                      <motion.span
                        animate={{
                          scale: [1, 1.45, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                        }}
                        className="absolute inset-0 rounded-2xl border-2 border-blue-400"
                      />
                    </motion.div>

                    <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 mb-2">
                      Create Account
                    </h1>

                    <p className="text-sm text-gray-500">
                      Start your travel journey today
                    </p>
                  </motion.div>

                  <motion.form
                    variants={itemVariants}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="label">
                        Full Name
                      </label>

                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />

                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          disabled={submitting}
                          className={cn(
                            "input pl-12 pr-4 h-12 bg-gray-50/70 border-gray-200 rounded-xl transition-all duration-300",
                            "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
                            errors.name &&
                              "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          )}
                          placeholder="John Doe"
                          autoComplete="name"
                        />
                      </div>

                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            variants={errorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-xs text-red-500 mt-1.5 ml-1"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="label">
                        Email Address
                      </label>

                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />

                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          disabled={submitting}
                          className={cn(
                            "input pl-12 pr-4 h-12 bg-gray-50/70 border-gray-200 rounded-xl transition-all duration-300",
                            "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
                            errors.email &&
                              "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          )}
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </div>

                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            variants={errorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-xs text-red-500 mt-1.5 ml-1"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="label mb-0">
                          Password
                        </label>

                        {form.password && (
                          <motion.span
                            initial={{
                              opacity: 0,
                              scale: 0.8,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            className={cn(
                              "text-xs font-bold",
                              passwordStrength.textColor
                            )}
                          >
                            {passwordStrength.label}
                          </motion.span>
                        )}
                      </div>

                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />

                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          disabled={submitting}
                          className={cn(
                            "input pl-12 pr-12 h-12 bg-gray-50/70 border-gray-200 rounded-xl transition-all duration-300",
                            "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
                            errors.password &&
                              "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          )}
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          disabled={submitting}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {form.password && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                              y: -5,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                            }}
                            className="mt-2"
                          >
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                animate={{
                                  width:
                                    passwordStrength.width,
                                }}
                                transition={{
                                  duration: 0.4,
                                }}
                                className={cn(
                                  "h-full rounded-full",
                                  passwordStrength.color
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                              {passwordRequirements.map(
                                (requirement) => (
                                  <div
                                    key={requirement.label}
                                    className={cn(
                                      "flex items-center gap-1.5 text-[10px] transition-colors",
                                      requirement.valid
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                    )}
                                  >
                                    <CircleCheck
                                      className={cn(
                                        "w-3 h-3",
                                        requirement.valid
                                          ? "opacity-100"
                                          : "opacity-40"
                                      )}
                                    />
                                    {requirement.label}
                                  </div>
                                )
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            variants={errorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-xs text-red-500 mt-1.5 ml-1"
                          >
                            {errors.password}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="label">
                        Confirm Password
                      </label>

                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          disabled={submitting}
                          className={cn(
                            "input pl-12 pr-12 h-12 bg-gray-50/70 border-gray-200 rounded-xl transition-all duration-300",
                            "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
                            errors.confirmPassword &&
                              "border-red-400 focus:border-red-500 focus:ring-red-500/10",
                            form.confirmPassword &&
                              form.password ===
                                form.confirmPassword &&
                              "border-blue-300 focus:border-blue-400 focus:ring-blue-500/10"
                          )}
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (prev) => !prev
                            )
                          }
                          disabled={submitting}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {form.confirmPassword &&
                          form.password ===
                            form.confirmPassword && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                x: -8,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              exit={{
                                opacity: 0,
                              }}
                              className="flex items-center gap-1.5 mt-1.5 text-xs text-blue-600"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Passwords match
                            </motion.div>
                          )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {errors.confirmPassword && (
                          <motion.p
                            variants={errorVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-xs text-red-500 mt-1.5 ml-1"
                          >
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={
                        !submitting
                          ? {
                              scale: 1.015,
                              y: -2,
                            }
                          : {}
                      }
                      whileTap={
                        !submitting
                          ? {
                              scale: 0.97,
                            }
                          : {}
                      }
                      className="relative overflow-hidden w-full h-13 text-base py-3.5 rounded-xl shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white font-bold transition-all duration-300 hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {!submitting && (
                        <motion.span
                          animate={{
                            x: ["-120%", "120%"],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-y-0 w-20 bg-white/20 skew-x-[-20deg]"
                        />
                      )}

                      <span className="relative flex items-center justify-center gap-2">
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Create Account

                            <motion.span
                              animate={{
                                x: [0, 5, 0],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                              }}
                            >
                              <ArrowRight className="w-5 h-5" />
                            </motion.span>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.form>

                  <motion.div
                    variants={itemVariants}
                    className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Secure account creation
                  </motion.div>

                  <motion.p
                    variants={itemVariants}
                    className="text-center text-sm text-gray-500 mt-5"
                  >
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="group inline-flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                    >
                      Sign in

                      <motion.span
                        initial={{
                          x: 0,
                        }}
                        whileHover={{
                          x: 4,
                        }}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.span>
                    </Link>
                  </motion.p>
                </div>
              </motion.div>

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
                  delay: 1.1,
                  duration: 0.6,
                }}
                className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-400"
              >
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Secure
                </span>

                <span>•</span>

                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5" />
                  Worldwide
                </span>

                <span>•</span>

                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" />
                  Trusted
                </span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{
          x: [0, 25, 0],
          y: [0, -10, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-8 left-8 hidden xl:block opacity-20"
      >
        <Heart className="w-10 h-10 text-blue-500" />
      </motion.div>

      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 12, 0],
          rotate: [12, -4, 12],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-24 right-10 hidden xl:block opacity-20"
      >
        <Plane className="w-12 h-12 text-sky-500" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 right-6 hidden 2xl:block opacity-10"
      >
        <Compass className="w-16 h-16 text-blue-500" />
      </motion.div>
    </div>
  );
};

export default Register;