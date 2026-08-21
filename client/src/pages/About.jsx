import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Heart,
  Globe,
  Users,
  Award,
  ArrowRight,
  MapPin,
  Compass,
  ShieldCheck,
  Mountain,
  Plane,
  Camera,
  MoveUpRight,
  Check,
  Navigation,
  Zap,
  ArrowUpRight,
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  Route,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const About = () => {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef(null);

  const [activeValue, setActiveValue] = useState(null);
  const [activeQuote, setActiveQuote] = useState(0);

  const ease = [0.22, 1, 0.36, 1];

  const values = [
    {
      icon: Heart,
      title: "Passion-Driven",
      desc: "We are travelers ourselves, passionate about discovering meaningful places and unforgettable experiences.",
      number: "01",
    },
    {
      icon: Globe,
      title: "Global Reach",
      desc: "Discover unique experiences across destinations around the world, from iconic cities to hidden gems.",
      number: "02",
    },
    {
      icon: Users,
      title: "Community First",
      desc: "We connect curious travelers with local experts who bring authentic stories and experiences to life.",
      number: "03",
    },
    {
      icon: Award,
      title: "Quality Curated",
      desc: "Every experience is carefully selected to deliver memorable moments, trusted hosts, and exceptional quality.",
      number: "04",
    },
  ];

  const stats = [
    {
      value: 15,
      suffix: "K+",
      label: "Happy Travelers",
      icon: Users,
    },
    {
      value: 200,
      suffix: "+",
      label: "Unique Experiences",
      icon: Compass,
    },
    {
      value: 50,
      suffix: "+",
      label: "Destinations",
      icon: Globe,
    },
    {
      value: 4.9,
      suffix: "",
      label: "Average Rating",
      icon: Award,
      decimal: true,
    },
  ];

  const highlights = [
    "Authentic local experiences",
    "Carefully selected destinations",
    "Trusted local hosts",
    "Memorable adventures",
  ];

  const quotes = [
    {
      text: "The world is full of stories waiting to be discovered.",
      author: "Wanderlust",
    },
    {
      text: "Every journey becomes meaningful when you connect with the places and people around you.",
      author: "Wanderlust",
    },
    {
      text: "Travel is not just about seeing new places, but creating memories that stay with you.",
      author: "Wanderlust",
    },
    {
      text: "The best adventures begin with curiosity and end with stories worth sharing.",
      author: "Wanderlust",
    },
  ];

  const floatingIcons = [
    {
      icon: Plane,
      x: "8%",
      y: "25%",
      delay: 0,
      duration: 7,
    },
    {
      icon: Camera,
      x: "90%",
      y: "20%",
      delay: 1,
      duration: 8,
    },
    {
      icon: Mountain,
      x: "92%",
      y: "68%",
      delay: 2,
      duration: 9,
    },
    {
      icon: Navigation,
      x: "5%",
      y: "70%",
      delay: 0.5,
      duration: 7,
    },
  ];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 45,
    damping: 24,
    mass: 0.8,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 45,
    damping: 24,
    mass: 0.8,
  });

  const heroX = useTransform(smoothX, [-700, 700], [-18, 18]);
  const heroY = useTransform(smoothY, [-700, 700], [-12, 12]);

  const orbX = useTransform(smoothX, [-700, 700], [30, -30]);
  const orbY = useTransform(smoothY, [-700, 700], [30, -30]);

  const contentX = useTransform(smoothX, [-700, 700], [-5, 5]);
  const contentY = useTransform(smoothY, [-700, 700], [-4, 4]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (event) => {
      const rect = heroRef.current?.getBoundingClientRect();

      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseX.set(event.clientX - centerX);
      mouseY.set(event.clientY - centerY);
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY, shouldReduceMotion]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease,
      },
    },
  };

  const fadeLeft = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : -60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.9,
        ease,
      },
    },
  };

  const fadeRight = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : 60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.9,
        ease,
      },
    },
  };

  const nextQuote = () => {
    setActiveQuote((current) => (current + 1) % quotes.length);
  };

  const previousQuote = () => {
    setActiveQuote(
      (current) => (current - 1 + quotes.length) % quotes.length
    );
  };

  const AnimatedCounter = ({ value, suffix, decimal }) => {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const counterRef = useRef(null);

    useEffect(() => {
      const element = counterRef.current;

      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.35,
        }
      );

      observer.observe(element);

      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      if (!started) return;

      if (shouldReduceMotion) {
        setCount(value);
        return;
      }

      let animationFrame;
      const duration = 1600;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const progress = Math.min(
          (currentTime - startTime) / duration,
          1
        );

        const eased = 1 - Math.pow(1 - progress, 4);

        setCount(value * eased);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }, [started, value, shouldReduceMotion]);

    return (
      <span ref={counterRef}>
        {decimal ? count.toFixed(1) : Math.floor(count)}
        {suffix}
      </span>
    );
  };

  return (
    <main className="w-full overflow-hidden bg-white text-slate-900">
      <section
        ref={heroRef}
        className="relative w-full min-h-screen flex items-center overflow-hidden bg-slate-950"
      >
        <motion.div
          style={{
            x: shouldReduceMotion ? 0 : heroX,
            y: shouldReduceMotion ? 0 : heroY,
          }}
          className="absolute -inset-10"
        >
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2600&q=90"
            alt="Beautiful mountain landscape"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        <div className="absolute inset-0 bg-slate-950/45" />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />

        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.2, 1],
                  opacity: [0.04, 0.13, 0.04],
                }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-blue-500/20 blur-[130px]"
        />

        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1.2, 0.9, 1.2],
                  opacity: [0.03, 0.1, 0.03],
                }
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-60 -right-60 w-[700px] h-[700px] rounded-full bg-indigo-500/20 blur-[130px]"
        />

        <motion.div
          style={{
            x: shouldReduceMotion ? 0 : orbX,
            y: shouldReduceMotion ? 0 : orbY,
          }}
          className="absolute top-[25%] right-[18%] hidden lg:block w-56 h-56 rounded-full border border-white/10"
        />

        <motion.div
          style={{
            x: shouldReduceMotion ? 0 : orbX,
            y: shouldReduceMotion ? 0 : orbY,
          }}
          className="absolute top-[30%] right-[23%] hidden lg:block w-28 h-28 rounded-full bg-blue-400/10 blur-2xl"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "90px 90px",
          }}
        />

        {!shouldReduceMotion &&
          floatingIcons.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  opacity: [0.05, 0.2, 0.05],
                  y: [0, -25, 0],
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: item.duration,
                  delay: item.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  left: item.x,
                  top: item.y,
                }}
                className="absolute hidden lg:flex w-14 h-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl items-center justify-center text-white"
              >
                <Icon className="w-6 h-6" />
              </motion.div>
            );
          })}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            x: shouldReduceMotion ? 0 : contentX,
            y: shouldReduceMotion ? 0 : contentY,
          }}
          className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-32"
        >
          <div className="w-full max-w-[1100px]">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl text-white text-xs sm:text-sm font-semibold mb-8">
                <Compass className="w-4 h-4 text-blue-300" />
                Discover the story behind Wanderlust
                <ArrowRight className="w-3.5 h-3.5 text-white/50" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display font-extrabold text-[3.5rem] sm:text-6xl md:text-7xl lg:text-[7.5rem] xl:text-[8.5rem] leading-[0.88] tracking-[-0.055em] text-white mb-8"
            >
              Travel More.
              <span className="block mt-4 text-blue-300">
                Experience More.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/75 leading-8 max-w-3xl mb-10"
            >
              Wanderlust was created for curious people who believe the best
              journeys are not just about where you go, but the stories,
              people, and moments you discover along the way.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/experiences"
                className="w-full sm:w-auto"
              >
                <motion.div
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: 1.04,
                          y: -5,
                        }
                  }
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="relative overflow-hidden inline-flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-2xl shadow-blue-950/40"
                >
                  {!shouldReduceMotion && (
                    <motion.span
                      animate={{
                        x: ["-120%", "150%"],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      className="absolute inset-y-0 w-16 bg-white/25 skew-x-[-20deg]"
                    />
                  )}

                  <span className="relative">
                    Explore Experiences
                  </span>

                  <ArrowRight className="relative w-5 h-5" />
                </motion.div>
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto"
              >
                <motion.div
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -5,
                          backgroundColor: "rgba(255,255,255,0.14)",
                        }
                  }
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/10 border border-white/25 backdrop-blur-xl text-white font-bold"
                >
                  Get in Touch
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center gap-4 mt-12"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-300" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Travel differently
                </p>

                <p className="text-sm font-semibold text-white/80 mt-1">
                  Discover meaningful journeys
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: 60,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 1.2,
            duration: 0.9,
            ease,
          }}
          className="absolute bottom-10 right-8 lg:right-14 xl:right-20 hidden xl:flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl text-white shadow-2xl"
        >
          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    rotate: [0, 360],
                  }
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center"
          >
            <MapPin className="w-5 h-5" />
          </motion.div>

          <div>
            <p className="text-xs text-white/50">
              Explore
            </p>

            <p className="font-bold">
              The world differently
            </p>
          </div>
        </motion.div>

        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/40">
          <span className="text-[9px] uppercase tracking-[0.35em]">
            Scroll
          </span>

          <motion.div
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, 8, 0],
                  }
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="w-5 h-8 rounded-full border border-white/30 flex justify-center pt-1"
          >
            <div className="w-1 h-1.5 rounded-full bg-white" />
          </motion.div>
        </div>
      </section>

      <section className="relative w-full py-24 sm:py-28 lg:py-36 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px]" />
        </div>

        <div className="relative w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20 xl:gap-28 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
            >
              <motion.div variants={fadeLeft}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-6">
                  <Compass className="w-4 h-4" />
                  Our Mission
                </span>
              </motion.div>

              <motion.h2
                variants={fadeLeft}
                className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1] tracking-tight text-slate-900 mb-8"
              >
                Making Extraordinary Travel
                <span className="block text-blue-600 mt-2">
                  Accessible
                </span>
              </motion.h2>

              <motion.p
                variants={fadeLeft}
                className="text-slate-600 leading-8 text-base sm:text-lg mb-6 max-w-2xl"
              >
                We believe the best travel experiences come from genuine
                connections with local people, cultures, and places.
                Wanderlust brings those connections closer to you.
              </motion.p>

              <motion.p
                variants={fadeLeft}
                className="text-slate-600 leading-8 text-base sm:text-lg mb-9 max-w-2xl"
              >
                From hidden food spots and peaceful mountain trails to creative
                workshops and unforgettable city adventures, we help travelers
                discover experiences that create lasting memories.
              </motion.p>

              <div className="grid sm:grid-cols-2 gap-5">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{
                      opacity: 0,
                      x: shouldReduceMotion ? 0 : -20,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.6,
                      ease,
                    }}
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            x: 6,
                          }
                    }
                    className="group flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 group-hover:bg-blue-600 flex items-center justify-center shrink-0 transition-all duration-300">
                      <Check className="w-4 h-4 text-blue-600 group-hover:text-white" />
                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
              className="relative"
            >
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        rotate: 360,
                      }
                }
                transition={{
                  duration: 35,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full border border-dashed border-blue-200"
              />

              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -12, 0],
                      }
                }
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-8 -right-8 w-32 h-32 bg-blue-100 rounded-full blur-3xl"
              />

              <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_35px_90px_rgba(15,23,42,0.15)]">
                <motion.img
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: 1.06,
                        }
                  }
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                  }}
                  src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1800&q=90"
                  alt="Travelers exploring nature"
                  className="w-full h-[500px] sm:h-[620px] lg:h-[680px] object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <motion.div
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            y: -5,
                          }
                    }
                    className="flex items-center gap-4 p-5 rounded-2xl bg-slate-950/60 border border-white/15 backdrop-blur-xl text-white"
                  >
                    <div className="w-13 h-13 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 fill-white" />
                    </div>

                    <div>
                      <p className="font-bold text-lg">
                        Stories worth remembering
                      </p>

                      <p className="text-sm text-white/70 mt-1">
                        Every journey becomes a memory.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative w-full py-20 sm:py-24 lg:py-28 overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950">
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  x: [-150, 150, -150],
                  y: [-50, 50, -50],
                }
          }
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-60 left-1/4 w-[650px] h-[650px] rounded-full bg-blue-300/10 blur-[120px]"
        />

        <div className="relative w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.25,
                  }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.7,
                    ease,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -8,
                        }
                  }
                  className="text-center"
                >
                  <motion.div
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            rotate: 8,
                            scale: 1.08,
                          }
                    }
                    className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-md"
                  >
                    <Icon className="w-6 h-6 text-blue-200" />
                  </motion.div>

                  <p className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      decimal={stat.decimal}
                    />
                  </p>

                  <p className="text-sm text-white/70 mt-3">
                    {stat.label}
                  </p>

                  <div className="w-10 h-0.5 bg-blue-300/60 rounded-full mx-auto mt-4" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative w-full py-24 sm:py-28 lg:py-36 bg-slate-50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-100/50 blur-[130px] rounded-full" />

        <div className="relative w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-blue-700 text-sm font-bold mb-6 shadow-sm">
                <Compass className="w-4 h-4" />
                What We Believe
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-7xl tracking-tight text-slate-900 mb-6"
            >
              The values behind
              <span className="text-blue-600">
                {" "}every journey
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-slate-600 leading-8 text-base sm:text-lg max-w-2xl mx-auto"
            >
              The principles that guide every experience, partnership,
              and adventure we create.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              const isActive = activeValue === index;

              return (
                <motion.div
                  key={value.title}
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 50,
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
                    delay: index * 0.1,
                    duration: 0.75,
                    ease,
                  }}
                  onMouseEnter={() => setActiveValue(index)}
                  onMouseLeave={() => setActiveValue(null)}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -12,
                        }
                  }
                  className="group relative min-h-[330px] bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)] hover:border-blue-200 transition-all duration-500 overflow-hidden"
                >
                  <motion.div
                    animate={
                      isActive
                        ? {
                            scale: 1.4,
                            opacity: 1,
                          }
                        : {
                            scale: 1,
                            opacity: 0,
                          }
                    }
                    className="absolute -top-24 -right-24 w-52 h-52 bg-blue-100 rounded-full blur-3xl"
                  />

                  <span className="absolute top-6 right-7 text-6xl font-black text-blue-50 group-hover:text-blue-100 transition-colors">
                    {value.number}
                  </span>

                  <motion.div
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            rotate: [0, -8, 8, 0],
                            scale: 1.08,
                          }
                    }
                    className="relative z-10 w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 group-hover:bg-blue-600 flex items-center justify-center mb-8 transition-colors duration-500"
                  >
                    <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-500" />
                  </motion.div>

                  <h3 className="relative z-10 font-display font-bold text-2xl text-slate-900 mb-4">
                    {value.title}
                  </h3>

                  <p className="relative z-10 text-sm text-slate-600 leading-7">
                    {value.desc}
                  </p>

                  <div className="relative z-10 mt-8 flex items-center justify-between">
                    <motion.div
                      animate={{
                        width: isActive ? "70px" : "35px",
                      }}
                      className="h-1 rounded-full bg-blue-500"
                    />

                    <motion.div
                      animate={
                        isActive
                          ? {
                              opacity: 1,
                              x: 0,
                            }
                          : {
                              opacity: 0,
                              x: -8,
                            }
                      }
                      className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"
                    >
                      <MoveUpRight className="w-4 h-4 text-blue-600" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative w-full py-24 sm:py-28 lg:py-36 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-white" />

        <div className="relative w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <motion.div
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.8,
              ease,
            }}
            className="relative w-full rounded-[2.5rem] border border-slate-200 bg-slate-50 p-8 sm:p-12 lg:p-20 text-center overflow-hidden"
          >
            <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-blue-100/60 blur-3xl" />

            <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-indigo-100/60 blur-3xl" />

            <div className="relative z-10">
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        rotate: [0, -5, 5, 0],
                        scale: [1, 1.05, 1],
                      }
                }
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="w-16 h-16 mx-auto mb-7 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/20"
              >
                <Quote className="w-7 h-7" />
              </motion.div>

              <div className="min-h-[180px] flex items-center justify-center">
                <motion.div
                  key={activeQuote}
                  initial={{
                    opacity: 0,
                    x: shouldReduceMotion ? 0 : 40,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    ease,
                  }}
                  className="w-full"
                >
                  <p className="font-display font-bold text-2xl sm:text-3xl lg:text-5xl leading-tight text-slate-900 max-w-4xl mx-auto">
                    "{quotes[activeQuote].text}"
                  </p>

                  <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-500">
                    <div className="w-10 h-px bg-blue-300" />
                    {quotes[activeQuote].author}
                    <div className="w-10 h-px bg-blue-300" />
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-10">
                <motion.button
                  type="button"
                  onClick={previousQuote}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: 1.1,
                          x: -3,
                        }
                  }
                  whileTap={{
                    scale: 0.94,
                  }}
                  aria-label="Previous quote"
                  className="w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center gap-2">
                  {quotes.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveQuote(index)}
                      aria-label={`Go to quote ${index + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeQuote === index
                          ? "w-8 bg-blue-600"
                          : "w-2 bg-slate-300 hover:bg-blue-300"
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  type="button"
                  onClick={nextQuote}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: 1.1,
                          x: 3,
                        }
                  }
                  whileTap={{
                    scale: 0.94,
                  }}
                  aria-label="Next quote"
                  className="w-12 h-12 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-400">
                {activeQuote + 1} / {quotes.length}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative w-full min-h-[650px] flex items-center overflow-hidden bg-slate-950">
        <motion.img
          initial={{
            scale: shouldReduceMotion ? 1 : 1.15,
          }}
          whileInView={{
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.5,
            ease,
          }}
          src="https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2600&q=90"
          alt="Beautiful travel destination"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-slate-950/55" />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />

        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.25, 1],
                  opacity: [0.03, 0.1, 0.03],
                }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full"
        />

        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -right-40 -top-40 w-[600px] h-[600px] rounded-full border border-blue-400/15"
        />

        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-28">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
            }}
            className="max-w-5xl"
          >
            <motion.div variants={fadeUp}>
              <div className="w-16 h-16 mb-8 rounded-2xl bg-blue-500/15 border border-blue-400/25 flex items-center justify-center">
                <Compass className="w-8 h-8 text-blue-300" />
              </div>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display font-extrabold text-5xl sm:text-6xl lg:text-8xl xl:text-9xl text-white leading-[0.9] tracking-[-0.05em] mb-8"
            >
              Your Next Story
              <span className="block text-blue-300 mt-3">
                Starts Here.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-white/75 max-w-3xl text-base sm:text-lg lg:text-xl leading-8 mb-10"
            >
              Leave your routine behind and discover places, people,
              and experiences that you'll remember long after your
              journey ends.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                to="/experiences"
                aria-label="Start exploring experiences"
              >
                <motion.div
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          scale: 1.04,
                          y: -5,
                        }
                  }
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-xl shadow-blue-950/40 transition-colors"
                >
                  Start Exploring

                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-9 text-sm text-white/60"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Trusted experiences
              </span>

              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-400" />
                4.9 average rating
              </span>

              <span className="flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-400" />
                50+ destinations
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default About;