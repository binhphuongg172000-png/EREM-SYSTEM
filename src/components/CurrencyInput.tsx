"use client";

import React, { useState, useEffect } from "react";

interface CurrencyInputProps {
  value?: number | string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  required?: boolean;
}

export function formatCurrencyString(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "";
  const cleanNum = String(val).replace(/\D/g, "");
  if (!cleanNum) return "";
  return Number(cleanNum).toLocaleString("vi-VN");
}

export function parseCurrencyString(formattedVal: string): string {
  return formattedVal.replace(/\D/g, "");
}

export default function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  className = "form-input",
  style,
  disabled = false,
  required = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>("");

  useEffect(() => {
    setDisplayValue(formatCurrencyString(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigits = parseCurrencyString(rawVal);
    
    if (cleanDigits === "") {
      setDisplayValue("");
      onChange("");
    } else {
      const formatted = Number(cleanDigits).toLocaleString("vi-VN");
      setDisplayValue(formatted);
      onChange(cleanDigits);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      style={style}
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      required={required}
    />
  );
}
