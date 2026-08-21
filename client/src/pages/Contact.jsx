import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  ArrowUpRight,
  Clock,
  Globe2,
  CheckCircle2,
  Plane,
  Navigation,
  Heart,
  ShieldCheck,
  Compass,
  Headphones,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const contactInfo = [
    {
      icon: Mail,
      label: "Email Us",
      value: "hello@wanderlust.com",
      description: "For general inquiries",
      href: "mailto:hello@wanderlust.com",
    },
    {
      icon: Phone,
      label: "Call Us",
      value: "+1 (555) 123-4567",
      description: "Mon–Fri, 9AM–6PM",
      href: "tel:+15551234567",
    },
    {
      icon: MapPin,
      label: "Visit Us",
      value: "San Francisco, CA",
      description: "Wanderlust HQ",
      href: "#location",
    },
  ];

  const supportItems = [
    {
      icon: Clock,
      title: "Support Hours",
      description: "Monday – Friday, 9:00 AM – 6:00 PM",
    },
    {
      icon: Globe2,
      title: "Global Support",
      description: "Helping travelers around the world.",
    },
    {
      icon: CheckCircle2,
      title: "Quick Response",
      description: "We usually respond within 24 hours.",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name) {
      toast.error("Please enter your name");
      return;
    }

    if (name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    if (name.length > 100) {
      toast.error("Name cannot exceed 100 characters");
      return;
    }

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (email.length > 150) {
      toast.error("Email cannot exceed 150 characters");
      return;
    }

    if (subject.length > 200) {
      toast.error("Subject cannot exceed 200 characters");
      return;
    }

    if (!message) {
      toast.error("Please enter your message");
      return;
    }

    if (message.length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }

    if (message.length > 500) {
      toast.error("Message cannot exceed 500 characters");
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = `${API_URL.replace(/\/$/, "")}/contacts`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        if (text) {
          data = {
            message: text,
          };
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Unable to send your message. Server returned ${response.status}.`
        );
      }

      toast.success(
        data?.message ||
          "Message sent successfully! We'll get back to you soon."
      );

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form error:", error);

      if (error instanceof TypeError) {
        toast.error(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else {
        toast.error(
          error.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const smoothScroll = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-gray-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 70, -20, 0],
            y: [0, 40, 80, 0],
            scale: [1, 1.12, 0.96, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-48 -top-48 h-[550px] w-[550px] rounded-full bg-primary-100/50 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -60, 30, 0],
            y: [0, -30, 70, 0],
            scale: [1, 0.92, 1.1, 1],
          }}
          transition={{
            duration: 23,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-48 top-[20%] h-[520px] w-[520px] rounded-full bg-secondary-100/40 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-[35%] h-[400px] w-[400px] rounded-full bg-primary-50 blur-[110px]"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <motion.span
          animate={{
            y: [0, -25, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[12%] top-[30%] h-1.5 w-1.5 rounded-full bg-primary-500"
        />

        <motion.span
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[15%] top-[45%] h-2 w-2 rounded-full bg-secondary-500"
        />
      </div>

      <section className="relative z-10 px-4 pb-14 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
            >
              Let's Start a{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 bg-clip-text text-transparent">
                  Conversation
                </span>

                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute -bottom-1 left-0 h-1 w-full origin-left rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 sm:-bottom-2 sm:h-1.5"
                />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-gray-500 sm:mt-7 sm:text-lg sm:leading-8"
            >
              Have a question, need help planning your next adventure, or
              simply want to say hello? Our team is always ready to help.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mx-auto mt-9 flex max-w-xl flex-wrap items-center justify-center gap-3 sm:gap-5"
            >
              <motion.div
                whileHover={{ y: -3 }}
                className="flex items-center gap-2 rounded-full border border-gray-100 bg-white/70 px-3 py-2 text-[11px] font-semibold text-gray-500 shadow-sm backdrop-blur-md sm:px-4 sm:text-xs"
              >
                <Heart className="h-3.5 w-3.5 text-primary-500" />
                We care about your journey
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="flex items-center gap-2 rounded-full border border-gray-100 bg-white/70 px-3 py-2 text-[11px] font-semibold text-gray-500 shadow-sm backdrop-blur-md sm:px-4 sm:text-xs"
              >
                <Plane className="h-3.5 w-3.5 text-secondary-500" />
                Let's plan something amazing
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="mt-12 grid gap-4 sm:mt-14 md:grid-cols-3 md:gap-6"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;

              return (
                <motion.a
                  key={info.label}
                  href={info.href}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white/85 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:border-primary-100 hover:shadow-[0_20px_60px_rgba(16,185,129,0.12)] sm:rounded-[2rem] sm:p-7"
                >
                  <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-primary-100/70 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />

                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.1 + 0.3,
                      duration: 0.7,
                    }}
                    className="absolute left-0 right-0 top-0 h-[2px] origin-left bg-gradient-to-r from-primary-400 to-secondary-400"
                  />

                  <div className="relative flex items-start justify-between">
                    <motion.div
                      whileHover={{
                        rotate: [0, -7, 7, 0],
                        scale: 1.08,
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition-all duration-500 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary-500/25 sm:h-14 sm:w-14"
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.div>

                    <motion.div
                      whileHover={{
                        x: 4,
                        y: -4,
                      }}
                    >
                      <ArrowUpRight className="h-5 w-5 text-gray-300 transition-colors duration-300 group-hover:text-primary-600" />
                    </motion.div>
                  </div>

                  <div className="relative mt-6 sm:mt-7">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {info.label}
                    </p>

                    <h3 className="mt-1.5 break-words text-base font-bold text-gray-900 sm:text-lg">
                      {info.value}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {info.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2">
                      <span className="h-1 w-8 rounded-full bg-primary-500 transition-all duration-500 group-hover:w-14" />
                      <span className="h-1 w-1 rounded-full bg-gray-200" />
                      <span className="h-1 w-1 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
            <motion.div
              initial={{
                opacity: 0,
                x: -50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.12,
              }}
              transition={{
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:col-span-2"
            >
              <div className="relative h-full min-h-[560px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 p-6 text-white shadow-2xl sm:rounded-[2.5rem] sm:p-9 lg:p-10">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.3, 0.15],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-primary-500/30 blur-3xl"
                />

                <motion.div
                  animate={{
                    scale: [1.1, 0.9, 1.1],
                    x: [0, 25, 0],
                  }}
                  transition={{
                    duration: 11,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-secondary-500/15 blur-3xl"
                />

                <div className="absolute right-6 top-6 opacity-20 sm:right-8 sm:top-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 28,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-28 w-28 rounded-full border border-white/20 sm:h-32 sm:w-32"
                  />

                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 19,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute left-5 top-5 h-20 w-20 rounded-full border border-primary-300/30"
                  />

                  <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-300" />
                </div>

                <div className="relative flex h-full flex-col">
                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -25,
                    }}
                    whileInView={{
                      scale: 1,
                      rotate: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 180,
                      damping: 14,
                    }}
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-xl backdrop-blur-xl sm:mb-7 sm:h-16 sm:w-16"
                  >
                    <MessageCircle className="h-7 w-7 text-primary-300 sm:h-8 sm:w-8" />
                  </motion.div>

                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
                    We're here for you
                  </div>

                  <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                    We're here to help.
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-7 text-gray-300 sm:mt-5 sm:text-base">
                    Whether you're looking for your next unforgettable
                    experience or need assistance with a booking, our team is
                    just a message away.
                  </p>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="mt-8 space-y-3 sm:mt-10 sm:space-y-4"
                  >
                    {supportItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.title}
                          variants={fadeUp}
                          whileHover={{ x: 5 }}
                          className="group flex items-start gap-3 rounded-2xl border border-white/5 p-2.5 transition-all duration-300 hover:border-white/10 hover:bg-white/5 sm:gap-4 sm:p-3"
                        >
                          <motion.div
                            whileHover={{
                              scale: 1.08,
                              rotate: 5,
                            }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:h-11 sm:w-11"
                          >
                            <Icon className="h-5 w-5 text-primary-300" />
                          </motion.div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold sm:text-base">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-gray-400 sm:text-sm">
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>

                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: 0.5,
                    }}
                    className="mt-auto pt-8 sm:pt-10"
                  >
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md sm:gap-4 sm:p-4">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                      </span>

                      <div>
                        <p className="text-sm font-semibold">
                          Support team online
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          Ready to assist you
                        </p>
                      </div>

                      <motion.div
                        animate={{
                          x: [0, 4, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="ml-auto"
                      >
                        <ArrowUpRight className="h-5 w-5 text-gray-500" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.12,
              }}
              transition={{
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:col-span-3"
            >
              <div className="relative h-full overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,0.07)] sm:rounded-[2.5rem] sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary-100/60 blur-3xl" />

                <div className="relative">
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600 sm:text-sm">
                        Send us a message
                      </span>

                      <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] font-semibold text-gray-400 sm:text-xs">
                        <Headphones className="h-3.5 w-3.5 text-primary-500" />
                        Friendly support
                      </div>
                    </div>

                    <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-gray-950 sm:text-4xl">
                      How can we help?
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                      Fill out the form and our team will get back to you.
                    </p>
                  </motion.div>

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="mt-7 space-y-5 sm:mt-9 sm:space-y-6"
                  >
                    <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                      <AnimatedInput
                        label="Your Name"
                        required
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        disabled={submitting}
                      />

                      <AnimatedInput
                        label="Email Address"
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        disabled={submitting}
                      />
                    </div>

                    <AnimatedInput
                      label="Subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="What can we help you with?"
                      disabled={submitting}
                    />

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="message"
                          className="block text-sm font-semibold text-gray-700"
                        >
                          Your Message{" "}
                          <span className="text-primary-500">*</span>
                        </label>

                        <motion.span
                          animate={{
                            scale: form.message.length > 0 ? 1.05 : 1,
                          }}
                          className={`text-xs ${
                            form.message.length >= 450
                              ? "font-semibold text-orange-500"
                              : "text-gray-400"
                          }`}
                        >
                          {form.message.length}/500
                        </motion.span>
                      </div>

                      <div className="group relative">
                        <textarea
                          id="message"
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          maxLength={500}
                          rows={6}
                          required
                          disabled={submitting}
                          placeholder="Tell us about your travel plans, questions, or anything else..."
                          className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-6 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <div className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] origin-left scale-x-0 rounded-full bg-primary-500 transition-transform duration-500 group-focus-within:scale-x-100" />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{
                        scale: submitting ? 1 : 1.012,
                        y: submitting ? 0 : -2,
                      }}
                      whileTap={{
                        scale: submitting ? 1 : 0.98,
                      }}
                      type="submit"
                      disabled={submitting}
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-primary-500/20 transition-all duration-300 hover:shadow-primary-500/35 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                    >
                      {!submitting && (
                        <motion.span
                          initial={{
                            x: "-150%",
                          }}
                          whileHover={{
                            x: "150%",
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      )}

                      <AnimatePresence mode="wait">
                        {submitting ? (
                          <motion.span
                            key="loading"
                            initial={{
                              opacity: 0,
                              y: 5,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              y: -5,
                            }}
                            className="relative flex items-center gap-3"
                          >
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Sending Message...
                          </motion.span>
                        ) : (
                          <motion.span
                            key="send"
                            initial={{
                              opacity: 0,
                              y: 5,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              y: -5,
                            }}
                            className="relative flex items-center gap-2"
                          >
                            Send Message

                            <motion.span
                              whileHover={{
                                x: 5,
                                rotate: -8,
                              }}
                            >
                              <Send className="h-4 w-4" />
                            </motion.span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <div className="flex items-center justify-center gap-2 px-2 text-center text-[11px] leading-5 text-gray-400 sm:text-xs">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-primary-500" />
                      <span>
                        We respect your privacy and will never share your
                        information.
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="location"
        className="relative z-10 scroll-mt-24 px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8"
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 45,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.12,
          }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)] sm:rounded-[2.5rem]"
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[360px] overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-gray-950 sm:min-h-[430px]">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
                  backgroundSize: "55px 55px",
                }}
              />

              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  opacity: [0.2, 0.35, 0.2],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0"
              >
                <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 sm:h-56 sm:w-56" />
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-80 sm:w-80" />
                <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-[28rem] sm:w-[28rem]" />
              </motion.div>

              <motion.div
                animate={{
                  x: [0, 30, -20, 0],
                  y: [0, -10, 15, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-[15%] top-[30%] h-px w-[70%] rotate-[15deg] border-t border-dashed border-primary-300/50"
              />

              <motion.div
                animate={{
                  x: [0, 100, -70, 0],
                  y: [0, -40, 60, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-primary-300 shadow-[0_0_20px_rgba(110,231,183,0.8)]"
              />

              <motion.div
                animate={{
                  x: [0, -70, 60, 0],
                  y: [0, 50, -35, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-1/4 top-1/3 h-2 w-2 rounded-full bg-secondary-300 shadow-[0_0_20px_rgba(167,139,250,0.8)]"
              />

              <div className="relative flex min-h-[360px] items-center justify-center sm:min-h-[430px]">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 text-center text-white"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.06, 1],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl shadow-black/20 sm:mb-6 sm:h-24 sm:w-24"
                  >
                    <MapPin className="h-9 w-9 text-primary-600 sm:h-10 sm:w-10" />
                  </motion.div>

                  <div className="mb-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-primary-200">
                    <Compass className="h-3.5 w-3.5" />
                    Our location
                  </div>

                  <h3 className="font-display text-2xl font-bold sm:text-3xl">
                    Wanderlust HQ
                  </h3>

                  <p className="mt-2 text-sm text-primary-100">
                    San Francisco, California
                  </p>

                  <motion.div
                    animate={{
                      width: [40, 70, 40],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="mx-auto mt-5 h-1 rounded-full bg-primary-400"
                  />
                </motion.div>
              </div>

              <div className="absolute bottom-5 left-5 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-semibold text-white/70 backdrop-blur-md sm:bottom-6 sm:left-6">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                San Francisco
              </div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                x: 35,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.75,
              }}
              className="flex items-center p-7 sm:p-10 lg:p-14"
            >
              <div className="w-full">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-600 sm:text-sm">
                  <Navigation className="h-4 w-4" />
                  Come Say Hello
                </div>

                <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-gray-950 sm:text-4xl">
                  Visit our headquarters
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:mt-5 sm:text-base">
                  Our doors are open to travelers, creators, and curious minds.
                  Stop by and let's talk about your next adventure.
                </p>

                <motion.div
                  whileHover={{
                    x: 5,
                  }}
                  className="mt-7 flex items-start gap-4 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-primary-100 hover:bg-primary-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      123 Adventure Street
                    </p>

                    <p className="mt-0.5 text-sm text-gray-500">
                      San Francisco, CA 94105
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{
                    x: 5,
                  }}
                  className="mt-2 flex items-start gap-4 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-primary-100 hover:bg-primary-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      Office Hours
                    </p>

                    <p className="mt-0.5 text-sm text-gray-500">
                      Monday – Friday · 9:00 AM – 6:00 PM
                    </p>
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                    x: 3,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={() => smoothScroll("location")}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-primary-600 hover:shadow-primary-500/20"
                >
                  <Navigation className="h-4 w-4" />
                  Find Us
                  <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 px-4 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center"
        >
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-500">
            <Plane className="h-4 w-4" />
            Your next adventure awaits
          </div>

          <p className="max-w-xl text-sm leading-7 text-gray-400">
            Have something on your mind? Don't hesitate to reach out. We're
            always happy to help make your journey better.
          </p>
        </motion.div>
      </section>
    </main>
  );
};

const AnimatedInput = ({
  label,
  required = false,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}{" "}
        {required && <span className="text-primary-500">*</span>}
      </label>

      <div className="group relative">
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={
            name === "name"
              ? "name"
              : name === "email"
                ? "email"
                : "off"
          }
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="pointer-events-none absolute bottom-0 left-4 right-4 h-[2px] origin-left scale-x-0 rounded-full bg-primary-500 transition-transform duration-500 group-focus-within:scale-x-100" />
      </div>
    </div>
  );
};

export default Contact;