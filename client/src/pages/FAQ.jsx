import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  Search,
  MessageCircle,
  BookOpen,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  Heart,
  Users,
  ArrowRight,
  Zap,
  Headphones,
  X,
  Plane,
  Cloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const [open, setOpen] = useState(0);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const faqs = useMemo(
    () => [
      {
        id: 1,
        category: "Booking",
        icon: CalendarCheck,
        q: "How do I book an experience?",
        a: "Choose an experience that interests you, open its details, select your preferred date and number of guests, and click Book Now. You will be asked to sign in or create a Wanderlust account before completing your booking.",
      },
      {
        id: 2,
        category: "Booking",
        icon: CalendarCheck,
        q: "Can I cancel my booking?",
        a: "Yes. You can manage your bookings from the My Bookings section of your dashboard. Select the booking you want to cancel and follow the cancellation process. Any refund will depend on the cancellation policy associated with that experience.",
      },
      {
        id: 3,
        category: "Reviews",
        icon: ShieldCheck,
        q: "Are the reviews from real travelers?",
        a: "Wanderlust is designed to encourage genuine traveler feedback. Reviews are associated with users and their experience activity on the platform, helping future travelers understand what they can expect before making a booking.",
      },
      {
        id: 4,
        category: "Favorites",
        icon: Heart,
        q: "How can I save an experience for later?",
        a: "Click the heart icon on any experience card or experience details page to save it. Your saved experiences are available anytime from the Favorites section of your dashboard, making it easy to return to places you are interested in.",
      },
      {
        id: 5,
        category: "Payments",
        icon: CreditCard,
        q: "What payment methods are available?",
        a: "Wanderlust supports major payment methods available through the booking system. The payment options shown to you may vary depending on the experience, booking details, and your location.",
      },
      {
        id: 6,
        category: "Account",
        icon: Users,
        q: "Do I need an account to explore experiences?",
        a: "No. You can browse destinations and discover experiences without creating an account. An account is required when you want to make bookings, save favorites, manage your profile, or use other personalized features.",
      },
      {
        id: 7,
        category: "Support",
        icon: MessageCircle,
        q: "What should I do if I have a problem during my experience?",
        a: "If you experience an issue, contact the Wanderlust support team through the Contact page and include your booking information and a short description of the problem. Providing accurate details helps our team understand the situation and assist you more effectively.",
      },
      {
        id: 8,
        category: "Booking",
        icon: Users,
        q: "Can I book an experience for a large group?",
        a: "Yes, as long as the experience has enough available capacity. Each experience shows its maximum group size. For larger groups, you can contact our support team to discuss whether a suitable arrangement can be made.",
      },
      {
        id: 9,
        category: "Safety",
        icon: ShieldCheck,
        q: "How are experiences selected for Wanderlust?",
        a: "We aim to provide travelers with useful, well-presented experiences from trusted hosts. Experience information, host details, traveler feedback, availability, and other relevant details help users make informed decisions.",
      },
      {
        id: 10,
        category: "Account",
        icon: ShieldCheck,
        q: "How is my account information protected?",
        a: "We use appropriate security practices to help protect your account and personal information. For your own security, always use a strong password, avoid sharing your login details, and contact support if you notice anything unusual with your account.",
      },
    ],
    []
  );

  const categories = useMemo(
    () => [
      { name: "All", icon: BookOpen },
      { name: "Booking", icon: CalendarCheck },
      { name: "Payments", icon: CreditCard },
      { name: "Account", icon: Users },
      { name: "Reviews", icon: ShieldCheck },
      { name: "Support", icon: MessageCircle },
    ],
    []
  );

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;

      const matchesSearch =
        !query ||
        faq.q.toLowerCase().includes(query) ||
        faq.a.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [faqs, search, activeCategory]);

  const toggleFaq = (faqId) => {
    setOpen((current) => (current === faqId ? null : faqId));
  };

  const resetFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setOpen(faqs[0]?.id ?? null);
  };

  const handleCategoryChange = (categoryName) => {
    setActiveCategory(categoryName);
    setOpen(null);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setOpen(null);
  };

  const clearSearch = () => {
    setSearch("");
    setOpen(null);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
      <section className="relative flex min-h-[680px] items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50" />

        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-300/20 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-sky-300/20 blur-3xl"
        />

        <motion.div
          animate={{
            x: ["-15vw", "115vw"],
            y: [0, -18, 10, -10, 0],
            rotate: [0, 2, -2, 2, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute left-[-100px] top-[16%] z-10 hidden sm:block"
        >
          <div className="relative">
            <motion.div
              animate={{
                opacity: [0.15, 0.35, 0.15],
                scaleX: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute right-8 top-8 h-2 w-32 bg-gradient-to-r from-transparent via-blue-300 to-transparent blur-md"
            />

            <Plane className="h-14 w-14 fill-blue-100 text-blue-600 drop-shadow-xl" />
          </div>
        </motion.div>

        <motion.div
          animate={{
            x: ["110vw", "-15vw"],
            y: [0, 25, -10, 20, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
            delay: 5,
          }}
          className="pointer-events-none absolute right-[-80px] top-[30%] hidden lg:block"
        >
          <Cloud className="h-16 w-16 fill-white text-sky-200" />
        </motion.div>

        <motion.div
          animate={{
            x: [0, 20, 0],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute left-[18%] top-[42%] hidden md:block"
        >
          <Cloud className="h-10 w-10 fill-white text-blue-100" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -12, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute bottom-28 right-[10%] hidden lg:block"
        >
          <Zap className="h-6 w-6 text-sky-400" />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-size:24px_24px] bg-[radial-gradient(circle_at_1px_1px,#0f172a_1px,transparent_0)]" />

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 45,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-center"
          >
            <motion.div
              initial={{
                scale: 0.5,
                opacity: 0,
                rotate: -15,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              transition={{
                delay: 0.15,
                duration: 0.7,
                type: "spring",
                stiffness: 120,
              }}
              whileHover={{
                scale: 1.06,
              }}
              className="relative mx-auto mb-7 h-24 w-24"
            >
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.45, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-2xl"
              />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/30">
                <HelpCircle
                  className="h-11 w-11 text-white"
                  strokeWidth={1.7}
                />
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
                delay: 0.3,
                duration: 0.5,
              }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur-md">
                <HelpCircle className="h-4 w-4" />
                We're here to help
              </span>
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
                duration: 0.7,
              }}
              className="mt-6 mb-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                Questions
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.5,
                duration: 0.6,
              }}
              className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg"
            >
              Find helpful answers about bookings, payments, accounts,
              favorites, reviews, and everything you need for a smooth
              Wanderlust experience.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                delay: 0.65,
                duration: 0.6,
              }}
              className="mx-auto mt-9 max-w-2xl"
            >
              <div className="group relative">
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/25 to-sky-500/25 blur-xl"
                  animate={{
                    opacity: [0.25, 0.55, 0.25],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />

                <div className="relative">
                  <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-blue-500" />

                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search your question..."
                    className="h-16 w-full rounded-2xl border border-gray-200 bg-white/95 pl-14 pr-14 text-sm shadow-xl shadow-gray-200/50 outline-none backdrop-blur transition-all duration-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 sm:text-base"
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
                        whileHover={{
                          scale: 1.08,
                        }}
                        whileTap={{
                          scale: 0.92,
                        }}
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
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
            delay: 0.2,
            duration: 0.6,
          }}
          className="scrollbar-hide flex gap-2 overflow-x-auto pb-3"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            const active = activeCategory === category.name;

            return (
              <motion.button
                key={category.name}
                type="button"
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.25 + index * 0.06,
                }}
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.96,
                }}
                onClick={() => handleCategoryChange(category.name)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          layout
          className="mt-5 mb-5 flex items-center justify-between"
        >
          <p className="text-sm text-gray-400">
            {filteredFaqs.length}{" "}
            {filteredFaqs.length === 1 ? "question" : "questions"} found
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
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Reset filters
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.map((faq, index) => {
              const Icon = faq.icon;
              const isOpen = open === faq.id;
              const answerId = `faq-answer-${faq.id}`;

              return (
                <motion.div
                  layout
                  key={faq.id}
                  initial={{
                    opacity: 0,
                    y: 25,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    scale: 0.97,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(index * 0.04, 0.2),
                    layout: {
                      duration: 0.35,
                    },
                  }}
                  whileHover={{
                    y: -2,
                  }}
                  className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-blue-200 shadow-2xl shadow-blue-500/10"
                      : "border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-xl"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center gap-4 p-5 text-left sm:gap-5 sm:p-6"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <motion.div
                      animate={{
                        scale: isOpen ? 1.05 : 1,
                        rotate: isOpen ? 3 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                        isOpen
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                          {faq.category}
                        </span>
                      </div>

                      <span className="block pr-2 text-sm font-semibold text-gray-900 sm:text-base">
                        {faq.q}
                      </span>
                    </div>

                    <motion.div
                      animate={{
                        rotate: isOpen ? 180 : 0,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                        isOpen
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                      }`}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={answerId}
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          height: {
                            duration: 0.35,
                            ease: [0.4, 0, 0.2, 1],
                          },
                          opacity: {
                            duration: 0.25,
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={{
                            y: -10,
                          }}
                          animate={{
                            y: 0,
                          }}
                          exit={{
                            y: -10,
                          }}
                          transition={{
                            duration: 0.25,
                          }}
                          className="px-5 pb-6 pl-[76px] pr-5 sm:px-6 sm:pb-6 sm:pl-[88px] sm:pr-8"
                        >
                          <div className="mb-5 h-px bg-gradient-to-r from-blue-100 via-gray-100 to-transparent" />

                          <p className="text-sm leading-7 text-gray-500 sm:text-base">
                            {faq.a}
                          </p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
            }}
            className="px-6 py-20 text-center"
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 4, -4, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50"
            >
              <Search className="h-7 w-7 text-blue-400" />
            </motion.div>

            <h3 className="mb-2 text-xl font-bold">
              No questions found
            </h3>

            <p className="mx-auto mb-5 max-w-md text-sm text-gray-500">
              We couldn't find anything matching your search. Try different
              keywords or browse another category.
            </p>

            <motion.button
              type="button"
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={resetFilters}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700"
            >
              View All Questions
            </motion.button>
          </motion.div>
        )}

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
            amount: 0.2,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mt-16 overflow-hidden rounded-[2rem]"
        >
          <motion.div
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600"
          />

          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl"
          />

          <motion.div
            animate={{
              x: ["-20%", "120%"],
              y: [10, -10, 15, 0],
              rotate: [0, 3, -2, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute left-0 top-10 opacity-20"
          >
            <Plane className="h-12 w-12 text-white" />
          </motion.div>

          <div className="relative px-6 py-12 text-center text-white sm:px-10 sm:py-14">
            <motion.div
              initial={{
                scale: 0,
                rotate: -20,
              }}
              whileInView={{
                scale: 1,
                rotate: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 12,
              }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md"
            >
              <Headphones className="h-8 w-8" />
            </motion.div>

            <h2 className="mb-3 text-2xl font-extrabold sm:text-3xl">
              Still have questions?
            </h2>

            <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-blue-100 sm:text-base">
              Can't find the answer you're looking for? Our support team is
              ready to help you with bookings, account questions, and anything
              else related to your Wanderlust journey.
            </p>

            <motion.div
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-700 shadow-xl transition-all duration-300 hover:bg-blue-50"
              >
                Contact Support

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default FAQ;