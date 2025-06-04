import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const waveVariants = {
  animate: {
    y: [0, 10, 0],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut",
    },
  },
};

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="relative h-full flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Dalgalı arka plan */}
      <motion.div
        className="absolute top-0 left-0 w-full h-64   blur-2xl z-0"
        variants={waveVariants}
        animate="animate"
        style={{
          borderBottomLeftRadius: "50% 20%",
          borderBottomRightRadius: "50% 20%",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96  opacity-40 blur-3xl z-0"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2 }}
        style={{ borderTopLeftRadius: "60% 40%" }}
      />
      {/* 404 ve emoji */}
      <motion.div
        initial={{ scale: 0.7, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 8 }}
        className="z-10 flex flex-col items-center"
      >
        <span className="text-7xl md:text-9xl font-extrabold text-blue-500 drop-shadow-lg flex items-center gap-4">
          4
          <motion.span
            initial={{ rotate: -20 }}
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block"
            aria-label="confused face"
          >
            😕
          </motion.span>
          4
        </span>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 mt-4"
        >
          Sayfa Bulunamadı
        </motion.p>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-500 mb-8 text-center max-w-md"
        >
          Üzgünüz, aradığınız sayfa mevcut değil veya adresi yanlış yazılmış
          olabilir.
        </motion.p>
        <motion.button
          whileHover={{
            scale: 1.08,
            backgroundColor: "#2563eb",
            color: "#fff",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/admin")}
          className="px-7 py-3 cursor-pointer rounded-lg bg-blue-500 text-white font-semibold shadow-lg hover:bg-blue-600 transition-colors z-10"
        >
          Ana Sayfaya Dön
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
