import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  size: number;
}

const PARTICLE_COUNT = 50;
const ATTRACTION_RADIUS = 400;
const ATTRACTION_STRENGTH = 0.25;
const REPULSION_RADIUS = 300;
const REPULSION_STRENGTH = 10;
const RETURN_STRENGTH = 0.02; // Reduced to prevent overshooting and high speed movement

const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const clickTime = useRef(0);
  const mouseLeaveTime = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      return {
        id: i,
        x,
        y,
        homeX: x,
        homeY: y,
        vx: 0,
        vy: 0,
        size: 2 + Math.random() * 4,
      };
    });
    setParticles(initialParticles);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mousePos.current = { x: -1000, y: -1000 };
      mouseLeaveTime.current = Date.now();
      // Force immediate return to home positions when mouse leaves window
      clickTime.current = 0; // Reset click time to stop repulsion
    };

    const handleMouseDown = () => {
      clickTime.current = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      const timeSinceClick = Date.now() - clickTime.current;
      const timeSinceMouseLeave = Date.now() - mouseLeaveTime.current;
      const isRepelling = timeSinceClick < 150; // Repel for 150ms after click

      setParticles((prev) =>
        prev.map((particle) => {
          let { x, y, vx, vy } = particle;

          const dx = mousePos.current.x - x;
          const dy = mousePos.current.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Check if mouse is far away (mouse left the screen or is at default position)
          const isMouseFarAway = mousePos.current.x === -1000 && mousePos.current.y === -1000;
          const isMouseOutsideRadius = distance > ATTRACTION_RADIUS;
          const shouldReturnHome = (isMouseFarAway || isMouseOutsideRadius) && timeSinceMouseLeave > 100; // Wait 100ms before returning

          if (shouldReturnHome) {
            // Return to home position when cursor is far away or left the screen
            const homeDx = particle.homeX - x;
            const homeDy = particle.homeY - y;
            vx += homeDx * RETURN_STRENGTH;
            vy += homeDy * RETURN_STRENGTH;
          } else if (distance > 0) {
            if (isRepelling && distance < REPULSION_RADIUS) {
              // Repel on click
              const force = (REPULSION_RADIUS - distance) / REPULSION_RADIUS;
              vx -= (dx / distance) * force * REPULSION_STRENGTH;
              vy -= (dy / distance) * force * REPULSION_STRENGTH;
            } else if (distance < ATTRACTION_RADIUS) {
              // Attract to cursor like a magnet
              const force = (ATTRACTION_RADIUS - distance) / ATTRACTION_RADIUS;
              vx += (dx / distance) * force * ATTRACTION_STRENGTH;
              vy += (dy / distance) * force * ATTRACTION_STRENGTH;
            }
          }

          // Apply much stronger friction when returning home to stop movement faster
          const isReturningHome = shouldReturnHome;
          const friction = isReturningHome ? 0.92 : 0.94;
          vx *= friction;
          vy *= friction;

          // Update position
          x += vx;
          y += vy;

          // Snap to home position when very close and velocity is low (prevents endless micro-movements)
          if (isReturningHome) {
            const homeDx = particle.homeX - x;
            const homeDy = particle.homeY - y;
            const homeDistance = Math.sqrt(homeDx * homeDx + homeDy * homeDy);
            const speed = Math.sqrt(vx * vx + vy * vy);
            
            if (homeDistance < 3 && speed < 1.0) {
              // Snap to exact home position and stop movement completely
              x = particle.homeX;
              y = particle.homeY;
              vx = 0;
              vy = 0;
            }
          }

          // Soft bounds - wrap around edges
          if (x < -20) x = window.innerWidth + 20;
          if (x > window.innerWidth + 20) x = -20;
          if (y < -20) y = window.innerHeight + 20;
          if (y > window.innerHeight + 20) y = -20;

          return { ...particle, x, y, vx, vy };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-foreground"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: 0.7,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
