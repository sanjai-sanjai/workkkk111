import { useState, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { GameCard } from "@/components/ui/game-card";
import { AchievementNotification } from "@/components/ui/achievement-notification";
import { DailyChallengesCard } from "@/components/student/DailyChallengesCard";
import { WeeklyChallengesCard } from "@/components/student/WeeklyChallengesCard";
import { OnboardingTutorial } from "@/components/student/OnboardingTutorial";
import { useAchievements } from "@/hooks/use-achievements";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { usePlayCoins } from "@/hooks/use-playcoins";
import { useStreak } from "@/hooks/use-streak";
import { useAuth } from "@/contexts/AuthContext";
import {
  Atom,
  FlaskConical,
  Heart,
  Calculator,
  Laptop,
  Wallet,
  Lightbulb,
  TreePine,
  Trophy,
  Clock,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const mascotPointingUrl = "https://cdn.builder.io/api/v1/image/assets%2F128ddd532bd34e33805885edbd9b265d%2F3c99deeaec0d40fdbbcf8869ed6c6a9b";

const subjects = [
  { icon: Atom, title: "Physics", progress: 65, color: "primary", path: "/learn/physics" },
  { icon: FlaskConical, title: "Chemistry", progress: 45, color: "secondary", path: "/learn/chemistry" },
  { icon: Heart, title: "Biology", progress: 30, color: "destructive", path: "/learn/biology" },
  { icon: Calculator, title: "Mathematics", progress: 80, color: "badge", path: "/learn/mathematics" },
  { icon: Laptop, title: "Technology", progress: 20, color: "primary", path: "/learn/technology" },
  { icon: Wallet, title: "Finance", progress: 55, color: "accent", path: "/learn/finance" },
  { icon: Lightbulb, title: "Entrepreneurship", progress: 25, color: "badge", path: "/learn/entrepreneurship" },
  { icon: TreePine, title: "Village Skills", progress: 10, color: "secondary", path: "/learn/village-skills" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { userAchievements, checkAchievements, unlockedCount } = useAchievements();
  const { playAchievement } = useSoundEffects();
  const { wallet } = usePlayCoins();
  const { currentStreak } = useStreak();
  
  const [showAchievement, setShowAchievement] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [latestAchievement, setLatestAchievement] = useState<{
    name: string;
    description: string;
    rarity?: string;
    xp_reward?: number;
    playcoins_reward?: number;
  } | null>(null);

  const userName = profile?.full_name?.split(' ')[0] || "Student";

  // Check if user needs onboarding
  useEffect(() => {
    const onboardingComplete = localStorage.getItem("onboarding_complete");
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    checkAchievements("daily_login");
  }, [checkAchievements]);

  useEffect(() => {
    if (userAchievements.length > 0) {
      const unclaimed = userAchievements.find(ua => !ua.is_claimed && ua.achievement);
      if (unclaimed?.achievement) {
        setLatestAchievement({
          name: unclaimed.achievement.name,
          description: unclaimed.achievement.description,
          rarity: unclaimed.achievement.rarity,
          xp_reward: unclaimed.achievement.xp_reward,
          playcoins_reward: unclaimed.achievement.playcoins_reward,
        });
        setShowAchievement(true);
      }
    }
  }, [userAchievements]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <AppLayout role="student" playCoins={wallet?.balance || 0} title="Dashboard">
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial 
          onComplete={handleOnboardingComplete}
          userName={userName}
        />
      )}

      <AchievementNotification
        show={showAchievement}
        achievement={latestAchievement}
        onClose={() => setShowAchievement(false)}
        onPlaySound={playAchievement}
      />

      <div className="px-4 py-6 relative">
        {/* Welcome Section */}
        <div className="mb-6 slide-up relative">
          <div className="glass-card rounded-2xl p-5 border border-border overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Hey {userName}! <span className="text-xl">👋</span>
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">Ready for today's adventure!</p>
              </div>
              <img src={mascotPointingUrl} alt="Mascot" className="w-24 h-24 object-contain -mr-2" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 slide-up" style={{ animationDelay: "100ms" }}>
          <div className="glass-card rounded-xl p-3 text-center border border-border">
            <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="font-heading text-lg font-bold text-foreground">2.5h</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center border border-border">
            <Flame className="h-5 w-5 text-destructive mx-auto mb-1" />
            <p className="font-heading text-lg font-bold text-foreground">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center border border-border">
            <Trophy className="h-5 w-5 text-accent mx-auto mb-1" />
            <p className="font-heading text-lg font-bold text-foreground">{unlockedCount}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>

        {/* Subjects Grid - PRIMARY FOCUS */}
        <div className="mb-6 slide-up" style={{ animationDelay: "150ms" }}>
          <h3 className="mb-3 font-heading font-semibold text-foreground flex items-center gap-2">
            <Atom className="h-5 w-5 text-primary" />
            Subjects
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((subject) => (
              <GameCard
                key={subject.title}
                icon={subject.icon}
                title={subject.title}
                progress={subject.progress}
                variant="default"
                colorScheme={subject.color}
                onClick={() => navigate(subject.path)}
              />
            ))}
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="mb-6 slide-up" style={{ animationDelay: "200ms" }}>
          <DailyChallengesCard />
        </div>

        {/* Weekly Challenges */}
        <div className="slide-up" style={{ animationDelay: "250ms" }}>
          <WeeklyChallengesCard />
        </div>
      </div>
    </AppLayout>
  );
}
