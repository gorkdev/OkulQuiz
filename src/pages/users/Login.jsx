import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosClose } from "react-icons/io";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showGiraffe, setShowGiraffe] = useState(true);

  const navigate = useNavigate();

  const handleCloseGiraffe = () => {
    setShowGiraffe(false);
  };

  const formatPhoneNumber = (value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, "");

    // Eğer boşsa, boş döndür
    if (!numbers) return "";

    // Çift sıfır ile başlıyorsa, tek sıfıra düşür
    let formattedNumbers = numbers;
    if (formattedNumbers.startsWith("00")) {
      formattedNumbers = "0" + formattedNumbers.slice(2);
    }

    // Eğer 0 ile başlamıyorsa, başına 0 ekle
    if (formattedNumbers.length > 0 && !formattedNumbers.startsWith("0")) {
      formattedNumbers = "0" + formattedNumbers;
    }

    // Maksimum 11 karakter (0 + 10 rakam)
    formattedNumbers = formattedNumbers.slice(0, 11);

    // Format: 0XXX XXX XX XX
    if (formattedNumbers.length >= 4) {
      if (formattedNumbers.length >= 7) {
        if (formattedNumbers.length >= 9) {
          return `${formattedNumbers.slice(0, 4)} ${formattedNumbers.slice(
            4,
            7
          )} ${formattedNumbers.slice(7, 9)} ${formattedNumbers.slice(9)}`;
        } else {
          return `${formattedNumbers.slice(0, 4)} ${formattedNumbers.slice(
            4,
            7
          )} ${formattedNumbers.slice(7)}`;
        }
      } else {
        return `${formattedNumbers.slice(0, 4)} ${formattedNumbers.slice(4)}`;
      }
    }

    return formattedNumbers;
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    const currentNumbers = phoneNumber.replace(/\D/g, "");
    const newNumbers = inputValue.replace(/\D/g, "");

    // Eğer kullanıcı silme işlemi yapıyorsa (rakam sayısı azaldıysa)
    if (newNumbers.length < currentNumbers.length) {
      // Eğer tamamen silinmişse, boş string döndür
      if (!newNumbers) {
        setPhoneNumber("");
        return;
      }

      // Eğer sadece "0" kalmışsa, boş string döndür
      if (newNumbers === "0") {
        setPhoneNumber("");
        return;
      }

      // Silinen rakam sayısına göre formatla
      const formatted = formatPhoneNumber(newNumbers);
      setPhoneNumber(formatted);
    } else if (
      newNumbers.length === currentNumbers.length &&
      inputValue.length < phoneNumber.length
    ) {
      // Boşluk silindiğinde (rakam sayısı aynı ama toplam karakter azaldı)
      // Bir rakam daha sil
      const reducedNumbers = currentNumbers.slice(0, -1);

      if (!reducedNumbers || reducedNumbers === "0") {
        setPhoneNumber("");
        return;
      }

      const formatted = formatPhoneNumber(reducedNumbers);
      setPhoneNumber(formatted);
    } else {
      // Normal yazma işlemi
      const formatted = formatPhoneNumber(inputValue);
      setPhoneNumber(formatted);
    }
  };

  const handleLogin = () => {
    // Telefon numarası kontrolü
    const numbers = phoneNumber.replace(/\D/g, "");

    if (!numbers || numbers.length < 11) {
      toast.error("Lütfen geçerli bir telefon numarası giriniz!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Başarılı giriş mesajı
    toast.info("📱 SMS doğrulama özelliği yakında aktif olacak!", {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleGuestLogin = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-yellow-100 relative overflow-hidden">
      {/* Üst bulutlar - simetrik */}

      {/* Üst Bulut katmanı 1 */}
      <img
        src="/img/cloud.webp"
        alt="bulut"
        className="absolute top-0 left-0 w-full h-48 object-cover z-10 transform rotate-180"
        draggable={false}
      />

      {/* Üst Bulut katmanı 2 */}
      <img
        src="/img/cloud-2.webp"
        alt="bulut"
        className="absolute top-0 left-20 w-full h-40 object-cover z-11 opacity-90 transform rotate-180"
        draggable={false}
      />

      {/* Üst Bulut katmanı 3 */}
      <img
        src="/img/cloud.webp"
        alt="bulut"
        className="absolute top-0 right-10 w-full h-52 object-cover z-9 opacity-80 transform rotate-180"
        draggable={false}
      />

      {/* Üst Bulut katmanı 4 */}
      <img
        src="/img/cloud-2.webp"
        alt="bulut"
        className="absolute top-0 left-1/2 transform -translate-x-1/2 rotate-180 w-full h-44 object-cover z-12 opacity-85"
        draggable={false}
      />

      {/* Alt bulutlar - sabit konumda üst üste */}

      {/* Bulut katmanı 1 - en altta */}
      <img
        src="/img/cloud.webp"
        alt="bulut"
        className="absolute bottom-0 left-0 w-full h-48 object-cover z-10"
        draggable={false}
      />

      {/* Bulut katmanı 2 - üst üste */}
      <img
        src="/img/cloud-2.webp"
        alt="bulut"
        className="absolute bottom-0 left-20 w-full h-40 object-cover z-11 opacity-90"
        draggable={false}
      />

      {/* Bulut katmanı 3 - farklı pozisyonda */}
      <img
        src="/img/cloud.webp"
        alt="bulut"
        className="absolute bottom-0 right-10 w-full h-52 object-cover z-9 opacity-80"
        draggable={false}
      />

      {/* Bulut katmanı 4 - ortada */}
      <img
        src="/img/cloud-2.webp"
        alt="bulut"
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-44 object-cover z-12 opacity-85"
        draggable={false}
      />

      {/* Sade kabarcık efektleri */}
      <motion.div
        className="absolute w-3 h-3 bg-white/20 rounded-full"
        style={{ left: "15%", top: "25%" }}
        animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 4, delay: 0 }}
      />
      <motion.div
        className="absolute w-2 h-2 bg-white/25 rounded-full"
        style={{ right: "20%", top: "35%" }}
        animate={{ y: [0, -10, 0], opacity: [0.25, 0.6, 0.25] }}
        transition={{ repeat: Infinity, duration: 5, delay: 1 }}
      />
      <motion.div
        className="absolute w-4 h-4 bg-white/15 rounded-full"
        style={{ left: "25%", bottom: "30%" }}
        animate={{ y: [0, -20, 0], opacity: [0.15, 0.4, 0.15] }}
        transition={{ repeat: Infinity, duration: 3.5, delay: 2 }}
      />

      {/* Zürafa Karakter Animasyonu */}
      <AnimatePresence>
        {showGiraffe && (
          <motion.div
            className="fixed right-[-40px] sm:right-[-20px] md:right-0 top-[30%] sm:top-[35%] md:top-[40%] z-40"
            initial={{ x: 500, y: -100, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: 500, y: -100, opacity: 0 }}
            transition={{
              duration: 1.2,
              type: "spring",
              bounce: 0.4,
              delay: 0.5,
            }}
          >
            {/* Zürafa Container - Relative pozisyon - Birlikte hareket */}
            <motion.div
              className="relative md:right-[-140px] md:top-[-100px] xl:right-[-200px] xl:top-[-100px]"
              animate={{
                y: [0, -8, 0, -8, 0],
                rotate: [0, 1.5, 0, -1.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
                delay: 2,
              }}
            >
              {/* Zürafa Görseli - Daha büyük, çapraz pozisyon */}
              <motion.img
                src="/img/zurafa.png"
                alt="Zürafa Yayınevi Maskotu"
                className="w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[28rem] -rotate-12 h-auto object-contain"
                style={{
                  clipPath: "inset(0 0 0 20%)",
                  transform: "translateX(-10px)",
                }}
                draggable={false}
              />

              {/* Konuşma Balonu - Zürafanın içinde absolute pozisyon */}
              <motion.div
                className="absolute left-[-190px] sm:left-[-200px] md:left-[-240px] lg:left-[-240px] top-[20px] sm:top-[30px] md:top-[40px] lg:top-[50px] bg-white rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 shadow-xl border-2 border-yellow-200 min-w-[160px] sm:min-w-[200px] md:min-w-[240px] lg:min-w-[280px] max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[300px]"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  delay: 2,
                  duration: 0.6,
                  type: "spring",
                  bounce: 0.3,
                }}
              >
                {/* Balon Kuyruğu - Zürafaya doğru işaret eden */}
                <div
                  className="absolute right-[-6px] sm:right-[-8px] md:right-[-10px] top-[50%] transform -translate-y-1/2 w-0 h-0 
                     border-l-6 sm:border-l-8 md:border-l-10 
                     border-l-white 
                     border-t-4 sm:border-t-5 md:border-t-6 border-b-4 sm:border-b-5 md:border-b-6
                     border-t-transparent border-b-transparent"
                ></div>
                <div
                  className="absolute right-[-8px] sm:right-[-10px] md:right-[-12px] top-[50%] transform -translate-y-1/2 w-0 h-0 
                     border-l-6 sm:border-l-8 md:border-l-10 
                     border-l-yellow-200 
                     border-t-4 sm:border-t-5 md:border-t-6 border-b-4 sm:border-b-5 md:border-b-6
                     border-t-transparent border-b-transparent"
                ></div>

                <div className="text-center">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-orange-600 mb-1 sm:mb-1 md:mb-2">
                    🦒 Zürafa Yayınları
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700 mb-1">
                    Merhaba! MinikUP'a hoş geldin!
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">
                    Hazır mısın eğlenceye? ✨
                  </p>
                </div>

                {/* Kapatma butonu */}
                <motion.button
                  onClick={handleCloseGiraffe}
                  className="absolute -top-1 sm:-top-2 md:-top-3 -right-1 sm:-right-2 md:-right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 bg-red-400 hover:bg-red-500 text-white rounded-full text-xs sm:text-sm md:text-base flex items-center justify-center transition-colors shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoIosClose />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Phone Login Form */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
        className="relative z-30 w-full max-w-md mx-4"
      >
        {/* Ana form container - Yeni tasarım */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header kısmı - Sade beyaz tema */}
          <div className="bg-white px-8 py-8 text-center relative overflow-hidden border-b border-gray-100">
            {/* Subtle background shapes */}
            <div className="absolute inset-0">
              <div className="absolute top-4 left-6 w-16 h-16 bg-gray-100/50 rounded-full blur-xl"></div>
              <div className="absolute bottom-6 right-8 w-20 h-20 bg-blue-50/50 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gray-50/30 rounded-full blur-2xl"></div>
            </div>

            <motion.div
              className="relative z-10"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Hoş Geldiniz!
              </h1>
              <p className="text-gray-600 text-sm">
                Telefon numaranızla giriş yapın
              </p>
            </motion.div>
          </div>

          {/* Form kısmı - Minimize tasarım */}
          <div className="px-6 py-6 bg-gradient-to-b from-white to-gray-50/50">
            <form>
              {/* Telefon Numarası Input */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Telefon Numarası
                </label>
                <div className="relative">
                  {/* Türkiye Bayrağı ve +90 */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
                    <img
                      src="/img/turkey-flag.png"
                      alt="Türkiye"
                      className="w-5 h-4 object-cover rounded-sm"
                    />
                    <span className="text-gray-600 font-medium text-sm">
                      +90
                    </span>
                    <div className="w-px h-5 bg-gray-300"></div>
                  </div>

                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="w-full pl-20 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300 bg-white text-base font-medium placeholder-gray-400"
                    placeholder="5XX XXX XX XX"
                    maxLength="15"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-1">
                  SMS doğrulaması için kullanılacaktır.
                </p>
              </motion.div>

              {/* Buttons */}
              <div className="space-y-3 pt-6">
                <motion.button
                  type="button"
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Devam Et</span>
                    <span>→</span>
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 cursor-pointer text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Misafir Olarak Devam Et</span>
                    <span>👋</span>
                  </span>
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
