import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Shield,
  Heart,
  Compass,
  Calendar,
  Star,
  Bell,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe2,
  Layers3,
  X,
  Check,
  Plane,
  Bus,
  Cloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Features = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedFeature, setSelectedFeature] = useState(null);

  const features = [
    {
      icon: Search,
      title: "Advanced Search & Filtering",
      category: "Discovery",
      desc: "Discover the perfect experience with powerful filters for categories, pricing, ratings, destinations, and more.",
      details:
        "Search through experiences using multiple filters and quickly find adventures that match your interests, budget, location, and preferences.",
      accent: "from-blue-600 to-indigo-500",
    },
    {
      icon: Calendar,
      title: "Smart Booking System",
      category: "Booking",
      desc: "Choose your preferred date, manage your group size, and confirm your adventure with a seamless booking flow.",
      details:
        "Select an experience, choose your preferred date and group size, review booking details, and manage your reservations from your account.",
      accent: "from-violet-600 to-purple-500",
    },
    {
      icon: Heart,
      title: "Favorites & Wishlist",
      category: "Personalization",
      desc: "Save experiences that inspire you and build your personal travel collection for future adventures.",
      details:
        "Save your favorite experiences with one click and access your personal collection whenever you are ready to plan your next adventure.",
      accent: "from-rose-600 to-pink-500",
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      category: "Community",
      desc: "Explore genuine traveler feedback and share your own experience after completing your journey.",
      details:
        "Traveler reviews and ratings help you understand what to expect before booking while giving guests a way to share their experiences.",
      accent: "from-orange-500 to-amber-500",
    },
    {
      icon: Bell,
      title: "Real-Time Notifications",
      category: "Communication",
      desc: "Receive timely updates about bookings, account activity, recommendations, and important travel information.",
      details:
        "Stay informed with notifications for booking activity, account updates, important actions, and other relevant platform events.",
      accent: "from-purple-600 to-fuchsia-500",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      category: "Security",
      desc: "JWT-powered authentication and secure password protection help keep your account and personal data safe.",
      details:
        "Secure authentication protects user accounts while role-based access helps keep customer and administrative functionality separated.",
      accent: "from-indigo-600 to-blue-500",
    },
    {
      icon: BarChart3,
      title: "Powerful Admin Dashboard",
      category: "Management",
      desc: "Manage users, experiences, bookings, categories, reviews, and analytics through a centralized dashboard.",
      details:
        "Administrators can manage important platform resources from a centralized interface with organized management tools and analytics.",
      accent: "from-blue-700 to-violet-500",
    },
    {
      icon: Users,
      title: "Personal User Profiles",
      category: "Personalization",
      desc: "Manage your profile, booking history, favorites, reviews, preferences, and account settings in one place.",
      details:
        "Users can manage their personal information, view booking activity, maintain favorites, and control important account settings.",
      accent: "from-fuchsia-600 to-purple-500",
    },
    {
      icon: Compass,
      title: "Curated Experiences",
      category: "Discovery",
      desc: "Discover carefully selected adventures designed to help travelers find memorable and meaningful experiences.",
      details:
        "Explore a structured collection of experiences with useful information that makes comparing and choosing your next adventure easier.",
      accent: "from-indigo-600 to-cyan-500",
    },
  ];

  const stats = [
    {
      value: "200+",
      label: "Curated Experiences",
    },
    {
      value: "50+",
      label: "Destinations",
    },
    {
      value: "15K+",
      label: "Happy Travelers",
    },
    {
      value: "4.9",
      label: "Average Rating",
    },
  ];

  const technologies = [
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Tailwind CSS",
    "Framer Motion",
  ];

  const benefits = [
    "Seamless experience discovery",
    "Fast and intuitive booking",
    "Secure account management",
    "Personalized travel planning",
    "Responsive across all devices",
    "Modern animated interface",
  ];

  const categories = [
    "All",
    "Discovery",
    "Booking",
    "Personalization",
    "Community",
    "Security",
    "Management",
    "Communication",
  ];

  const filteredFeatures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return features.filter((feature) => {
      const matchesCategory =
        activeCategory === "All" ||
        feature.category === activeCategory;

      const searchableText = [
        feature.title,
        feature.desc,
        feature.details,
        feature.category,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const resetFilters = () => {
    setSearch("");
    setActiveCategory("All");
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className="overflow-hidden bg-white">

      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative min-h-[720px] py-24 sm:py-32">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">

          {/* Blue Glow */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -60, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/40 blur-3xl"
          />

          {/* Purple Glow */}
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 70, 0],
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-3xl"
          />

          {/* Flying Plane */}
          <motion.div
            initial={{
              x: "-15vw",
              y: 0,
              rotate: 10,
              opacity: 0,
            }}
            animate={{
              x: ["-15vw", "20vw", "50vw", "80vw", "115vw"],
              y: [20, -25, 10, -20, 5],
              rotate: [10, 5, 12, 4, 10],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.08, 0.5, 0.9, 1],
            }}
            className="absolute top-20 left-0 z-10"
          >
            <Plane className="w-16 h-16 text-blue-500/35 drop-shadow-lg" />
          </motion.div>

          {/* Flying Bus */}
          <motion.div
            initial={{
              x: "115vw",
              y: 0,
              opacity: 0,
            }}
            animate={{
              x: ["115vw", "80vw", "50vw", "20vw", "-15vw"],
              y: [0, 20, -10, 15, 0],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: 19,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.08, 0.5, 0.9, 1],
            }}
            className="absolute bottom-24 left-0 z-10"
          >
            <Bus className="w-16 h-16 text-purple-500/25 drop-shadow-lg" />
          </motion.div>

          {/* Cloud */}
          <motion.div
            initial={{
              x: "-15vw",
            }}
            animate={{
              x: ["-15vw", "115vw"],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-44 left-0"
          >
            <Cloud className="w-20 h-20 text-blue-300/30" />
          </motion.div>

          {/* Cloud */}
          <motion.div
            initial={{
              x: "110vw",
            }}
            animate={{
              x: ["110vw", "-20vw"],
            }}
            transition={{
              duration: 34,
              repeat: Infinity,
              ease: "linear",
              delay: 5,
            }}
            className="absolute top-64 left-0"
          >
            <Cloud className="w-24 h-24 text-purple-300/25" />
          </motion.div>

          {/* Floating Cloud */}
          <motion.div
            animate={{
              x: [0, 40, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 left-[15%] text-blue-200/30"
          >
            <Cloud className="w-14 h-14" />
          </motion.div>

          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            className="max-w-4xl mx-auto text-center"
          >

            {/* Heading */}
            <motion.h1
              variants={{
                hidden: {
                  opacity: 0,
                  y: 30,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                  },
                },
              }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight text-gray-900 mb-6"
            >
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Travel Better
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                  },
                },
              }}
              className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto"
            >
              A complete travel experience platform built to help you
              discover, plan, book, and manage unforgettable adventures
              with ease.
            </motion.p>

            {/* Search */}
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: 25,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                  },
                },
              }}
              className="max-w-2xl mx-auto mt-9"
            >
              <div className="relative group">

                <motion.div
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-xl"
                />

                <div className="relative">

                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search features..."
                    className="w-full h-16 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur pl-14 pr-14 text-sm sm:text-base outline-none shadow-xl shadow-gray-200/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                  />

                  <AnimatePresence>
                    {search && (
                      <motion.button
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
                        whileTap={{
                          scale: 0.9,
                        }}
                        onClick={() => setSearch("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>

          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                className="group relative p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 text-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50 group-hover:to-purple-50 transition-all duration-500" />

                <div className="relative">

                  <motion.p
                    initial={{
                      scale: 0.8,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.7 + index * 0.1,
                      duration: 0.5,
                    }}
                    className="font-display font-extrabold text-3xl sm:text-4xl text-blue-600"
                  >
                    {stat.value}
                  </motion.p>

                  <p className="text-sm text-gray-500 mt-2">
                    {stat.label}
                  </p>

                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* =====================================================
          FEATURES SECTION
      ===================================================== */}

      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{
              opacity: 0,
              y: 50,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-100px",
            }}
            transition={{
              duration: 0.8,
            }}
            className="text-center max-w-3xl mx-auto mb-12"
          >

            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
              Platform Features
            </span>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
              Designed Around Your Journey
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed">
              Explore the tools that make Wanderlust a complete and modern
              travel experience platform.
            </p>

          </motion.div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <motion.button
                  key={category}
                  whileHover={{
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 ${
                    active
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {category}
                </motion.button>
              );
            })}
          </div>

          {/* Results */}
          <motion.div
            layout
            className="flex items-center justify-between mb-6"
          >

            <p className="text-sm text-gray-400">
              {filteredFeatures.length}{" "}
              {filteredFeatures.length === 1
                ? "feature"
                : "features"}{" "}
              found
            </p>

            <AnimatePresence>
              {(search || activeCategory !== "All") && (
                <motion.button
                  initial={{
                    opacity: 0,
                    x: 15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 15,
                  }}
                  onClick={resetFilters}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Reset filters
                </motion.button>
              )}
            </AnimatePresence>

          </motion.div>

          {/* Feature Cards */}
          <AnimatePresence mode="popLayout">

            {filteredFeatures.length > 0 ? (

              <motion.div
                layout
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >

                {filteredFeatures.map((feature, index) => {

                  const Icon = feature.icon;

                  return (
                    <motion.div
                      layout
                      key={feature.title}
                      variants={cardVariants}
                      whileHover={{
                        y: -12,
                      }}
                      className="group relative"
                    >

                      <motion.div
                        className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-xl"
                        initial={{
                          opacity: 0,
                        }}
                        whileHover={{
                          opacity: 1,
                        }}
                      />

                      <div className="relative h-full rounded-3xl bg-white border border-gray-100 p-7 shadow-sm group-hover:shadow-2xl transition-all duration-500 overflow-hidden">

                        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Icon + Number */}
                        <div className="relative flex items-start justify-between mb-6">

                          <motion.div
                            whileHover={{
                              rotate: [0, -8, 8, 0],
                              scale: 1.08,
                            }}
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accent} p-[1px]`}
                          >
                            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                              <Icon className="w-6 h-6 text-gray-800" />
                            </div>
                          </motion.div>

                          <span className="text-xs font-bold text-gray-300 group-hover:text-blue-500 transition-colors">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                        </div>

                        {/* Category */}
                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold mb-4">
                          {feature.category}
                        </div>

                        {/* Title */}
                        <h3 className="font-display font-bold text-xl text-gray-900 mb-3">
                          {feature.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {feature.desc}
                        </p>

                        {/* Explore */}
                        <button
                          type="button"
                          onClick={() => setSelectedFeature(feature)}
                          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Explore feature
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>

                      </div>
                    </motion.div>
                  );
                })}

              </motion.div>

            ) : (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="text-center py-20"
              >

                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                  <Search className="w-7 h-7 text-gray-400" />
                </div>

                <h3 className="font-display font-bold text-xl mb-2">
                  No features found
                </h3>

                <p className="text-gray-500 text-sm max-w-md mx-auto mb-5">
                  Try another keyword or select a different category.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  View All Features
                </button>

              </motion.div>

            )}

          </AnimatePresence>

        </div>
      </section>

      {/* =====================================================
          TECHNOLOGY SECTION
      ===================================================== */}

      <section className="relative py-24 overflow-hidden">

        <div className="absolute inset-0 bg-gray-950" />

        {/* Background Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-3xl"
        />

        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Left */}
            <motion.div
              initial={{
                opacity: 0,
                x: -80,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                margin: "-100px",
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
            >

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-blue-300 text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                Built for Modern Travelers
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-6">
                Technology That Makes
                <span className="block text-blue-400">
                  Travel Feel Effortless
                </span>
              </h2>

              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Wanderlust combines modern frontend technology, powerful
                backend architecture, secure authentication, and thoughtful
                UX to create a complete digital travel experience.
              </p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                }}
                className="grid sm:grid-cols-2 gap-4"
              >

                {benefits.map((benefit) => (
                  <motion.div
                    key={benefit}
                    variants={{
                      hidden: {
                        opacity: 0,
                        x: -25,
                      },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          duration: 0.5,
                        },
                      },
                    }}
                    whileHover={{
                      x: 6,
                    }}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">
                      {benefit}
                    </span>
                  </motion.div>
                ))}

              </motion.div>

            </motion.div>

            {/* Right */}
            <motion.div
              initial={{
                opacity: 0,
                x: 80,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                margin: "-100px",
              }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
              >

                <div className="flex items-center gap-3 mb-8">

                  <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Layers3 className="w-5 h-5 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-white font-semibold">
                      Modern Technology Stack
                    </p>

                    <p className="text-xs text-gray-500">
                      Built for performance & scalability
                    </p>
                  </div>

                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                  }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >

                  {technologies.map((tech) => (
                    <motion.div
                      key={tech}
                      variants={cardVariants}
                      whileHover={{
                        scale: 1.06,
                        y: -5,
                      }}
                      className="rounded-2xl bg-white/5 border border-white/10 px-4 py-4 text-center hover:bg-white/10 hover:border-blue-500/30 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-300">
                        {tech}
                      </span>
                    </motion.div>
                  ))}

                </motion.div>

                <div className="grid grid-cols-3 gap-3 mt-6">

                  <motion.div
                    whileHover={{
                      y: -5,
                      scale: 1.03,
                    }}
                    className="rounded-2xl bg-white/5 p-4 text-center"
                  >
                    <Globe2 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">
                      Global
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{
                      y: -5,
                      scale: 1.03,
                    }}
                    className="rounded-2xl bg-white/5 p-4 text-center"
                  >
                    <Shield className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">
                      Secure
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{
                      y: -5,
                      scale: 1.03,
                    }}
                    className="rounded-2xl bg-white/5 p-4 text-center"
                  >
                    <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">
                      Fast
                    </p>
                  </motion.div>

                </div>

              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CTA SECTION
      ===================================================== */}

      <section className="py-24 bg-gradient-to-b from-white to-blue-50/50">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{
              opacity: 0,
              y: 60,
              scale: 0.92,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              margin: "-100px",
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 p-8 sm:p-14 text-center shadow-2xl"
          >

            {/* CTA Glow */}
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -40, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl"
            />

            <motion.div
              animate={{
                x: [0, -80, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-purple-300/10 blur-3xl"
            />

            {/* Plane Icon */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 4, -4, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-6"
            >
              <Plane className="w-8 h-8 text-white -rotate-12" />
            </motion.div>

            <h2 className="relative font-display font-extrabold text-3xl sm:text-4xl text-white mb-4">
              Ready to Start Your Next Adventure?
            </h2>

            <p className="relative text-blue-100 text-lg max-w-2xl mx-auto mb-8">
              Explore unique experiences, connect with incredible
              destinations, and create stories worth remembering.
            </p>

            <div className="relative flex flex-wrap justify-center gap-4">

              <Link
                to="/experiences"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-gray-100 transition-colors group"
              >
                Discover Experiences
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                Contact Us
              </Link>

            </div>

          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FEATURE DETAILS MODAL
      ===================================================== */}

      <AnimatePresence>

        {selectedFeature && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm"
            onClick={() => setSelectedFeature(null)}
          >

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.94,
              }}
              transition={{
                duration: 0.35,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-[2rem] bg-white shadow-2xl overflow-hidden"
            >

              <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

              <div className="p-7 sm:p-9">

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-colors"
                  aria-label="Close feature details"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedFeature.accent} p-[1px] mb-6`}
                >
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">

                    {(() => {
                      const SelectedIcon =
                        selectedFeature.icon;

                      return (
                        <SelectedIcon className="w-7 h-7 text-gray-800" />
                      );
                    })()}

                  </div>
                </div>

                {/* Category */}
                <span className="inline-flex px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold mb-3">
                  {selectedFeature.category}
                </span>

                {/* Title */}
                <h3 className="font-display font-extrabold text-2xl text-gray-900 mb-4">
                  {selectedFeature.title}
                </h3>

                {/* Details */}
                <p className="text-gray-500 leading-relaxed mb-6">
                  {selectedFeature.details}
                </p>

                {/* Benefits */}
                <div className="space-y-3">

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-blue-500" />
                    Easy to use
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-blue-500" />
                    Responsive experience
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-blue-500" />
                    Built for modern travelers
                  </div>

                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className="w-full mt-7 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Got It
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default Features;