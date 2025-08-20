import React, { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";

const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
};

const ConfettiPatlat = () => {
  const { width, height } = useWindowSize();
  const [pieces, setPieces] = useState(10000); // daha fazla parça

  useEffect(() => {
    let duration = 5000; // toplam süre (ms)
    let interval = 200; // her 200ms'de bir azalt
    let steps = duration / interval;
    let decrement = 10000 / steps; // her adımda azalacak miktar

    const timer = setInterval(() => {
      setPieces((prev) => Math.max(0, prev - decrement));
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999, // en üstte
        pointerEvents: "none", // tıklamaları engellemesin
      }}
    >
      <ReactConfetti
        width={width}
        height={height}
        numberOfPieces={Math.round(pieces)}
        gravity={0.25}
        recycle={false}
        confettiSource={{
          x: 0,
          y: 0,
          w: width, // tüm genişlikten başlasın
          h: 0,
        }}
      />
    </div>
  );
};

export default ConfettiPatlat;
