"use client";

import React from "react";
import Link from "next/link";
import EremLogo from "./EremLogo";

interface BrandLogoProps {
  subtitle?: string;
  badge?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function BrandLogo({
  subtitle,
  badge = "ENTERPRISE",
  className = "",
  size = "md",
  href,
}: BrandLogoProps) {
  const content = (
    <EremLogo
      variant="horizontal"
      size={size}
      subtitle={subtitle}
      badge={badge}
      className={className}
    />
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "inline-block", cursor: "pointer" }} title="Về trang Dashboard">
        {content}
      </Link>
    );
  }

  return content;
}
