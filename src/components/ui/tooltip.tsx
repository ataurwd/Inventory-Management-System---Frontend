"use client";

import React from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <div className="group relative inline-flex items-center text-muted-foreground/70 hover:text-primary transition-colors ml-1.5 cursor-help">
      <Info className="h-3.5 w-3.5" />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 scale-95 rounded-lg bg-card border border-border/80 p-2.5 text-[10px] leading-normal font-normal text-muted-foreground shadow-md opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto">
        <p className="normal-case tracking-normal">{content}</p>
        {/* Subtle arrow */}
        <div className="absolute top-full left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-border bg-card" />
      </div>
    </div>
  );
}
