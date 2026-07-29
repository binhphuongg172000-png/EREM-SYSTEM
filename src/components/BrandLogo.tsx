"use client";

import React from "react";
import EremLogo from "./EremLogo";

interface BrandLogoProps {
  subtitle?: string;
  badge?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function BrandLogo({
  subtitle,
  badge = "ENTERPRISE",
  className = "",
  size = "md",
}: BrandLogoProps) {
  return (
    <EremLogo
      variant="horizontal"
      size={size}
      subtitle={subtitle}
      badge={badge}
      className={className}
    />
  );
}
