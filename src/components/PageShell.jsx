import { motion } from "framer-motion";

export default function PageShell({ children }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#f8f9fa] px-6 py-10"
    >
      {children}
    </motion.section>
  );
}