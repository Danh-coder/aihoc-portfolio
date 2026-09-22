import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      href,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed tap-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

    const variantStyles = {
      primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-sm",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300",
      outline: "border border-border text-text hover:bg-slate-50 active:bg-slate-100",
      ghost: "text-text hover:bg-slate-100 active:bg-slate-200",
    };

    const sizeStyles = {
      sm: "text-sm px-3 py-1.5 h-9",
      md: "text-base px-5 py-2.5 h-11",
      lg: "text-lg px-6 py-3 h-12",
    };

    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    if (href) {
      return (
        <Link
          href={href}
          className={combinedStyles}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as any)}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || isLoading}
        className={combinedStyles}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
