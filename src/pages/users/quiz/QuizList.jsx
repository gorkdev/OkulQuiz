import React, { useEffect, useState } from "react";
import { getQuizzes } from "../../../services/firebase/quizService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const gradients = [
  "from-pink-400 to-pink-300",
  "from-blue-400 to-blue-300",
  "from-green-400 to-green-300",
  "from-yellow-400 to-yellow-300",
  "from-purple-400 to-purple-300",
  "from-orange-400 to-orange-300",
];

const getInitial = (name) => (name ? name[0].toUpperCase() : "Q");

const icons = ["🎲", "🦒", "🦄", "🎨", "🚀", "🧩", "📚", "🎯", "🧸", "🦊"];

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getQuizzes().then((data) => {
      setQuizzes(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Yükleniyor...</div>;
  }

  if (!quizzes.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        Hiç quiz bulunamadı.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h2
        className="text-3xl font-extrabold text-pink-500 mb-10 text-center tracking-tight"
        style={{ fontFamily: "Fredoka, Comic Sans, sans-serif" }}
      >
        Quizler
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {quizzes.map((quiz, idx) => {
          const gradient = gradients[idx % gradients.length];
          const icon = icons[idx % icons.length];
          return (
            <motion.button
              key={quiz.id}
              onClick={() => navigate(`/home/quiz/${quiz.id}`)}
              className={`w-full rounded-3xl p-7 shadow-xl border-0 flex flex-col items-center justify-center text-center group focus:outline-none bg-gradient-to-br ${gradient} relative overflow-hidden`}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              whileHover={{ scale: 1.06, rotate: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Badge/İkon */}
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl font-extrabold mb-4 shadow-lg border-4 border-white bg-white/70"
                style={{ color: "#fff", background: "rgba(255,255,255,0.7)" }}
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {icon}
              </motion.div>
              {/* Başlık */}
              <div
                className="text-2xl font-extrabold text-white mb-2 drop-shadow-lg"
                style={{ fontFamily: "Fredoka, Comic Sans, sans-serif" }}
              >
                {quiz.quizName || quiz.title || "Quiz"}
              </div>
              {/* Soru adeti */}
              <div className="text-lg font-bold text-white/80 mb-1 drop-shadow">
                Soru adeti: {quiz.soruAdeti || quiz.questionCount || "-"}
              </div>
              {/* Açıklama */}
              {quiz.description && (
                <div className="text-white/80 text-sm mt-1 drop-shadow-sm">
                  {quiz.description}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizList;
