import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  LoaderCircle,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({
  children,
  adminOnly = false,
}) => {
  const {
    isAuthenticated,
    isAdmin,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50/40 px-4">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <motion.div
            animate={{
              x: [0, 35, 0],
              y: [0, -25, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary-200/30 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -30, 0],
              y: [0, 25, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-secondary-200/25 blur-3xl"
          />

          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute left-[12%] top-[20%] hidden h-20 w-20 rounded-full border border-primary-200/50 sm:block"
          />

          <motion.div
            animate={{
              rotate: [360, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute bottom-[18%] right-[12%] hidden h-28 w-28 rounded-full border border-secondary-200/50 sm:block"
          />
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
        >
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative mb-7"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute -inset-3 rounded-[1.8rem] border border-primary-200/60"
            />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 shadow-2xl shadow-primary-500/25">
              <motion.div
                animate={{
                  rotate: [0, 8, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Compass
                  className="h-9 w-9 text-white"
                  strokeWidth={1.9}
                />
              </motion.div>

              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-lg"
              >
                <LoaderCircle className="h-4 w-4 animate-spin text-primary-600" />
              </motion.div>
            </div>
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
              delay: 0.15,
              duration: 0.4,
            }}
          >
            <h1 className="font-display text-xl font-bold text-gray-900 sm:text-2xl">
              Preparing your journey
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Checking your account and getting everything ready...
            </p>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              width: 0,
            }}
            animate={{
              opacity: 1,
              width: '100%',
            }}
            transition={{
              delay: 0.25,
              duration: 0.5,
            }}
            className="mt-6 h-1.5 max-w-[220px] overflow-hidden rounded-full bg-gray-100"
          >
            <motion.div
              animate={{
                x: ['-100%', '250%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"
            />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.45,
              duration: 0.4,
            }}
            className="mt-6 flex items-center gap-2 text-xs font-medium text-gray-400"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary-500" />
            <span>Secure authentication</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        state={{
          unauthorized: true,
          from: location,
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;