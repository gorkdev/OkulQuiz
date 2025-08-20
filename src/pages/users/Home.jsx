import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import KarYagdir from "../../components/KarYagdir";

const features = [
  {
    icon: "🧠",
    title: "Akıllı Öğrenme",
    desc: "Seviyene uygun sorularla zorlanmadan ilerle.",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    icon: "🏅",
    title: "Rozetler",
    desc: "Başarı rozetlerini topla ve arkadaşlarınla paylaş.",
    gradient: "from-yellow-50 to-amber-50",
  },
  {
    icon: "📈",
    title: "İlerleme",
    desc: "Günlük hedeflerini takip ederek motive kal.",
    gradient: "from-green-50 to-emerald-50",
  },
  {
    icon: "🎯",
    title: "Hedefler",
    desc: "Küçük hedefler belirle, büyük başarılar yakala.",
    gradient: "from-pink-50 to-rose-50",
  },
  {
    icon: "🧩",
    title: "Kategoriler",
    desc: "Farklı kategorilerle her gün yeni şeyler keşfet.",
    gradient: "from-violet-50 to-purple-50",
  },
  {
    icon: "⏱️",
    title: "Hızlı Quiz",
    desc: "5 dakikalık mini quizlerle pratik yap.",
    gradient: "from-orange-50 to-amber-50",
  },
];

