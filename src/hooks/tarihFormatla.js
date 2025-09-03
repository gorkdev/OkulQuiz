// Türkçe tarih formatlama hook'u
export const tarihFormatla = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Türkçe ay isimleri
  const aylar = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  const gun = date.getDate();
  const ay = aylar[date.getMonth()];
  const yil = date.getFullYear();
  const saat = date.getHours().toString().padStart(2, "0");
  const dakika = date.getMinutes().toString().padStart(2, "0");

  return `${gun} ${ay} ${yil}, ${saat}:${dakika}`;
};
