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

const KarYagdir = () => {
  const { width, height } = useWindowSize();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <ReactConfetti
        width={width}
        height={height}
        numberOfPieces={100} // sürekli kar yağıyormuş gibi görünmesi için ideal
        gravity={0.05}
        wind={0.002}
        recycle={true} // sürekli tekrar etsin
        colors={["#AEE1FF", "#FFFFFF", "#E6F7FF"]}
        drawShape={(ctx) => {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 8); // her kolun uzunluğu
            ctx.rotate(Math.PI / 3); // 60° döndür
          }
          ctx.strokeStyle = "#AEE1FF"; // beyaz kar tanesi
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.closePath();
        }}
        confettiSource={{
          x: 0,
          y: 0,
          w: width,
          h: 0,
        }}
      />
    </div>
  );
};

export default KarYagdir;
