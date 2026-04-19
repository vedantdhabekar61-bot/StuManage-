'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'glass';
}

export function Logo({ 
  size = 40, 
  className = "", 
  showText = false,
  variant = 'light' 
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ rotate: -8, scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300",
          variant === 'light' ? "bg-[#0ea495] shadow-xl shadow-[#0ea495]/20" : 
          variant === 'dark' ? "bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-900/40" :
          "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
        )}
        style={{ width: size, height: size }}
      >
        {/* The Geometric Design */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-[55%] h-[55%] drop-shadow-sm"
        >
          {/* Main Book Structure */}
          <path 
            d="M4 19.5V4.5C4 3.67157 4.67157 3 5.5 3H18.5C19.3284 3 20 3.67157 20 4.5V19.5M4 19.5C4 20.3284 4.67157 21 5.5 21H18.5C19.3284 21 20 20.3284 20 19.5M4 19.5V16.5M20 19.5V16.5" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Bookmark Detail (Amber Accent) */}
          <motion.path 
            initial={{ y: -5 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            d="M15 3V9L13 7.5L11 9V3" 
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          {/* Abstract Seat/Desk Line */}
          <path 
            d="M8 13H16" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeOpacity="0.3"
          />
        </svg>
        
        {/* Subtle Shine/Highlight Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      </motion.div>

      {showText && (
        <div className="flex flex-col -gap-1">
          <span className="text-[20px] font-black text-[#1C1917] tracking-tight uppercase leading-tight">
            Stu<span className="text-[#0ea495]">Manage</span>
          </span>
          <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-[0.25em] ml-0.5 opacity-60">
            Study Logic
          </span>
        </div>
      )}
    </div>
  );
}
