import React, { useEffect, useRef } from "react";

// Detect mobile once — canvas is completely disabled on mobile to prevent
// the #1 cause of iOS scroll white-flash: fixed-position canvas compositing
const isMobileDevice =
  typeof window !== "undefined" && window.innerWidth < 768;

export default function V4ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // On mobile: canvas is not rendered, nothing to set up
    if (isMobileDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const frameInterval = 0; // Desktop: full 60fps
    let previousFrameTime = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse / Touch position
    const pointer = {
      x: width / 2,
      y: height / 2,
      radius: 120,
      active: false,
    };

    const handlePointerMove = (e) => {
      pointer.active = true;
      if ("touches" in e && e.touches.length > 0) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
      } else if ("clientX" in e) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
      }
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave);

    // Particle pool — desktop only
    const particleCount = Math.min(
      Math.floor((width * height) / 18000),
      65,
    );
    const particles = [];

    const colors = ["#8b5cf6", "#a78bfa", "#06b6d4", "#ec4899", "#3b82f6"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    // Animation Loop
    const render = (time) => {
      if (frameInterval && time - previousFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      const frameScale = previousFrameTime
        ? Math.min((time - previousFrameTime) / (1000 / 60), 2)
        : 1;
      previousFrameTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * frameScale;
        p.y += p.vy * frameScale;

        // Bounce on edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interactive push/pull from pointer
        if (pointer.active) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pointer.radius && dist > 0) {
            const force = (1 - dist / pointer.radius) * 1.5 * frameScale;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Mobile: no canvas at all — eliminates the fixed-position repaint cost
  if (isMobileDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas fixed inset-0 pointer-events-none z-0 opacity-60"
      style={{ touchAction: "none" }}
    />
  );
}

