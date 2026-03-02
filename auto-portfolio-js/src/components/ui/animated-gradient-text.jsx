'use client';
import { motion } from "framer-motion";

export const AnimatedGradientText = ({ children, className = "" }) => {
  return (
    <motion.span
      className={`inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.span>
  );
};
