import { useState, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import {
  Trophy,
  Flame,
  Home,
  BookOpen,
  Users,
  Star,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Target,
  Zap,
  Heart,
  Award,
  ChevronRight,
} from "lucide-react";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayCoins } from "@/hooks/use-playcoins";

interface ImpactContributor {
  user_id: string;
  profile?: {
    full_name: string;
    village?: string;
    school?: string;
  };
  total_xp: number;
  current_level: number;
  contribution_score: number;
  day_streak: number;
  village_tasks_completed: number;
}

interface AnonymousAction {
  id: string;
  action: string;
  tags: string[];
  tagIcons: string[];
  microcopy: string;
  avatarColor: string;
}

const getImpactTitle = (rank: number, xp: number, streak: number): string => {
  if (streak >= 30) return "🔥 Consistency Champion";
  if (xp >= 5000) return "📚 Knowledge Builder";
  if (rank <= 3) return "🌟 Community Star";
  if (streak >= 14) return "🌱 Consistent Learner";
  return "🛠 Problem Solver";
};

const getAvatarColor = (index: number): string => {
  const colors = [
    "bg-gradient-to-br from-primary to-primary/60",
    "bg-gradient-to-br from-secondary to-secondary/60",
    "bg-gradient-to-br from-accent to-accent/60",
    "bg-gradient-to-br from-destructive to-destructive/60",
    "bg-gradient-to-br from-badge to-badge/60",
    "bg-gradient-to-br from-pink-500 to-pink-600",
  ];
  return colors[index % colors.length];
};

const getAvatarInitial = (name: string): string => {
  return name.split(" ")[0].charAt(0).toUpperCase() || "?";
};

