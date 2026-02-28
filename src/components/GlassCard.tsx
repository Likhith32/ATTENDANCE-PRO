import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export function GlassCard({ children, className = "", onDragOver, onDrop }: GlassCardProps) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(186, 218, 255, 0.55)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 16px rgba(59, 130, 246, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
      }}
      className={className}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
}