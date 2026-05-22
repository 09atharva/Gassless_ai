import { useState, useRef, useCallback } from 'react';

/**
 * useTilt — 3D holographic card tilt effect with cursor-tracking glare.
 *
 * Returns:
 *  - style: CSS transform for perspective tilt
 *  - glareStyle: CSS for the cursor-following radial glow overlay
 *  - onMouseMove / onMouseLeave: handlers to attach to the card
 *
 * Matches the stitch prototype's holographic card behavior:
 * - Up to `maxRotation` degrees of tilt
 * - Scale bump to 1.02 on hover
 * - Radial glare highlight that follows the cursor
 */
export function useTilt(maxRotation = 5) {
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
  });
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'none',
    });

    // Glare follows cursor position
    setGlareStyle({
      opacity: 1,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15), transparent 60%)`,
    });
  }, [maxRotation]);

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
    });
    setGlareStyle({ opacity: 0 });
  }, []);

  return { style, glareStyle, onMouseMove, onMouseLeave };
}
