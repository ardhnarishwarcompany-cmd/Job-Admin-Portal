import React, { useEffect, useRef } from "react";

const CustomCursor = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const pointer = { x: -100, y: -100 };
    const history = [];
    const maxHistory = 24; // Length of the spiral trail
    let lastMoveTime = Date.now();

    const handleMouseMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      lastMoveTime = Date.now();
    };
    window.addEventListener("mousemove", handleMouseMove);

    let angle = 0;
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Save cursor history
      history.push({ x: pointer.x, y: pointer.y });
      if (history.length > maxHistory) {
        history.shift();
      }

      if (history.length > 1) {
        // Calculate fade factor when idle (stop moving)
        const timeSinceMove = Date.now() - lastMoveTime;
        let fadeFactor = 1;
        if (timeSinceMove > 100) {
          // Fade out smoothly over 800ms
          fadeFactor = Math.max(0, 1 - (timeSinceMove - 100) / 800);
        }

        if (fadeFactor > 0) {
          ctx.beginPath();

          // Create linear gradient based on the trail position
          const isDark = document.documentElement.classList.contains("dark");
          const gradient = ctx.createLinearGradient(
            history[0].x,
            history[0].y,
            pointer.x,
            pointer.y
          );

          if (isDark) {
            gradient.addColorStop(0, "rgba(34, 211, 238, 0)"); // Fade out trail
            gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.45 * fadeFactor})`); // Neon Purple mid
            gradient.addColorStop(1, `rgba(34, 211, 238, ${0.95 * fadeFactor})`); // Neon Cyan pointer
          } else {
            gradient.addColorStop(0, "rgba(37, 99, 235, 0)"); // Fade out trail
            gradient.addColorStop(0.5, `rgba(79, 70, 229, ${0.45 * fadeFactor})`); // Indigo mid
            gradient.addColorStop(1, `rgba(37, 99, 235, ${0.95 * fadeFactor})`); // Blue pointer
          }

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 4.5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          angle += 0.2; // Speed of rotation

          for (let i = 0; i < history.length; i++) {
            const pt = history[i];
            const ratio = i / (history.length - 1);
            // Radius collapses as it reaches the current cursor tip & when idle
            const radius = (1 - ratio) * 14 * fadeFactor; 
            const theta = angle + i * 0.35; // Mathematical spiral wave multiplier

            const xOffset = Math.cos(theta) * radius;
            const yOffset = Math.sin(theta) * radius;

            if (i === 0) {
              ctx.moveTo(pt.x + xOffset, pt.y + yOffset);
            } else {
              ctx.lineTo(pt.x + xOffset, pt.y + yOffset);
            }
          }
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-full w-full hidden md:block"
    />
  );
};

export default CustomCursor;