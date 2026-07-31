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
  badge = "IT HCM PLATFORM",
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

          {/* Sharp High-Contrast SVG 3D IT HCM Emblem */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.svgMark}
          >
            <defs>
              {/* Ultra-Sharp Orange & White-Orange Gradients */}
              <linearGradient id="gOrangePrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff9100" />
                <stop offset="100%" stopColor="#ff5500" />
              </linearGradient>

              <linearGradient id="gOrangeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffc000" />
                <stop offset="100%" stopColor="#ff6a00" />
              </linearGradient>

              <linearGradient id="gWhiteOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ffb366" />
              </linearGradient>

              <linearGradient id="gHexBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffb703" />
                <stop offset="50%" stopColor="#ff6b00" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Outer Hexagon Frame - Sharp Bold Orange Vector */}
            <path
              d="M50 7 L86 27 L86 73 L50 93 L14 73 L14 27 Z"
              stroke="url(#gHexBorder)"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Inner Hexagon Hairline Accent */}
            <path
              d="M50 14 L79 31 L79 69 L50 86 L21 69 L21 31 Z"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeOpacity="0.4"
              strokeLinejoin="round"
            />

            {/* Stylized Letter 'I' Pillar (Left) */}
            <g>
              <rect x="24" y="28" width="13" height="44" rx="3.5" fill="url(#gWhiteOrange)" stroke="#ffffff" strokeWidth="0.8" />
              <rect x="24" y="28" width="13" height="13" rx="3" fill="url(#gOrangePrimary)" />
            </g>

            {/* Stylized Letter 'T' Crossbar & Pillar (Right) */}
            <g>
              {/* T Top Bar */}
              <path d="M42 28 C42 25 45 23 48 23 L76 23 C79 23 82 25 82 28 L82 34 C82 37 79 39 76 39 L48 39 C45 39 42 37 42 34 Z" fill="url(#gOrangePrimary)" stroke="#ffffff" strokeWidth="0.8" />
              {/* T Stem */}
              <path d="M56 39 L68 39 L68 70 C68 73 65 75 62 75 C59 75 56 73 56 70 Z" fill="url(#gOrangeGlow)" stroke="#ffffff" strokeWidth="0.8" />
            </g>

            {/* Center High-Tech Core Node */}
            <circle cx="62" cy="31" r="5" fill="#ffffff" />
            <circle cx="62" cy="31" r="2.5" fill="#ff6b00" />

            {/* Sharp Accent Diamonds */}
            <polygon points="50,11 56,20 50,29 44,20" fill="url(#gWhiteOrange)" />
            <polygon points="50,71 56,80 50,89 44,80" fill="url(#gOrangePrimary)" />
          </svg>
        </div>
      </div>

      {/* Brand Text Content */}
      {!isIconOnly && (
        <div className={styles.textBlock}>
          <div className={styles.titleRow}>
            <span className={styles.brandTitleText}>IT</span>
            <span className={styles.brandTitleSystem}>HCM</span>
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
