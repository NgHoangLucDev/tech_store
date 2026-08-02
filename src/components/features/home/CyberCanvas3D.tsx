'use client';

import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
}

export const CyberCanvas3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useSettingsStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Particle[] = [];
    const particleCount = 80;
    const fov = 350; // Field of view (perspective factor)
    const centerX = width / 2;
    const centerY = height / 2;

    // Mouse coordinates in 3D space
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, radius: 150 };

    // Auto rotate angles
    let angleX = 0.0005;
    let angleY = 0.0008;

    // Initialize particles in a 3D sphere/box shape
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 250 + 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      // Spherical coordinates converted to Cartesian
      const px = radius * Math.sin(phi) * Math.cos(theta);
      const py = radius * Math.sin(phi) * Math.sin(theta);
      const pz = radius * Math.cos(phi);

      particles.push({
        x: px,
        y: py,
        z: pz,
        baseX: px,
        baseY: py,
        baseZ: pz,
        color: `hsl(${210 + Math.random() * 40}, 85%, ${theme === 'dark' ? '60%' : '50%'})`,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Center the mouse coordinate around center of canvas
      mouse.targetX = e.clientX - rect.left - centerX;
      mouse.targetY = e.clientY - rect.top - centerY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse movement
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Projected coordinates storage for drawing lines
      const projected: { x: number; y: number; z: number; scale: number; color: string }[] = [];

      // Update and rotate particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Rotate around X axis
        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;

        // 2. Rotate around Y axis
        let x2 = p.x * cosY - z1 * sinY;
        let z2 = p.x * sinY + z1 * cosY;

        p.x = x2;
        p.y = y1;
        p.z = z2;

        // 3. Mouse influence (subtle pulling effect based on Z distance)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        } else {
          // Slowly drift back to base orbital distance
          p.x += (p.baseX - p.x) * 0.01;
          p.y += (p.baseY - p.y) * 0.01;
        }

        // 4. Perspective projection
        // Shift Z so it's always in front of the camera
        const depth = fov + p.z;
        if (depth > 0) {
          const scale = fov / depth;
          const projX = centerX + p.x * scale;
          const projY = centerY + p.y * scale;

          projected.push({
            x: projX,
            y: projY,
            z: p.z,
            scale: scale,
            color: p.color,
          });

          // Draw the node
          ctx.beginPath();
          const dotSize = Math.max(0.5, scale * (theme === 'dark' ? 1.5 : 1));
          ctx.arc(projX, projY, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = theme === 'dark' 
            ? `rgba(59, 130, 246, ${Math.min(1, scale * 0.7)})` 
            : `rgba(0, 86, 179, ${Math.min(0.5, scale * 0.4)})`;
          ctx.fill();

          // Subtle outer glow for particles in dark theme
          if (theme === 'dark' && scale > 1) {
            ctx.beginPath();
            ctx.arc(projX, projY, dotSize * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(139, 92, 246, ${Math.min(0.2, (scale - 1) * 0.2)})`;
            ctx.fill();
          }
        }
      }

      // Draw constellation grid lines
      ctx.lineWidth = theme === 'dark' ? 0.4 : 0.2;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          // Compute 2D screen distance
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist2D = Math.sqrt(dx * dx + dy * dy);

          // Only connect if screen distance is small
          if (dist2D < 110) {
            // Transparency based on distance and depth (smaller scale = further away = dimmer)
            const depthFactor = (p1.scale + p2.scale) / 2;
            const alpha = (1 - dist2D / 110) * 0.25 * Math.min(1.2, depthFactor);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            if (theme === 'dark') {
              ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            } else {
              ctx.strokeStyle = `rgba(0, 86, 179, ${alpha * 0.6})`;
            }
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40 md:opacity-75 transition-opacity"
    />
  );
};
