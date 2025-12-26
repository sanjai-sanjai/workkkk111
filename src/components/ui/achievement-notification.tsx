import { useEffect, useState } from "react";
import { Card } from "./card";
import { GameBadge } from "./game-badge";
import { ConfettiEffect } from "./confetti-effect";
import { Trophy, Sparkles, X } from "lucide-react";
import { Button } from "./button";

interface AchievementNotificationProps {
  show: boolean;
  achievement: {
    name: string;
    description: string;
    icon?: string;
    rarity?: string;
    xp_reward?: number;
    playcoins_reward?: number;
  } | null;
  onClose: () => void;
  onPlaySound?: () => void;
}

export function AchievementNotification({
  show,
  achievement,
  onClose,
  onPlaySound,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show && achievement) {
      setIsVisible(true);
      onPlaySound?.();
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, achievement, onClose, onPlaySound]);

  if (!show || !achievement) return null;

  const rarityColors: Record<string, string> = {
    common: "bg-muted",
    rare: "bg-primary/20 border-primary",
    epic: "bg-badge/20 border-badge",
    legendary: "bg-accent/20 border-accent",
  };

  return (
    <>
      <ConfettiEffect trigger={show} />
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        <Card
          className={`relative max-w-sm w-full p-6 text-center border-2 ${
            rarityColors[achievement.rarity || "common"]
          } animate-bounce-in`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Mascot */}
          <img
            src={mascotCelebration}
            alt="Celebration"
            className="w-24 h-24 mx-auto mb-4 animate-bounce"
          />

          {/* Badge Icon */}
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg shadow-accent/30">
              <Trophy className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>

          {/* Achievement Title */}
          <h3 className="font-heading text-xl font-bold text-foreground mb-1">
            🏆 Achievement Unlocked!
          </h3>
          
          <GameBadge
            variant={achievement.rarity === "legendary" ? "accent" : achievement.rarity === "epic" ? "primary" : "secondary"}
            size="sm"
            className="mb-3"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {achievement.name}
          </GameBadge>

          <p className="text-muted-foreground text-sm mb-4">
            {achievement.description}
          </p>

          {/* Rewards */}
          {(achievement.xp_reward || achievement.playcoins_reward) && (
            <div className="flex justify-center gap-4 text-sm">
              {achievement.playcoins_reward && (
                <span className="text-accent font-semibold">
                  +{achievement.playcoins_reward} 🪙
                </span>
              )}
              {achievement.xp_reward && (
                <span className="text-primary font-semibold">
                  +{achievement.xp_reward} XP
                </span>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
