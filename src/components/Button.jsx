import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion.create(Link);

const styles = {
  primary:
    "bg-google-blue text-white shadow-card hover:brightness-95 hover:shadow-soft focus-visible:focus-ring",
  secondary:
    "bg-white text-google-blue ring-1 ring-[#dadce0] hover:bg-[#f1f6ff] hover:ring-google-blue focus-visible:focus-ring"
};

export default function Button({ children, to, type = "button", variant = "primary", className = "", ...props }) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition duration-200 active:translate-y-px ${styles[variant]} ${className}`;

  if (to) {
    return (
      <MotionLink
        to={to}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.16 }}
        {...props}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.16 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
