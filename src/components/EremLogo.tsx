"use client";

import React from "react";
import styles from "./EremLogo.module.css";

export interface EremLogoProps {
  variant?: "horizontal" | "vertical" | "icon-only";
  size?: "sm" | "md" | "lg" | "xl" | number;
  subtitle?: string;
  badge?: string;
  className?: string;
  animated?: boolean;
}

export default function EremLogo({
  variant = "horizontal",
  size = "md",
  subtitle,
  badge = "SYSTEM v2.5",
  className = "",
  animated = true,
}: EremLogoProps) {
  // Dimension calculation
  const getDimension = () => {
    if (typeof size === "number") return size;
    switch (size) {
      case "sm":
        return 36;
      case "lg":
        return 52;
      case "xl":
        return 72;
      case "md":
      default:
        return 42;
    }
  };

  const dim = getDimension();
  const isIconOnly = variant === "icon-only";

  return (
    <div
      className={`${styles.logoWrapper} ${styles[variant]} ${
        animated ? styles.animated : ""
      } ${className}`}
    >
      {/* 3D Isometric Emblem Container */}
      <div className={styles.emblem3dStage}>
        {/* 3D Floor Shadow */}
        <div className={styles.shadow3dFloor} />

        <div
          className={styles.emblemContainer}
          style={{
            width: `${dim}px`,
            height: `${dim}px`,
          }}
        >
          <div className={styles.glossShine} />
          <div className={styles.metallicRim} />

          {/* SVG 3D Master Emblem with Bevels & Depth Layers */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.svgMark}
          >
            <defs>
              {/* 3D Metallic Gradients */}
              <linearGradient id="g3dTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="40%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>

              <linearGradient id="g3dFront" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>

              <linearGradient id="g3dBevel" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
              </linearGradient>

              <linearGradient id="g3dSide" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>

              <linearGradient id="g3dCore" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* 3D Soft Drop Shadow Filter */}
              <filter id="f3dShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0284c7" floodOpacity="0.5" />
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Outer 3D Hexagonal Cyber Shield Frame */}
            <path
              d="M50 6 L88 27 L88 73 L50 94 L12 73 L12 27 Z"
              stroke="url(#g3dBevel)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              opacity="0.45"
            />
            {/* 3D Hex Shadow Back Layer */}
            <path
              d="M50 9 L85 29 L85 71 L50 91 L15 71 L15 29 Z"
              stroke="#030712"
              strokeWidth="3"
              strokeLinejoin="round"
              opacity="0.6"
            />

            {/* Extruded 3D Base Shadow for 'E' & 'S' Emblem */}
            <path
              d="M26 34 C26 27 32 22 40 22 L74 22 C78 22 81 25 80 29 L78 34 L44 39 C40 39 38 41 38 44 L68 49 C77 49 83 55 83 64 C83 73 76 80 67 80 L30 80 C25 80 22 76 23 71 Z"
              fill="url(#g3dSide)"
              transform="translate(2, 4)"
              opacity="0.75"
            />

            {/* Main 3D Front Ribbon Body */}
            <g filter="url(#f3dShadow)">
              <path
                d="M26 31 C26 24 32 19 40 19 L74 19 C78 19 81 22 80 26 L78 31 C77 34 74 36 70 36 L44 36 C40 36 38 38 38 41 C38 44 40 46 44 46 L68 46 C77 46 83 52 83 61 C83 70 76 77 67 77 L30 77 C25 77 22 73 23 68 L24 63 C25 59 29 57 34 57 L62 57 C65 57 67 55 67 53 C67 51 65 49 62 49 L40 49 C30 49 26 42 26 31 Z"
                fill="url(#g3dFront)"
              />
            </g>

            {/* 3D Metallic Top Highlights (Glass & Bevel Edges) */}
            <path
              d="M26 31 C26 24 32 19 40 19 L74 19 C78 19 81 22 80 26 L78 31 C77 34 74 36 70 36 L52 36 Z"
              fill="url(#g3dTop)"
              opacity="0.9"
            />
            <path
              d="M40 19 L74 19 C78 19 81 22 80 26 L78 28 L40 21 Z"
              fill="url(#g3dBevel)"
              opacity="0.9"
            />

            {/* 3D Floating Gemstone / Energy Crystal */}
            <polygon points="50,10 58,22 50,34 42,22" fill="url(#g3dCore)" filter="url(#f3dShadow)" />
            <polygon points="50,10 54,22 50,34 46,22" fill="#ffffff" opacity="0.4" />

            <polygon points="50,66 58,78 50,90 42,78" fill="url(#g3dTop)" opacity="0.95" />
            <polygon points="50,66 54,78 50,90 46,78" fill="#ffffff" opacity="0.4" />

            {/* Center Glowing 3D Sphere Node */}
            <circle cx="50" cy="50" r="6" fill="#FFFFFF" filter="url(#f3dShadow)" />
            <circle cx="48" cy="48" r="2.5" fill="#38bdf8" />
            <circle cx="50" cy="50" r="10" stroke="#38bdf8" strokeWidth="2" opacity="0.85" />
          </svg>
        </div>
      </div>

      {/* Brand Text Content */}
      {!isIconOnly && (
        <div className={styles.textBlock}>
          <div className={styles.titleRow}>
            <span className={styles.brandTitleText}>EREM</span>
            <span className={styles.brandTitleSystem}>SYSTEM</span>
          </div>

          {(badge || subtitle) && (
            <div className={styles.metaRow}>
              {badge && (
                <span className={styles.badgeTag}>
                  <span className={styles.pulseDot} />
                  {badge}
                </span>
              )}
              {subtitle && <span className={styles.subtitleText}>{subtitle}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
