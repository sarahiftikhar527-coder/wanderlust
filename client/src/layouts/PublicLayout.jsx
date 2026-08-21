import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const pageTransition = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -10,
  },
};

const pageTransitionConfig = {
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1],
};

const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc] text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute -top-48 -left-48 w-[520px] h-[520px] rounded-full bg-indigo-500/[0.035] blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 -right-56 w-[600px] h-[600px] rounded-full bg-violet-500/[0.035] blur-[130px]"
        />

        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-60 left-1/3 w-[500px] h-[500px] rounded-full bg-fuchsia-500/[0.025] blur-[120px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.018),transparent_35%)]" />
      </div>

      <motion.header
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-50"
      >
        <Navbar />
      </motion.header>

      <main className="relative z-10 flex-1">
        <AnimatePresence
          mode="wait"
          initial={false}
        >
          <motion.div
            key={`${location.pathname}${location.search}`}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransitionConfig}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.footer
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
          amount: 0.02,
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10"
      >
        <Footer />
      </motion.footer>

      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3200,
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "15px",
            padding: "13px 16px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
          },
          success: {
            duration: 3200,
            iconTheme: {
              primary: "#8b5cf6",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4200,
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#ffffff",
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />

      <style>{`
        html {
          scroll-behavior: smooth;
        }

        body {
          background: #f8f9fc;
        }

        ::selection {
          background: rgba(99, 102, 241, 0.18);
          color: #312e81;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.25);
          border-radius: 999px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.4);
        }
      `}</style>
    </div>
  );
};

export default PublicLayout;