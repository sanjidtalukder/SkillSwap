import React from "react";
import { cn } from "@/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("group flex items-center gap-2.5 select-none", className)}>
      {/* Premium Gradient Hex/Orb Emblem */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow Backdrop */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 opacity-60 blur-xs transition-all duration-300 group-hover:opacity-100 group-hover:blur-sm" />
        
        {/* Emblem Box */}
        <div
          className={cn(
            "relative flex items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-inner shadow-white/10 transition-transform duration-300 group-hover:scale-105",
            iconSizes[size]
          )}
        >
          {/* Stylized Interlocking Arrows / S Swap Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180"
          >
            {/* Top Arrow moving right */}
            <path
              d="M4 8H17M17 8L13 4M17 8L13 12"
              stroke="url(#swap-gradient-1)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bottom Arrow moving left */}
            <path
              d="M20 16H7M7 16L11 12M7 16L11 20"
              stroke="url(#swap-gradient-2)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="swap-gradient-1" x1="4" y1="4" x2="17" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="1" stopColor="#818CF8" />
              </linearGradient>
              <linearGradient id="swap-gradient-2" x1="20" y1="20" x2="7" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#818CF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Modern High-End Typography */}
      {showText && (
        <span
          className={cn(
            "font-extrabold tracking-tight font-sans transition-all duration-300",
            textSizes[size]
          )}
        >
          <span className="text-white drop-shadow-sm">Skill</span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-300 transition-colors">
            Swap
          </span>
          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/80 animate-pulse" />
        </span>
      )}
    </div>
  );
}
