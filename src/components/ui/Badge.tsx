import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    primary: "bg-blue-50 text-blue-700 border border-blue-200",
    secondary: "bg-slate-200 text-slate-800",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    outline: "bg-transparent text-slate-600 border border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
