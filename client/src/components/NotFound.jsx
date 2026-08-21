import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Home,
  Map,
  Navigation,
  Mountain,
} from 'lucide-react';

const NotFound = () => {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.replace('/');
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50/40 px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -35, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -45, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-secondary-200/25 blur-3xl"
        />

        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute left-[8%] top-[18%] hidden h-24 w-24 rounded-full border border-primary-200/50 sm:block"
        />

        <motion.div
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 36,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-[16%] right-[8%] hidden h-32 w-32 rounded-full border border-secondary-200/50 sm:block"
        />

        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.25, 0.8, 0.25],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute left-[14%] top-[32%] h-2 w-2 rounded-full bg-primary-400"
        />

        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.9, 0.3],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute right-[16%] top-[27%] h-3 w-3 rounded-full bg-secondary-400"
        />

        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-[22%] left-[20%] h-2 w-2 rounded-full bg-primary-300"
        />

        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary-100 to-transparent" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 35,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-3xl text-center"
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            rotate: -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.65,
            type: 'spring',
            stiffness: 180,
            damping: 16,
          }}
          className="relative mx-auto mb-8 h-24 w-24 sm:h-28 sm:w-28"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -inset-3 rounded-[2rem] border border-primary-200/50"
          />

          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 shadow-2xl shadow-primary-500/30" />

          <motion.div
            animate={{
              rotate: [0, -8, 8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Compass
              className="h-12 w-12 text-white sm:h-14 sm:w-14"
              strokeWidth={1.8}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.45,
          }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-600 shadow-sm backdrop-blur-md">
            <Navigation className="h-3.5 w-3.5" />
            <span>Destination Not Found</span>
          </div>

          <motion.h1
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.25,
              duration: 0.55,
              type: 'spring',
              stiffness: 140,
              damping: 14,
            }}
            className="select-none bg-gradient-to-r from-primary-700 via-primary-500 to-secondary-500 bg-clip-text font-display text-[7rem] font-extrabold leading-none tracking-[-0.06em] text-transparent sm:text-[9rem] md:text-[11rem]"
          >
            404
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.38,
            duration: 0.5,
          }}
          className="mt-5"
        >
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
            Looks like you've wandered off the map
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            The destination you're looking for doesn't exist, has moved,
            or the link may have taken an unexpected turn.
          </p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.5,
            duration: 0.5,
          }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/"
            className="group btn-primary min-w-[160px] justify-center shadow-lg shadow-primary-500/20"
          >
            <Home className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span>Back to Home</span>
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className="group btn-outline min-w-[160px] justify-center bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Go Back</span>
          </button>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.7,
            duration: 0.5,
          }}
          className="mx-auto mt-12 flex max-w-md items-center justify-center gap-3"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />

          <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white/70 px-4 py-2 text-xs font-medium text-gray-400 shadow-sm backdrop-blur-md">
            <Map className="h-3.5 w-3.5 text-primary-500" />
            <span>Keep exploring with Wanderlust</span>
          </div>

          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
        </motion.div>

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
            delay: 0.8,
            duration: 0.4,
          }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"
        >
          <Mountain className="h-3.5 w-3.5" />
          <span>Your next adventure is waiting.</span>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default NotFound;