import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Compass,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  ArrowUpRight,
  MapPin,
  Send,
  Heart,
  Check,
} from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const linkGroups = [
    {
      title: "Explore",
      links: [
        {
          to: "/experiences",
          label: "All Experiences",
        },
        {
          to: "/experiences?featured=true",
          label: "Featured",
        },
        {
          to: "/experiences?category=adventure",
          label: "Adventure",
        },
        {
          to: "/experiences?category=culture",
          label: "Cultural",
        },
      ],
    },
    {
      title: "Company",
      links: [
        {
          to: "/about",
          label: "About Us",
        },
        {
          to: "/features",
          label: "Features",
        },
        {
          to: "/contact",
          label: "Contact",
        },
        {
          to: "/faq",
          label: "FAQ",
        },
      ],
    },
    {
      title: "Account",
      links: [
        {
          to: "/dashboard",
          label: "Dashboard",
        },
        {
          to: "/dashboard/bookings",
          label: "My Bookings",
        },
        {
          to: "/dashboard/favorites",
          label: "Favorites",
        },
        {
          to: "/login",
          label: "Login",
        },
      ],
    },
  ];

  const socialLinks = [
    {
      label: "Facebook",
      icon: Facebook,
      href: "https://www.facebook.com",
    },
    {
      label: "Twitter",
      icon: Twitter,
      href: "https://www.twitter.com",
    },
    {
      label: "Instagram",
      icon: Instagram,
      href: "https://www.instagram.com",
    },
    {
      label: "YouTube",
      icon: Youtube,
      href: "https://www.youtube.com",
    },
  ];

  const handleSubscribe = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      setSubscribed(false);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      setSubscribed(false);
      return;
    }

    setError("");
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="relative mt-24 overflow-hidden bg-[#07110d] text-gray-400">
      <div className="pointer-events-none absolute -left-56 top-0 h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[150px]" />

      <div className="pointer-events-none absolute -right-56 top-[260px] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[160px]" />

      <div className="pointer-events-none absolute bottom-[-220px] left-1/2 h-[450px] w-[750px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[160px]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            amount: 0.15,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="border-b border-white/[0.07] py-14 sm:py-16 lg:py-20"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-primary-400/20 bg-primary-500/[0.08] px-3.5 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-300">
                  Travel Inspiration
                </span>
              </div>

              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[44px]">
                Your next adventure
                <span className="block text-primary-400">
                  starts here.
                </span>
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-gray-500 sm:text-base">
                Get inspiring destinations, unforgettable experiences,
                and travel ideas delivered straight to your inbox.
              </p>
            </div>

            <div className="w-full">
              <form onSubmit={handleSubscribe}>
                <div
                  className={`flex flex-col gap-2 rounded-2xl border p-2 transition-all duration-300 sm:flex-row sm:items-center ${
                    error
                      ? "border-red-500/40 bg-red-500/[0.04]"
                      : "border-white/10 bg-white/[0.035] hover:border-white/15"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
                      <Mail className="h-4 w-4 text-primary-300" />
                    </div>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                        setSubscribed(false);
                      }}
                      placeholder="Enter your email address"
                      aria-label="Email address"
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-gray-600"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 text-sm font-bold text-white shadow-lg shadow-primary-950/30 transition-all duration-300 hover:bg-primary-500"
                  >
                    <span>Subscribe</span>
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p
                      key="error"
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
                      className="mt-2 px-1 text-xs font-medium text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}

                  {subscribed && (
                    <motion.p
                      key="success"
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
                      className="mt-3 flex items-center gap-1.5 px-1 text-xs font-medium text-primary-300"
                    >
                      <Check className="h-3.5 w-3.5" />
                      You're subscribed to Wanderlust updates.
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </motion.div>

        <div className="py-14 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-10">
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
                amount: 0.15,
              }}
              transition={{
                duration: 0.6,
              }}
              className="lg:col-span-2"
            >
              <Link
                to="/"
                className="group inline-flex items-center gap-3"
                aria-label="Wanderlust home"
              >
                <motion.div
                  whileHover={{
                    rotate: 7,
                    scale: 1.06,
                  }}
                  whileTap={{
                    scale: 0.94,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 16,
                  }}
                  className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-emerald-700 shadow-xl shadow-primary-950/30"
                >
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 14,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-1.5 rounded-xl border border-white/20"
                  />

                  <div className="absolute -right-4 -top-4 h-9 w-9 rounded-full bg-white/20 blur-lg" />

                  <Compass
                    className="relative z-10 h-6 w-6 text-white"
                    strokeWidth={2.4}
                  />
                </motion.div>

                <div>
                  <span className="block font-display text-2xl font-extrabold tracking-tight text-white transition-colors duration-300 group-hover:text-primary-300">
                    Wanderlust
                  </span>

                  <span className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600">
                    Explore Beyond
                  </span>
                </div>
              </Link>

              <p className="mt-6 max-w-md text-sm leading-7 text-gray-500">
                Discover extraordinary places, connect with unforgettable
                experiences, and turn every journey into a story worth
                remembering.
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                  <MapPin className="h-3.5 w-3.5 text-primary-400" />
                </div>

                <span>
                  Discover experiences around the world
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;

                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      initial={{
                        opacity: 0,
                        y: 12,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      whileHover={{
                        y: -4,
                        scale: 1.06,
                      }}
                      whileTap={{
                        scale: 0.94,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.06,
                      }}
                      className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] transition-all duration-300 hover:border-primary-400/30 hover:bg-primary-500/15"
                    >
                      <Icon className="h-4 w-4 text-gray-500 transition-colors duration-300 group-hover:text-primary-300" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {linkGroups.map((group, groupIndex) => (
              <motion.div
                key={group.title}
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
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.6,
                  delay: groupIndex * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <h4 className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  <span className="h-1 w-1 rounded-full bg-primary-400" />
                  {group.title}
                </h4>

                <ul className="space-y-3.5">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1.5 text-sm text-gray-500 transition-all duration-300 hover:translate-x-1 hover:text-white"
                      >
                        <span>{link.label}</span>

                        <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 -translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.07]" />

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Wanderlust. All rights reserved.
            </p>

            <div className="hidden h-1 w-1 rounded-full bg-gray-700 sm:block" />

            <p className="flex items-center gap-1.5 text-xs text-gray-600">
              Crafted with
              <Heart className="h-3 w-3 fill-current text-primary-400" />
              for travelers
            </p>
          </div>

          <motion.a
            href="mailto:hello@wanderlust.com"
            whileHover={{
              y: -2,
            }}
            className="group flex items-center gap-2.5 text-xs text-gray-500 transition-colors duration-300 hover:text-primary-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] transition-all duration-300 group-hover:border-primary-400/20 group-hover:bg-primary-500/10">
              <Mail className="h-3.5 w-3.5" />
            </span>

            <span>hello@wanderlust.com</span>
          </motion.a>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;