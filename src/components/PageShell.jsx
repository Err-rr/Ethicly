import { motion } from "framer-motion";

export default function PageShell({ children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: "easeOut" }}
      className={`page-shell py-10 ${className}`}
    >
      {children}
    </motion.section>
  );
}
