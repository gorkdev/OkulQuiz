import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import KarYagdir from "../../components/KarYagdir";

const Profile = () => {
  const navigate = useNavigate();

  const userProfile = useMemo(() => {
    try {
      const stored = localStorage.getItem("userProfile");
      if (!stored) {
        return {
          name: "Misafir Öğrenci",
          className: "",
          levelName: "",
          schoolName: "",
          points: 0,
          streak: 0,
          avatarUrl: "",
        };
      }
      const parsed = JSON.parse(stored);
      return {
        name: parsed.name || "Misafir Öğrenci",
        className: parsed.className || "",
        levelName: parsed.levelName || "",
        schoolName: parsed.schoolName || "",
        points: typeof parsed.points === "number" ? parsed.points : 0,
        streak: typeof parsed.streak === "number" ? parsed.streak : 0,
        avatarUrl: parsed.avatarUrl || "",
      };
    } catch (_) {
      return {
        name: "Misafir Öğrenci",
        className: "",
        levelName: "",
        schoolName: "",
        points: 0,
        streak: 0,
        avatarUrl: "",
      };
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return "M";
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "M";
    const first = parts[0][0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  };

  const handleKeyDown = (event, action) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  const progressDaily = 0; // İleride gerçek veriye bağlanabilir
  const progressWeekly = 0;

  return (
    <div className="">
      {/* Kahraman Alanı */}
      <motion.section
        className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 shadow-sm"
        aria-label="Profil başlık alanı"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <img
          src="/img/banner-2.webp"
          alt="Renkli arka plan"
          className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-20"
        />
        {/* Yüzen bulutlar */}
        <motion.img
          src="/img/cloud.webp"
          alt="Bulut"
          className="pointer-events-none select-none absolute -top-8 -left-10 w-40 opacity-70"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src="/img/cloud-2.webp"
          alt="Bulut"
          className="pointer-events-none select-none absolute top-6 right-6 w-48 opacity-60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={`${userProfile.name} profil fotoğrafı`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white shadow-md"
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold select-none ring-4 ring-white shadow-md"
                aria-label="Varsayılan profil görseli"
              >
                {getInitials(userProfile.name)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight truncate">
                    {userProfile.name}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/70 backdrop-blur text-gray-700 border border-gray-200">
                      Seviye: {userProfile.levelName || "-"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/70 backdrop-blur text-gray-700 border border-gray-200">
                      Sınıf: {userProfile.className || "-"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/70 backdrop-blur text-gray-700 border border-gray-200 truncate max-w-[240px]">
                      {userProfile.schoolName || "Okul Bilgisi Yok"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <motion.button
                    type="button"
                    onClick={() => navigate("/home")}
                    onKeyDown={(e) => handleKeyDown(e, () => navigate("/home"))}
                    tabIndex={0}
                    aria-label="Ana sayfaya dön"
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-300 transition"
                    whileTap={{ scale: 0.98 }}
                  >
                    Quizlere Dön
                  </motion.button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                  <div className="text-[11px] font-semibold text-amber-700">
                    Puan
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-amber-800 flex items-center gap-1">
                    <span>⭐</span>
                    <span>{userProfile.points}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3">
                  <div className="text-[11px] font-semibold text-rose-700">
                    Seri
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-rose-800 flex items-center gap-1">
                    <span>🔥</span>
                    <span>{userProfile.streak} gün</span>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 hidden sm:block">
                  <div className="text-[11px] font-semibold text-blue-700">
                    Seviye
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-blue-800 flex items-center gap-1">
                    <span>🎓</span>
                    <span>{userProfile.levelName || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* İlerleme ve Rozetler */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.section
          className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white/90 backdrop-blur p-5 shadow-sm"
          aria-label="İlerleme grafikleri"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-base font-extrabold text-gray-800">İlerleme</h2>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Günlük Hedef</span>
                <span>{progressDaily}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressDaily}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                ></motion.div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Haftalık Hedef</span>
                <span>{progressWeekly}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWeekly}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    delay: 0.1,
                  }}
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Aylık Hedef</span>
                <span>{progressWeekly}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWeekly}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    delay: 0.1,
                  }}
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Yıllık Hedef</span>
                <span>{progressWeekly}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWeekly}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    delay: 0.1,
                  }}
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="rounded-2xl border border-gray-100 bg-white/90 backdrop-blur p-5 shadow-sm"
          aria-label="Rozetler"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-800">Rozetler</h2>
            <span className="text-xs text-gray-500">Yakında daha fazlası</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {["🏅", "📚", "⚡", "🧠", "🎯", "🚀", "🎨", "🎓"].map((icon, i) => (
              <motion.div
                key={i}
                className="aspect-square rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center text-2xl shadow-sm"
                whileHover={{ scale: 1.06, rotate: 1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <span aria-hidden>{icon}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Son Etkinlikler ve Favoriler */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.section
          className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white/90 backdrop-blur p-5 shadow-sm"
          aria-label="Son çözülen quizler"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-800">
              Son Quizler
            </h2>
            <span className="text-xs text-gray-500">Örnek liste</span>
          </div>
          <div className="mt-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center gap-3"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <img
                  src={i % 2 === 0 ? "/img/banner.webp" : "/img/banner-2.webp"}
                  alt="Quiz görseli"
                  className="w-14 h-14 rounded-lg object-cover border border-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    Eğlenceli Quiz {i}
                  </p>
                  <p className="text-xs text-gray-600">
                    Puan: {Math.max(10 - i, 5)} / 10
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/home/quiz")}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => navigate("/home/quiz"))
                  }
                  tabIndex={0}
                  aria-label="Quiz listesine git"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Git
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="rounded-2xl border border-gray-100 bg-white/90 backdrop-blur p-5 shadow-sm"
          aria-label="Favori kategoriler"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-base font-extrabold text-gray-800">Favoriler</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {["Matematik", "Fen", "Türkçe", "Sosyal"].map((cat, i) => (
              <motion.div
                key={cat}
                role="button"
                tabIndex={0}
                aria-label={`${cat} kategorisindeki quizleri gör`}
                onClick={() => navigate("/home/quiz")}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => navigate("/home/quiz"))
                }
                className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 220, damping: 16 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg select-none">
                    {["➗", "🧪", "🔤", "🗺️"][i]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{cat}</p>
                    <p className="text-[11px] text-gray-600">
                      Önerilen quizler
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Profile;
