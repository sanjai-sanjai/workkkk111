import React from "react";
import { cn } from "@/lib/utils";

interface EduCoinProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
  showLabel?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

/**
 * Custom EduCoin Component
 * Uses the official EduCoin brand image (gold coin with book + leaf)
 * Transparent PNG - blends with app theme
 * Scalable and consistent across the application
 */
export function EduCoin({
  size = "md",
  animated = false,
  className,
  showLabel = false,
}: EduCoinProps) {
  const dimension = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <style>{`
        @keyframes coin-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .edu-coin-animated {
          animation: coin-spin 3s linear infinite;
        }
      `}</style>

      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fa9d627de7a0c400a9a5045a9ca4a12ea%2F6df1eb74c5aa43698eea5229a2df81d4"
        alt="EduCoin"
        width={dimension}
        height={dimension}
        className={cn(
          "drop-shadow-lg flex-shrink-0",
          animated && "edu-coin-animated"
        )}
        style={{
          aspectRatio: "1 / 1",
          objectFit: "contain",
        }}
      />

      {showLabel && <span className="text-xs font-bold text-yellow-600">EduCoins</span>}
    </div>
  );
}

/**
 * EduCoin Display Component
 * Shows coin amount with the coin icon
 */
export function EduCoinDisplay({
  amount,
  size = "md",
  animated = false,
}: {
  amount: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <EduCoin size={size} animated={animated} />
      <span className="font-bold text-foreground">{amount.toLocaleString()}</span>
    </div>
  );
}
