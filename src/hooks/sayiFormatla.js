/**
 * Sayı formatlama fonksiyonu
 * Verilen sayıyı 3 basamakta bir nokta olacak şekilde formatlar
 * @param {number|string} sayi - Formatlanacak sayı
 * @returns {string} Formatlanmış sayı
 *
 * @example
 * sayiFormatla(15221) // "15.221"
 * sayiFormatla(1234567) // "1.234.567"
 * sayiFormatla(1000) // "1.000"
 * sayiFormatla(123) // "123"
 */
export const sayiFormatla = (sayi) => {
  // Sayı değilse veya null/undefined ise boş string döndür
  if (sayi === null || sayi === undefined || sayi === "") {
    return "";
  }

  // String'i number'a çevir
  const numara = Number(sayi);

  // Geçerli bir sayı değilse orijinal değeri döndür
  if (isNaN(numara)) {
    return String(sayi);
  }

  // Sayıyı string'e çevir ve nokta ekle
  return numara.toLocaleString("tr-TR");
};

/**
 * Alternatif implementasyon - Manuel nokta ekleme
 * @param {number|string} sayi - Formatlanacak sayı
 * @returns {string} Formatlanmış sayı
 */
export const sayiFormatlaManuel = (sayi) => {
  // Sayı değilse veya null/undefined ise boş string döndür
  if (sayi === null || sayi === undefined || sayi === "") {
    return "";
  }

  // String'i number'a çevir
  const numara = Number(sayi);

  // Geçerli bir sayı değilse orijinal değeri döndür
  if (isNaN(numara)) {
    return String(sayi);
  }

  // Sayıyı string'e çevir
  const sayiStr = Math.abs(numara).toString();

  // Nokta ekleme işlemi
  let formatlanmis = "";
  for (let i = 0; i < sayiStr.length; i++) {
    // Her 3 basamakta bir nokta ekle (sondan başlayarak)
    if (i > 0 && (sayiStr.length - i) % 3 === 0) {
      formatlanmis += ".";
    }
    formatlanmis += sayiStr[i];
  }

  // Negatif sayı ise başına - ekle
  return numara < 0 ? `-${formatlanmis}` : formatlanmis;
};

export default sayiFormatla;
