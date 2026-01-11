"use client";

import { forwardRef, MouseEventHandler, PropsWithChildren } from "react";
import { LucideIcon } from "lucide-react";

type ButtonPropType = PropsWithChildren<{
  fullWidth?: boolean;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "info"
    | "ghost"
    | "ghost-info"
    | "danger"
    | "success"
    | "outline-info"
    | "outline-info-work-day"
    | "outline-work-day"
    | "outline-info-no-border";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: "exSmall" | "small" | "normal" | "large" | "exLarge";
  disabled?: boolean;
  iconLeft?: LucideIcon;
  className?: string;
  iconClassName?: string;
  type?: "button" | "submit" | "reset";
}>;

const ButtonCustom = forwardRef<HTMLButtonElement, ButtonPropType>(
  (
    {
      children,
      variant = "primary",
      size = "large",
      fullWidth = false,
      disabled = false,
      iconLeft: IconLeft,
      className = "",
      onClick,
      iconClassName = "",
      type = "button",
    },
    ref
  ) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);
    };

    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Size styles
    const sizeStyles = {
      exSmall: "px-2 py-1 text-xs rounded",
      small: "px-3 py-1.5 text-sm rounded-md",
      normal: "px-4 py-2 text-sm rounded-md",
      large: "px-5 py-2.5 text-base rounded-lg",
      exLarge: "px-6 py-3 text-lg rounded-lg",
    };

    // Variant styles
    const variantStyles = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500",
      secondary:
        "bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 focus:ring-gray-500",
      outline:
        "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 focus:ring-gray-500",
      info: "bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 focus:ring-cyan-500",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500",
      "ghost-info":
        "bg-transparent text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 focus:ring-cyan-500",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500",
      success:
        "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500",
      "outline-info":
        "bg-white border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-700 active:bg-cyan-100 focus:ring-cyan-500",
      "outline-info-work-day":
        "bg-white border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-600 active:bg-cyan-100 focus:ring-cyan-500",
      "outline-work-day":
        "bg-white border-2 border-gray-400 text-gray-700 hover:bg-gray-50 hover:border-gray-500 active:bg-gray-100 focus:ring-gray-500",
      "outline-info-no-border":
        "bg-transparent text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 focus:ring-cyan-500",
    };

    // Full width style
    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        onClick={handleClick}
        disabled={disabled}
      >
        {IconLeft && (
          <IconLeft className={`${iconClassName}`} size={size === "exSmall" ? 14 : size === "small" ? 16 : size === "normal" ? 18 : size === "large" ? 20 : 22} />
        )}
        {children}
      </button>
    );
  }
);

ButtonCustom.displayName = "ButtonCustom";

export default ButtonCustom;