const statCards = [
  {
    title: "Tamamlanan Quiz",
    value: 0,
    icon: "✅",
    hint: "Yeni quizlere göz at!",
    bg: "from-emerald-50 to-white",
    ring: "ring-emerald-200",
  },
  {
    title: "Toplam Puan",
    value: 0,
    icon: "⭐",
    hint: "Puan toplayıp rozet kazan!",
    bg: "from-amber-50 to-white",
    ring: "ring-amber-200",
  },
  {
    title: "Günlük Seri",
    value: 0,
    icon: "🔥",
    hint: "Her gün en az 1 quiz çöz!",
    bg: "from-rose-50 to-white",
    ring: "ring-rose-200",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path);
  };

  const handleKeyDown = (event, path) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate(path);
    }
  };

  const getInitials = (name) => {
    if (!name) return "M";
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "M";
    const first = parts[0][0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  };

  let userProfile = {
    name: "",
    className: "",
    levelName: "",
    schoolName: "",
    points: 0,
    streak: 0,
    avatarUrl: "",
  };
  let hasUserProfile = false;
  try {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const parsed = JSON.parse(stored);
      userProfile = {
        name: parsed.name || "",
        className: parsed.className || "",
        levelName: parsed.levelName || "",
        schoolName: parsed.schoolName || "",
        points: typeof parsed.points === "number" ? parsed.points : 0,
        streak: typeof parsed.streak === "number" ? parsed.streak : 0,
        avatarUrl: parsed.avatarUrl || "",
      };
      hasUserProfile = Boolean(userProfile.name);
    }
  } catch (_) {
    hasUserProfile = false;
  }

  return (
    <div className="w-full mx-auto flex flex-col gap-10">
      {/* Hero */}
      <KarYagdir />
      <motion.section
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 px-6 py-10 md:px-10"
        aria-label="Hoş geldin alanı"
      >
        {/* Floating Clouds */}
        <motion.img
          src="/img/cloud.webp"
          alt="Bulut"
          className="pointer-events-none select-none absolute -top-6 -left-10 w-32 opacity-70"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src="/img/cloud-2.webp"
          alt="Bulut"
          className="pointer-events-none select-none absolute top-6 right-6 w-40 opacity-60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
              Hoş geldin!
            </h1>
            <p className="mt-2 text-gray-600 text-base md:text-lg">
              MinikUP ile eğlenerek öğren, günlük hedeflerini yakala.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <button
                type="button"
                onClick={() => handleNavigate("/home/quiz")}
                onKeyDown={(e) => handleKeyDown(e, "/home/quiz")}
                tabIndex={0}
                aria-label="Quiz'e başla"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 transition"
              >
                Quiz'e Başla
              </button>
              <Link
                to="/home/profile"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold shadow-sm border border-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition"
              >
                Profilim
              </Link>
            </div>
          </div>

          {/* Hero Badge */}
          <motion.div
            className="w-full md:w-auto"
            whileHover={{ y: -6 }}
            whileTap={{ y: -2 }}
          >
            <div className="mx-auto md:mx-0 w-full sm:w-72 bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm border border-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl shadow">
                  🎒
                </div>
                <div>
                  <p className="text-xs text-gray-500">Öğrenci Modu</p>
                  <p className="text-sm font-semibold text-gray-800">
                    Hazırsan başlayalım!
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Günlük Hedef</span>
                  <span className="text-xs font-semibold text-blue-600">
                    0/5
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Profil ya da Tanıtım Alanı */}
      {hasUserProfile ? (
        <motion.section
          aria-label="Öğrenci profili"
          className="relative"
          whileHover={{ y: -8 }}
          whileTap={{ y: -2 }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>

            <div className="relative px-5 pb-5 pt-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={`${userProfile.name} profil fotoğrafı`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                ) : (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold select-none ring-4 ring-white shadow-md"
                    aria-label="Varsayılan profil görseli"
                  >
                    {getInitials(userProfile.name)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 tracking-tight truncate">
                        {userProfile.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                          Seviye: {userProfile.levelName}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                          Sınıf: {userProfile.className}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 truncate max-w-[240px]">
                          {userProfile.schoolName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        to="/home/profile"
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-300 transition"
                      >
                        Profili Gör
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                      <div className="text-[11px] font-semibold text-amber-700">
                        Puan
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-amber-800 flex items-center gap-1">
                        <span>⭐</span>
                        <span>{userProfile.points}</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
                      <div className="text-[11px] font-semibold text-rose-700">
                        Seri
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-rose-800 flex items-center gap-1">
                        <span>🔥</span>
                        <span>{userProfile.streak} gün</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 hidden sm:block">
                      <div className="text-[11px] font-semibold text-blue-700">
                        Seviye
                      </div>
                      <div className="mt-1 text-lg font-extrabold text-blue-800 flex items-center gap-1">
                        <span>🎓</span>
                        <span>{userProfile.levelName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          aria-label="Uygulama tanıtım alanı"
          className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          whileHover={{ y: -8 }}
          whileTap={{ y: -2 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.08),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.08),transparent_40%)]"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
                MinikUP ile eğlenerek öğrenmeye başla!
              </h2>
              <p className="mt-2 text-gray-600">
                Renkli quizler, rozetler ve günlük hedeflerle motive ol. Her gün
                sadece birkaç dakika ayırman yeterli!
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✔</span> Geniş kategori
                  havuzu ve seviye uyumlu sorular
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✔</span> Rozet ve puanlarla
                  ödüllendirme sistemi
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✔</span> Günlük seri
                  hedefleriyle düzenli öğrenme
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✔</span> Kişiselleştirilmiş
                  öneriler ve hedefler
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✔</span> Mobil uyumlu ve
                  erişilebilir modern arayüz
                </li>
              </ul>
            </div>
            <div className="w-full md:w-72 lg:w-80">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <img
                  src="/img/banner.webp"
                  alt="MinikUP tanıtım görseli"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Stat Cards */}
      <section
        aria-label="İstatistikler"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            className={`rounded-2xl p-5 bg-gradient-to-br ${card.bg} shadow-sm border border-gray-100 ring-1 ${card.ring}`}
            whileHover={{ y: -8 }}
            whileTap={{ y: -2 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow">
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.title}</p>
                <p className="text-xl font-extrabold text-gray-800">
                  {card.value}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">{card.hint}</p>
          </motion.div>
        ))}
      </section>

      {/* Quick Actions */}
      <section
        aria-label="Hızlı Erişim"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <motion.div
          role="button"
          tabIndex={0}
          aria-label="Quiz listesine git"
          onClick={() => handleNavigate("/home/quiz")}
          onKeyDown={(e) => handleKeyDown(e, "/home/quiz")}
          className="rounded-2xl p-6 bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer"
          whileHover={{ y: -8 }}
          whileTap={{ y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">
                Hemen Quiz Çöz
              </h3>
              <p className="text-sm text-white/90 mt-1">
                Yeni quizlerle kendini test et.
              </p>
            </div>
            <span className="text-3xl">🚀</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -8 }} whileTap={{ y: -2 }}>
          <Link
            to="/home/profile"
            className="rounded-2xl p-6 bg-white border border-gray-100 text-gray-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-200 cursor-pointer block"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">
                  Profilim
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Rozetlerini ve ilerlemeni görüntüle.
                </p>
              </div>
              <span className="text-3xl">👤</span>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section
        aria-label="Öne çıkan özellikler"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((item, idx) => (
          <motion.div
            key={item.title}
            className={`rounded-2xl p-6 bg-gradient-to-br ${item.gradient} shadow-sm border border-gray-100`}
            whileHover={{ y: -8 }}
            whileTap={{ y: -2 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl select-none">{item.icon}</span>
              <div>
                <h3 className="text-base font-extrabold text-gray-800 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Home;
