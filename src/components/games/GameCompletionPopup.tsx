import React from "react";
import { Button } from "@/components/ui/button";
import { ConfettiEffect } from "@/components/ui/confetti-effect";
import { RotateCcw, X } from "lucide-react";
import mascotCelebration from "@/assets/mascot-celebration.png";

interface GameCompletionPopupProps {
  title: string;
  message: string;
  score?: number;
  maxScore?: number;
  coins?: number;
  xp?: number;
  isSuccess: boolean;
  onReplay: () => void;
  onExit: () => void;
}

export function GameCompletionPopup({
  title,
  message,
  score,
  maxScore,
  coins,
  xp,
  isSuccess,
  onReplay,
  onExit,
}: GameCompletionPopupProps) {
  return (
    <>
      {isSuccess && <ConfettiEffect trigger={isSuccess} />}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass-card rounded-3xl border border-border bg-gradient-to-br from-background to-muted/20 p-8 max-w-md w-full shadow-2xl animate-scale-in">
          {/* Close Button */}
          <button
            onClick={onExit}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Mascot */}
          {isSuccess && (
            <img
              src={mascotCelebration}
              alt="Celebration"
              className="w-24 h-24 mx-auto mb-4 animate-bounce-in"
            />
          )}

          {/* Title */}
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2 text-center">
            {isSuccess ? "🎉 Amazing Job! 🎉" : "💪 Keep Trying!"}
          </h2>

          {/* Message */}
          <p className="text-center text-muted-foreground mb-6">{message}</p>

          {/* Rewards */}
          {isSuccess && (coins || xp) && (
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-secondary/10 rounded-xl border border-secondary/30">
              {coins !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">+{coins}</div>
                  <div className="text-xs text-muted-foreground">PlayCoins</div>
                </div>
              )}
              {xp !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">+{xp}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              )}
            </div>
          )}

          {/* Score */}
          {score !== undefined && maxScore !== undefined && (
            <div className="mb-6 text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-3xl font-bold text-foreground">{score}/{maxScore}</div>
              <div className="text-xs text-muted-foreground mt-1">Score</div>
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onReplay}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Replay
            </Button>
            <Button
              onClick={onExit}
              className="w-full bg-secondary hover:bg-secondary/90"
            >
              ✓ Exit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
