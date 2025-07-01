import React from "react";
import { motion } from "framer-motion";

const Loader = ({ className = "h-64" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        {/* Arka plan halkası */}
        <div className="w-12 h-12 rounded-full border-4 border-gray-100"></div>

        {/* Dönen halka */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            ease: "linear",
            repeat: Infinity,
          }}
        ></motion.div>

        {/* İç nokta */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Loader;
