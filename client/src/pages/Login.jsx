import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Compass,
  ArrowRight,
  ShieldCheck,
  Globe2,
  CheckCircle2,
  Loader2,
  Plane,
  Star,
  Mountain,
  Navigation,
  Zap,
  LogIn,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getErrorMessage,
  getValidationErrors,
  cn,
} from "../utils/helpers";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [mouseInside, setMouseInside] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, {
    stiffness: 100,
    damping: 22,
  });

  const springY = useSpring(mouseY, {
    stiffness: 100,
    damping: 22,
  });

  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  const glowX = useTransform(
    springX,
    [-0.5, 0.5],
    ["20%", "80%"]
  );

  const glowY = useTransform(
    springY,
    [-0.5, 0.5],
    ["20%", "80%"]
  );

  const from = location.state?.from?.pathname || "/dashboard";

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width - 0.5;

    const y =
      (event.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setMouseInside(false);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const email = form.email.trim();

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setErrors({});

    if (!validateForm()) {
      toast.error("Please check the highlighted fields");
      return;
    }

    setSubmitting(true);

    try {
      const result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (!result?.user) {
        throw new Error(
          "Login completed but user information was not returned."
        );
      }

      const role = String(
        result.user.role || ""
      ).toLowerCase();

      toast.success(
        `Welcome back, ${result.user.name || "Traveler"}!`
      );

      if (role === "admin") {
        navigate("/admin", {
          replace: true,
        });
      } else {
        navigate(from, {
          replace: true,
        });
      }
    } catch (error) {
      const message = getErrorMessage(error);

      const validationErrors =
        getValidationErrors(error);

      setErrors(
        validationErrors &&
          typeof validationErrors === "object"
          ? validationErrors
          : {}
      );

      toast.error(
        message || "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (type) => {
    if (submitting) {
      return;
    }

    if (type === "admin") {
      setForm({
        email: "admin@wanderlust.com",
        password: "admin123",
      });
    } else {
      setForm({
        email: "user@wanderlust.com",
        password: "user123",
      });
    }

    setErrors({});

    toast.success(
      `${
        type === "admin" ? "Admin" : "User"
      } demo credentials loaded`
    );
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.7,
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
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const features = [
    {
      icon: ShieldCheck,
      text: "Secure account authentication",
    },
    {
      icon: CheckCircle2,
      text: "Easy booking management",
    },
    {
      icon: Navigation,
      text: "Explore unforgettable experiences",
    },
  ];

  const stats = [
    {
      icon: Globe2,
      value: "100+",
      label: "Destinations",
    },
    {
      icon: Star,
      value: "4.9",
      label: "Experience",
    },
    {
      icon: Users,
      value: "10K+",
      label: "Travelers",
    },
  ];

  return (
    <div
      className="relative min-h-[calc(100vh-4.5rem)] overflow-hidden bg-[#f4f8ff]"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setMouseInside(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{
            left: glowX,
            top: glowY,
          }}
          animate={{
            opacity: mouseInside ? 0.55 : 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-blue-400/20 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-52 -left-48 w-[35rem] h-[35rem] rounded-full bg-blue-300/20 blur-[100px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 60, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-60 -right-52 w-[38rem] h-[38rem] rounded-full bg-cyan-300/20 blur-[110px]"
        />

        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, 30, -40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/4 w-[20rem] h-[20rem] rounded-full bg-sky-300/10 blur-[100px]"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {Array.from({ length: 25 }).map((_, index) => (
          <motion.span
            key={index}
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
              y: [0, -100, -160],
              x: [0, Math.sin(index) * 50],
            }}
            transition={{
              duration: 5 + (index % 4),
              delay: index * 0.2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-blue-500/30"
            style={{
              left: `${(index * 31) % 100}%`,
              top: `${20 + ((index * 19) % 75)}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-6xl"
        >
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 xl:gap-20 items-center">
            <motion.div
              variants={itemVariants}
              className="hidden lg:block"
            >
              <div className="relative max-w-xl">
                <motion.div
                  animate={{
                    rotate: [0, 8, -8, 0],
                    y: [0, -12, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-24 right-0 text-blue-600/10"
                >
                  <Compass
                    size={190}
                    strokeWidth={0.8}
                  />
                </motion.div>

                <div className="relative">
                  <motion.div
                    variants={itemVariants}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm mb-7"
                  >
                    <span className="text-sm font-bold text-blue-700">
                      Welcome back to Wanderlust
                    </span>
                  </motion.div>

                  <motion.h1
                    variants={itemVariants}
                    className="font-display font-black text-5xl xl:text-7xl leading-[0.95] tracking-tight text-slate-900"
                  >
                    The world is
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500">
                      waiting for you.
                    </span>
                  </motion.h1>

                  <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-3 mt-7 mb-7"
                  >
                    <div className="w-16 h-1 rounded-full bg-blue-600" />
                    <div className="w-3 h-1 rounded-full bg-sky-500" />
                    <div className="w-2 h-1 rounded-full bg-cyan-400" />
                  </motion.div>

                  <motion.p
                    variants={itemVariants}
                    className="text-lg text-slate-500 leading-relaxed max-w-lg"
                  >
                    Your adventures, bookings and
                    favorite destinations are waiting.
                    Sign in and continue discovering
                    unforgettable experiences.
                  </motion.p>

                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-3 gap-4 mt-10 max-w-lg"
                  >
                    {stats.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={index}
                          whileHover={{
                            y: -5,
                          }}
                          className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white p-4 shadow-sm"
                        >
                          <Icon className="w-5 h-5 text-blue-600 mb-3" />

                          <p className="font-black text-xl text-slate-900">
                            {item.value}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {item.label}
                          </p>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="mt-9 space-y-3"
                  >
                    {features.map((item, index) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={index}
                          whileHover={{
                            x: 8,
                          }}
                          className="flex items-center gap-3 text-sm text-slate-500"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>

                          <span className="font-medium">
                            {item.text}
                          </span>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="w-full max-w-[470px] mx-auto lg:mx-0 lg:ml-auto"
              style={{
                perspective: 1200,
              }}
            >
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-sky-400/10 to-cyan-400/20 blur-2xl" />

                  <div className="relative rounded-[2rem] bg-white border border-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.10)] overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />

                    <div className="p-7 sm:p-10">
                      <motion.div
                        variants={itemVariants}
                        className="text-center"
                      >
                        <motion.div
                          initial={{
                            opacity: 0,
                            scale: 0.5,
                            rotate: -30,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            rotate: 0,
                          }}
                          transition={{
                            duration: 0.8,
                            type: "spring",
                            stiffness: 170,
                          }}
                          className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/25"
                        >
                          <motion.div
                            animate={{
                              rotate: 360,
                            }}
                            transition={{
                              duration: 10,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute -inset-2 rounded-[1.7rem] border border-dashed border-blue-400/40"
                          />

                          <Compass
                            className="w-10 h-10 text-white"
                            strokeWidth={2}
                          />
                        </motion.div>

                        <h2 className="font-display font-black text-3xl text-slate-900 mt-6">
                          Welcome back
                        </h2>

                        <p className="text-sm text-slate-500 mt-2">
                          Sign in to continue your journey
                        </p>
                      </motion.div>

                      <motion.form
                        variants={itemVariants}
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-5"
                      >
                        <div>
                          <label
                            htmlFor="login-email"
                            className="block text-sm font-bold text-slate-700 mb-2"
                          >
                            Email address
                          </label>

                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                            <input
                              id="login-email"
                              type="email"
                              value={form.email}
                              onChange={(event) =>
                                updateField(
                                  "email",
                                  event.target.value
                                )
                              }
                              placeholder="you@example.com"
                              autoComplete="email"
                              disabled={submitting}
                              className={cn(
                                "w-full h-14 rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm outline-none transition-all",
                                "placeholder:text-slate-400",
                                "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
                                errors.email
                                  ? "border-red-400"
                                  : "border-slate-200"
                              )}
                            />
                          </div>

                          <AnimatePresence>
                            {errors.email && (
                              <motion.p
                                initial={{
                                  opacity: 0,
                                  y: -5,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  y: -5,
                                }}
                                className="text-xs text-red-500 mt-2"
                              >
                                {errors.email}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label
                              htmlFor="login-password"
                              className="text-sm font-bold text-slate-700"
                            >
                              Password
                            </label>

                            <span className="text-xs text-slate-400">
                              Keep it secure
                            </span>
                          </div>

                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                            <input
                              id="login-password"
                              type={
                                showPassword
                                  ? "text"
                                  : "password"
                              }
                              value={form.password}
                              onChange={(event) =>
                                updateField(
                                  "password",
                                  event.target.value
                                )
                              }
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              disabled={submitting}
                              className={cn(
                                "w-full h-14 rounded-2xl border bg-slate-50 pl-12 pr-14 text-sm outline-none transition-all",
                                "placeholder:text-slate-400",
                                "focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10",
                                errors.password
                                  ? "border-red-400"
                                  : "border-slate-200"
                              )}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowPassword(
                                  (previous) =>
                                    !previous
                                )
                              }
                              disabled={submitting}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                              aria-label={
                                showPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              <AnimatePresence
                                mode="wait"
                                initial={false}
                              >
                                {showPassword ? (
                                  <motion.div
                                    key="eye-off"
                                    initial={{
                                      opacity: 0,
                                      scale: 0.7,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      scale: 1,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      scale: 0.7,
                                    }}
                                  >
                                    <EyeOff className="w-5 h-5" />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="eye"
                                    initial={{
                                      opacity: 0,
                                      scale: 0.7,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      scale: 1,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      scale: 0.7,
                                    }}
                                  >
                                    <Eye className="w-5 h-5" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          </div>

                          <AnimatePresence>
                            {errors.password && (
                              <motion.p
                                initial={{
                                  opacity: 0,
                                  y: -5,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  y: -5,
                                }}
                                className="text-xs text-red-500 mt-2"
                              >
                                {errors.password}
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
                                  y: -2,
                                  scale: 1.01,
                                }
                              : {}
                          }
                          whileTap={
                            !submitting
                              ? {
                                  scale: 0.98,
                                }
                              : {}
                          }
                          className="relative overflow-hidden w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white font-bold shadow-xl shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <motion.span
                            animate={{
                              x: [
                                "-150%",
                                "150%",
                              ],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              repeatDelay: 3,
                              ease: "easeInOut",
                            }}
                            className="absolute inset-y-0 w-20 bg-white/20 skew-x-[-20deg]"
                          />

                          <span className="relative flex items-center justify-center gap-2">
                            {submitting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              <>
                                <LogIn className="w-5 h-5" />
                                Log in
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </span>
                        </motion.button>
                      </motion.form>

                      <motion.div
                        variants={itemVariants}
                        className="mt-7"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-px flex-1 bg-slate-100" />

                          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                            Demo access
                          </span>

                          <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            type="button"
                            onClick={() =>
                              fillDemo("user")
                            }
                            disabled={submitting}
                            whileHover={{
                              y: -2,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            className="h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 font-bold text-xs transition disabled:opacity-50"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <Globe2 className="w-4 h-4" />
                              User Demo
                            </span>
                          </motion.button>

                          <motion.button
                            type="button"
                            onClick={() =>
                              fillDemo("admin")
                            }
                            disabled={submitting}
                            whileHover={{
                              y: -2,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            className="h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 font-bold text-xs transition disabled:opacity-50"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <ShieldCheck className="w-4 h-4" />
                              Admin Demo
                            </span>
                          </motion.button>
                        </div>
                      </motion.div>

                      <motion.div
                        variants={itemVariants}
                        className="mt-7 text-center"
                      >
                        <p className="text-sm text-slate-500">
                          Don't have an account?{" "}
                          <Link
                            to="/register"
                            className="font-bold text-blue-600 hover:text-blue-700 transition"
                          >
                            Create one
                          </Link>
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 1,
                  }}
                  className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-400"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Secure authentication
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 6, -6, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute hidden md:block top-24 right-10 text-blue-500/10 pointer-events-none"
      >
        <Plane size={75} />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 15, 0],
          x: [0, 8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute hidden md:block bottom-20 left-10 text-sky-500/10 pointer-events-none"
      >
        <Mountain size={85} />
      </motion.div>

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute hidden xl:block bottom-16 right-24 text-blue-500/10"
      >
        <Navigation size={55} />
      </motion.div>

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="absolute hidden xl:block top-32 left-24 text-sky-500/10"
      >
        <Star size={30} fill="currentColor" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 8, -8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute hidden lg:block top-1/2 right-8 text-blue-500/10 pointer-events-none"
      >
        <Zap size={42} />
      </motion.div>
    </div>
  );
};

export default Login;