const generateAnonymousActions = (): AnonymousAction[] => [
  {
    id: "1",
    action: "A learner completed 3 days in a row",
    tags: ["Consistency", "Foundation"],
    tagIcons: ["🔥", "📚"],
    microcopy: "Small steps build strong habits.",
    avatarColor: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    id: "2",
    action: "Someone helped with a village task today",
    tags: ["Village Skill", "Community"],
    tagIcons: ["🏡", "🤝"],
    microcopy: "Learning that helps others matters.",
    avatarColor: "bg-gradient-to-br from-green-500 to-green-600",
  },
  {
    id: "3",
    action: "A learner improved their Biology progress by 20%",
    tags: ["Biology", "Growth"],
    tagIcons: ["🧬", "🌱"],
    microcopy: "Progress is personal.",
    avatarColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  },
  {
    id: "4",
    action: "Completed a community challenge",
    tags: ["Challenge", "Teamwork"],
    tagIcons: ["🎯", "👥"],
    microcopy: "Together we solve bigger problems.",
    avatarColor: "bg-gradient-to-br from-purple-500 to-purple-600",
  },
  {
    id: "5",
    action: "A learner reached a 7-day learning streak",
    tags: ["Dedication", "Growth"],
    tagIcons: ["⚡", "📈"],
    microcopy: "Consistency unlocks potential.",
    avatarColor: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
];

export default function VillageImpactBoard() {
  const { leaderboard, userRank, isLoading } = useLeaderboard(15);
  const { user, profile } = useAuth();
  const { wallet } = usePlayCoins();
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const anonymousActions = generateAnonymousActions();

  // Calculate village stats
  const totalActiveLearners = Math.max(leaderboard.length, 0);
  const totalVillageXP = Math.max(leaderboard.reduce((sum, entry) => sum + (entry.total_xp || 0), 0), 0);
  const villageLevel = Math.max(Math.floor(totalVillageXP / 10000) + 1, 1);

  // Get current user from leaderboard
  const currentUserData = leaderboard.find((entry) => entry.user_id === user?.id) as ImpactContributor | undefined;
  const userStreak = Math.max(currentUserData?.day_streak || 0, 0);
  const userVillageTasks = Math.max(currentUserData?.village_tasks_completed || 0, 0);
  const userContributionScore = Math.max(currentUserData?.contribution_score || 0, 0);

  return (
    <AppLayout role="student" playCoins={wallet?.balance || 0} title="Village Impact Board">
      <div className="px-4 py-6 pb-24">
        {/* 1. HERO SECTION - Village Identity */}
        <div className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Card className="glass-card rounded-2xl p-5 border border-primary/30 overflow-hidden relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Home className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Your Village 🌾</h2>
                    <p className="text-sm text-muted-foreground">Learning together, growing stronger</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-background/50 rounded-xl p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Active Learners</p>
                  <p className="font-heading text-2xl font-bold text-primary">{totalActiveLearners}</p>
                </div>
                <div className="bg-background/50 rounded-xl p-3 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Village Level</p>
                  <p className="font-heading text-2xl font-bold text-accent">{villageLevel}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Village XP Progress</span>
                  <span>{Math.max(totalVillageXP / 1000, 0).toFixed(1)}k XP</span>
                </div>
                <AnimatedProgress value={Math.min(Math.max((totalVillageXP % 10000) / 100, 0), 100)} variant="default" className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* 2. YOUR IMPACT CARD */}
        <div
          className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <Card className="glass-card rounded-2xl p-5 border border-accent/40 bg-gradient-to-br from-accent/10 to-accent/5">
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-14 w-14 border-2 border-accent/50">
                <AvatarFallback className="bg-accent/20 text-accent font-bold text-lg">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-foreground">{profile?.full_name || "You"}</h3>
                <p className="text-sm text-accent font-semibold">Your Village Contribution</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-background/50 rounded-xl border border-accent/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Contribution Score</span>
                <span className="font-heading text-3xl font-bold text-accent">
                  {Math.max(userContributionScore, 0)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/50 rounded-lg p-2.5 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame className="h-4 w-4 text-destructive" />
                  <span className="text-xs text-muted-foreground">Consistency</span>
                </div>
                <p className="font-bold text-foreground text-lg">{Math.max(userStreak, 0)} days</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2.5 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Home className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Village Tasks</span>
                </div>
                <p className="font-bold text-foreground text-lg">{Math.max(userVillageTasks, 0)} tasks</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2.5 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="h-4 w-4 text-secondary" />
                  <span className="text-xs text-muted-foreground">Learning</span>
                </div>
                <p className="font-bold text-foreground text-lg">{Math.max(currentUserData?.current_level || 0, 0)}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-2.5 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Impact</span>
                </div>
                <p className="font-bold text-foreground text-lg">+{Math.max(Math.floor(userContributionScore / 10), 0)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Toggle for Anonymous Mode */}
        <div
          className={`mb-6 flex items-center gap-2 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <span className={`text-sm font-medium ${!anonymousMode ? "text-muted-foreground" : "text-foreground"}`}>
            Village Impact
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnonymousMode(!anonymousMode)}
            className="gap-2 border-border/50 hover:border-primary/50"
          >
            {anonymousMode ? (
              <>
                <Eye className="h-4 w-4" />
                Inspiration Mode On
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Impact Mode On
              </>
            )}
          </Button>
        </div>

        {/* 3. PROBLEM-SOLVING LEADERBOARD OR ANONYMOUS INSPIRATION */}
        {anonymousMode ? (
          /* ANONYMOUS INSPIRATION MODE */
          <div
            className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "250ms" }}
          >
            <div className="mb-4">
              <h3 className="font-heading text-lg font-bold text-foreground">What Learners in Your Village Are Doing 🌾</h3>
              <p className="text-sm text-muted-foreground">Real actions. Real learning. No comparisons.</p>
            </div>
            <div className="space-y-3">
              {anonymousActions.map((action, index) => (
                <Card
                  key={action.id}
                  className={`glass-card p-4 border border-border/50 transition-all duration-700 ${
                    isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-full ${action.avatarColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-lg">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground mb-2">{action.action}</p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {action.tags.map((tag, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-background/50 border border-border/50 rounded-full px-2 py-1 text-muted-foreground">
                            {action.tagIcons[i]} {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground italic">{action.microcopy}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* VILLAGE IMPACT CONTRIBUTORS LEADERBOARD */
          <div
            className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "250ms" }}
          >
            <div className="mb-4">
              <h3 className="font-heading text-lg font-bold text-foreground">Village Impact Contributors</h3>
              <p className="text-sm text-muted-foreground">Learners making a difference in your village</p>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="glass-card p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-24 mb-1" />
                        <div className="h-3 bg-muted rounded w-16" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : leaderboard.length === 0 ? (
                <Card className="glass-card p-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No contributors yet. Be the first!</p>
                </Card>
              ) : (
                leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.user_id === user?.id;
                  const impactTitle = getImpactTitle(index + 1, entry.total_xp, entry.day_streak || 0);

                  return (
                    <Card
                      key={entry.user_id}
                      className={`p-4 transition-all duration-700 ${
                        isCurrentUser ? "ring-2 ring-accent border-accent/40 bg-accent/5" : "glass-card border border-border/50"
                      } ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                      style={{ transitionDelay: `${300 + index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 border-2 border-primary/30 flex-shrink-0">
                            <AvatarFallback className={`${getAvatarColor(index)} text-white font-bold`}>
                              {getAvatarInitial(entry.profile?.full_name || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-heading font-bold truncate text-foreground">
                              {entry.profile?.full_name || "Anonymous"}
                              {isCurrentUser && <span className="text-accent ml-1">(You)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground mb-1.5 truncate">
                              {entry.profile?.village || entry.profile?.school || "Village Learner"}
                            </p>
                            <p className="text-sm font-semibold text-accent">{impactTitle}</p>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="relative h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeDasharray={`${(entry.contribution_score / 100) * 125.6} 125.6`}
                                className="text-primary transition-all duration-500"
                              />
                            </svg>
                            <span className="absolute font-bold text-sm text-primary">{Math.min(Math.floor(entry.contribution_score / 10), 99)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 4. VILLAGE CHALLENGE STATUS */}
        <div
          className={`mb-6 transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "400ms" }}
        >
          <Card className="glass-card rounded-2xl p-5 border border-secondary/30">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-foreground">This Week's Village Challenge</h4>
                <p className="text-sm text-muted-foreground">Improve math accuracy in your village by 10%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>6 of 10</span>
                </div>
                <AnimatedProgress value={60} variant="default" className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 rounded-lg p-2 border border-border/50">
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="font-bold text-foreground">{totalActiveLearners} students</p>
                </div>
                <div className="bg-background/50 rounded-lg p-2 border border-border/50">
                  <p className="text-xs text-muted-foreground">Time Left</p>
                  <p className="font-bold text-foreground">3 days</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 5. YOUR NEXT CONTRIBUTION CTA */}
        <div
          className={`transition-all duration-700 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "450ms" }}
        >
          <Card className="glass-card rounded-2xl p-5 border border-accent/30 bg-gradient-to-br from-accent/10 to-primary/5">
            <div className="text-center mb-4">
              <p className="font-heading text-lg font-bold text-foreground mb-1">Your learning helps your village grow 🌾</p>
              <p className="text-sm text-muted-foreground">Every lesson completed strengthens our community</p>
            </div>

            <div className="flex flex-col gap-2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2">
                <BookOpen className="h-4 w-4" />
                Start a Learning Task
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full border-accent/50 hover:border-accent text-foreground gap-2">
                <Target className="h-4 w-4" />
                Join Village Challenge
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
