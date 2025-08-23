import React, { useEffect, useRef, useState } from "react";

const papajnominal = require("../assets/papaj.png");
const sadPapaj = require("../assets/papaj_sad.png");

export const BouncingPapaj = () => {
  const papaje = [papajnominal, sadPapaj];
  const containerRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [currentPapaj, setCurrentPapaj] = useState(0); // <- index obrazka
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const size = 200;


  // losowy start prędkości
  useEffect(() => {
    const randomSpeed = () =>
      (Math.random() * 3 + 1) * (Math.random() > 0.5 ? 1 : -1);
    velocityRef.current = {
      vx: randomSpeed(),
      vy: randomSpeed(),
    };
  }, []);

  useEffect(() => {
    let animationFrame: number;

    const move = () => {
      if (!containerRef.current) return;

      const { clientWidth, clientHeight } = containerRef.current;
      let { x, y } = pos;
      let { vx, vy } = velocityRef.current;

      let bounced = false; // flaga odbicia

      x += vx;
      y += vy;

      // odbicia w poziomie
      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
        bounced = true;
      } else if (x + size >= clientWidth) {
        x = clientWidth - size;
        vx = -Math.abs(vx);
        bounced = true;
      }

      // odbicia w pionie
      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
        bounced = true;
      } else if (y + size >= clientHeight) {
        y = clientHeight - size;
        vy = -Math.abs(vy);
        bounced = true;
      }

      velocityRef.current = { vx, vy };
      setPos({ x, y });

      // zmiana obrazka po odbiciu
      if (bounced) {
        setCurrentPapaj((prev) => (prev + 1) % papaje.length);
      }

      animationFrame = requestAnimationFrame(move);
    };

    animationFrame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationFrame);
  }, [pos]);

  return (
    <div
      ref={containerRef}
      className="position-absolute top-0 w-100 start-0 h-100"
      style={{ 
        pointerEvents: "none",     
      }
        
      }
    >
      <img
        src={papaje[currentPapaj]} // <- wybór aktualnego papaja
        alt="papaj"
        style={{
          zIndex: -1,
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: size,
          height: size,
          userSelect: "none",
          opacity: 0.9,
        }}
      />
    </div>
  );
};

