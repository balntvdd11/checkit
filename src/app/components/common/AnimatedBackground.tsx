import React, { useEffect, useRef } from "react";
import "../../../styles/AnimatedBackground.css";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function AnimatedBackground(): JSX.Element {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const targetOffset = useRef({ x: 0, y: 0 });
  const pointerRaw = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const currentOffsetVel = useRef({ x: 0, y: 0 });
  const currentScale = useRef({ x: 1, y: 1 });
  const centerPoint = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const logo = document.querySelector<HTMLImageElement>("img[alt='CheckIT logo']");

    const updateCenter = () => {
      if (logo) {
        const rect = logo.getBoundingClientRect();
        centerPoint.current.x = rect.left + rect.width / 2;
        centerPoint.current.y = rect.top + rect.height / 2;
        if (glowRef.current) {
          const base = Math.max(rect.width, rect.height);
          const rimScale = 2.8;
          const coreScale = 2.2;
          const haloScale = 1.8;
          const bloomScale = 1.4;

          const rimBlur = Math.round(base * 0.9);
          const coreBlur = Math.round(base * 0.6);
          const haloBlur = Math.round(base * 0.35);
          const bloomBlur = Math.round(base * 0.18);

          glowRef.current.style.setProperty('--rim-w', `${Math.round(base * rimScale)}px`);
          glowRef.current.style.setProperty('--rim-h', `${Math.round(base * rimScale)}px`);
          glowRef.current.style.setProperty('--core-w', `${Math.round(base * coreScale)}px`);
          glowRef.current.style.setProperty('--core-h', `${Math.round(base * coreScale)}px`);
          glowRef.current.style.setProperty('--halo-w', `${Math.round(base * haloScale)}px`);
          glowRef.current.style.setProperty('--halo-h', `${Math.round(base * haloScale)}px`);
          glowRef.current.style.setProperty('--bloom-w', `${Math.round(base * bloomScale)}px`);
          glowRef.current.style.setProperty('--bloom-h', `${Math.round(base * bloomScale)}px`);

          glowRef.current.style.setProperty('--rim-blur', `${rimBlur}px`);
          glowRef.current.style.setProperty('--core-blur', `${coreBlur}px`);
          glowRef.current.style.setProperty('--halo-blur', `${haloBlur}px`);
          glowRef.current.style.setProperty('--bloom-blur', `${bloomBlur}px`);

          glowRef.current.style.setProperty('--rim-opacity', `0.04`);
          glowRef.current.style.setProperty('--core-opacity', `0.08`);
          glowRef.current.style.setProperty('--halo-opacity', `0.12`);
          glowRef.current.style.setProperty('--bloom-opacity', `0.18`);
        }
      } else {
        centerPoint.current.x = window.innerWidth * 0.5;
        centerPoint.current.y = window.innerHeight * 0.5;
      }

      if (glowRef.current) {
        glowRef.current.style.left = `${centerPoint.current.x}px`;
        glowRef.current.style.top = `${centerPoint.current.y}px`;
      }
    };

    updateCenter();

    const onResize = () => updateCenter();
    const onLogoLoad = () => updateCenter();

    if (logo && !logo.complete) {
      logo.addEventListener("load", onLogoLoad);
    }

    const pointerMax = 20;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tick = () => {
      if (mediaQuery.matches) return; // Completely disable loop on low-end/reduced-motion

      const t = performance.now();
      const idleX = Math.sin((t / 18000) * Math.PI * 2) * 6;
      const idleY = Math.cos((t / 22000) * Math.PI * 2) * 5;
      const idleScale = 1 + Math.sin((t / 24000) * Math.PI * 2) * 0.01;

      const rx = pointerRaw.current.x;
      const ry = pointerRaw.current.y;
      const rawDist = Math.sqrt(rx * rx + ry * ry);
      const repelRange = 120;
      const proximity = clamp((repelRange - rawDist) / repelRange, 0, 1);

      const maxRepel = 26;
      const repelMag = proximity * maxRepel;
      const nx = rawDist > 0 ? -(rx / rawDist) : 0;
      const ny = rawDist > 0 ? -(ry / rawDist) : 0;
      const repelX = nx * repelMag;
      const repelY = ny * repelMag;

      const desiredX = idleX + repelX;
      const desiredY = idleY + repelY;

      const squishDist = Math.sqrt(targetOffset.current.x ** 2 + targetOffset.current.y ** 2);
      const strength = clamp(squishDist / pointerMax, 0, 1);
      const angle = Math.atan2(targetOffset.current.y, targetOffset.current.x);

      const maxStretch = 0.10;
      const maxCompress = 0.06;
      const stretchAmount = 1 + strength * maxStretch;
      const compressAmount = 1 - strength * maxCompress;

      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      const desiredScaleX = idleScale * (
        1 + (stretchAmount - 1) * Math.abs(dirX) - (1 - compressAmount) * Math.abs(dirY)
      );
      const desiredScaleY = idleScale * (
        1 + (stretchAmount - 1) * Math.abs(dirY) - (1 - compressAmount) * Math.abs(dirX)
      );

      const stiffness = 0.12;
      const damping = 0.82;

      currentOffsetVel.current.x += (desiredX - currentOffset.current.x) * stiffness;
      currentOffsetVel.current.y += (desiredY - currentOffset.current.y) * stiffness;

      currentOffsetVel.current.x *= damping;
      currentOffsetVel.current.y *= damping;

      currentOffset.current.x += currentOffsetVel.current.x;
      currentOffset.current.y += currentOffsetVel.current.y;
      currentScale.current.x += (desiredScaleX - currentScale.current.x) * 0.08;
      currentScale.current.y += (desiredScaleY - currentScale.current.y) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(-50%, -50%) translate3d(${currentOffset.current.x}px, ${currentOffset.current.y}px, 0) scale3d(${currentScale.current.x}, ${currentScale.current.y}, 1)`;
      }

      raf.current = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (mediaQuery.matches) return;
      const rawX = event.clientX - centerPoint.current.x;
      const rawY = event.clientY - centerPoint.current.y;
      pointerRaw.current.x = rawX;
      pointerRaw.current.y = rawY;
      targetOffset.current.x = clamp(rawX, -pointerMax, pointerMax);
      targetOffset.current.y = clamp(rawY, -pointerMax, pointerMax);
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const onPointerReset = () => {
      if (mediaQuery.matches) return;
      targetOffset.current.x = 0;
      targetOffset.current.y = 0;
      pointerRaw.current.x = 0;
      pointerRaw.current.y = 0;
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerReset);
    window.addEventListener("blur", onPointerReset);
    window.addEventListener("resize", onResize);

    if (!mediaQuery.matches && !raf.current) raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerReset);
      window.removeEventListener("blur", onPointerReset);
      window.removeEventListener("resize", onResize);
      if (logo && !logo.complete) {
        logo.removeEventListener("load", onLogoLoad);
      }
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="animated-background" aria-hidden="true">
      <div className="animated-background__glow" ref={glowRef}>
        <div className="ambient-layer ambient-layer--rim" />
        <div className="ambient-layer ambient-layer--core" />
        <div className="ambient-layer ambient-layer--halo" />
        <div className="ambient-layer ambient-layer--bloom" />
      </div>

      <div className="blobs" aria-hidden="true">
        <div className="ambient-glow" />

        {/* Blob 1 - Blue - largest, front-most, CSS border-radius morph */}
        <div className="css-blob css-blob--blue" />

        {/* Blob 2 - Dark Slate Gray - second largest, behind blue */}
        <div className="css-blob css-blob--gray" />

        {/* Blob 3 - Near Black with subtle teal tint - smallest, furthest */}
        <div className="css-blob css-blob--dark" />
      </div>
    </div>
  );
}
