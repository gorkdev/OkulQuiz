import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    icon: "📝",
    title: "Quiz Çöz",
    desc: "Farklı kategorilerde eğlenceli sorularla kendini test et.",
    color: "bg-blue-50",
  },
  {
    icon: "🏅",
    title: "Başarılar",
    desc: "Kazandığın rozet ve başarıları takip et.",
    color: "bg-yellow-50",
  },
  {
    icon: "📊",
    title: "İlerleme",
    desc: "Çözdüğün quizlerle gelişimini izle.",
    color: "bg-green-50",
  },
];

const Home = () => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-10">
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 tracking-tight">
          Hoş Geldin!
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          MinikUP ile eğlenerek öğren, başarılarını takip et.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/home/quiz"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Quiz'e Başla
          </a>
          <a
            href="/profile"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Profilim
          </a>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            className={`rounded-xl ${item.color} p-6 flex flex-col items-center shadow-sm border border-gray-100`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
          >
            <span className="text-3xl mb-2 select-none">{item.icon}</span>
            <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">
              {item.title}
            </h3>
            <p className="text-gray-500 text-center text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
