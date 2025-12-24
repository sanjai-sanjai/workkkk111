import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/navigation/AppLayout";
import { Button } from "@/components/ui/button";
import { ChevronDown, Rocket, Gamepad2, Coins, TrendingUp, Globe, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import mascotExcited from "@/assets/mascot-excited.png";

interface HelpSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  content: React.ReactNode;
}

export default function HelpPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>("games");

  const helpSections: HelpSection[] = [
    {
      id: "games",
      icon: <Gamepad2 className="h-6 w-6 text-accent" />,
      title: "🎮 How Games Work",
      description: "Learn how to play and win EduCoins",
      content: (
        <div className="space-y-3 text-muted-foreground">
          <p>Each game teaches you important concepts while having fun:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Complete challenges</strong> to earn EduCoins</li>
            <li><strong>Master different topics</strong> through interactive gameplay</li>
            <li><strong>Unlock new levels</strong> as you progress</li>
            <li><strong>Compete with friends</strong> on the leaderboard</li>
            <li><strong>Learn at your pace</strong> - no time limits!</li>
          </ul>
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm">💡 <strong>Pro Tip:</strong> Try different games to find your favorite learning style!</p>
          </div>
        </div>
      ),
    },
    {
      id: "learning",
      icon: <TrendingUp className="h-6 w-6 text-secondary" />,
      title: "📚 How Learning Modes Work",
      description: "Active, Passive & Gamified learning explained",
      content: (
        <div className="space-y-3 text-muted-foreground">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="font-medium text-foreground mb-1">🎯 Gamified Mode (Fun!)</p>
              <p className="text-sm">Interactive games where you learn by playing. Best for beginners!</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="font-medium text-foreground mb-1">✍️ Active Mode (Hands-On)</p>
              <p className="text-sm">Solve problems, answer questions, and practice what you've learned.</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="font-medium text-foreground mb-1">📖 Passive Mode (Read & Learn)</p>
              <p className="text-sm">Watch videos and read materials at your own pace.</p>
            </div>
          </div>
          <p className="mt-4">You can switch between modes anytime. Choose what works best for you!</p>
        </div>
      ),
    },
    {
      id: "educoins",
      icon: <Coins className="h-6 w-6 text-badge" />,
      title: "🪙 How EduCoins & Rewards Work",
      description: "Earn, redeem & unlock awesome rewards",
      content: (
        <div className="space-y-3 text-muted-foreground">
          <div className="space-y-2">
            <p><strong>Earn EduCoins by:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Completing daily challenges</li>
              <li>Playing and winning games</li>
              <li>Finishing learning tasks</li>
              <li>Reaching milestones</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p><strong>Redeem your EduCoins for:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>📚 Study materials & books</li>
              <li>🎁 Stationery & supplies</li>
              <li>🏆 Premium features</li>
              <li>🌟 Special rewards</li>
            </ul>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-badge/10 border border-badge/20">
            <p className="text-sm">✨ <strong>Did You Know?</strong> More learning = More EduCoins = More awesome rewards!</p>
          </div>
        </div>
      ),
    },
    {
      id: "progress",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "🧭 How to Track Progress",
      description: "Monitor your learning journey",
      content: (
        <div className="space-y-3 text-muted-foreground">
          <p>Keep track of your improvement in multiple ways:</p>
          <div className="space-y-2 mt-3">
            <div className="flex items-start gap-3">
              <span className="text-lg">📊</span>
              <div>
                <p className="font-medium text-foreground">Progress Dashboard</p>
                <p className="text-sm">See your overall learning stats and achievements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🔥</span>
              <div>
                <p className="font-medium text-foreground">Day Streak</p>
                <p className="text-sm">Keep your learning streak alive by learning daily!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🏅</span>
              <div>
                <p className="font-medium text-foreground">Achievements</p>
                <p className="text-sm">Unlock badges as you reach milestones</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">🎖️</span>
              <div>
                <p className="font-medium text-foreground">Leaderboard</p>
                <p className="text-sm">See how you rank among other learners</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "language",
      icon: <Globe className="h-6 w-6 text-secondary" />,
      title: "🌐 How to Change Language",
      description: "Learn in your preferred language",
      content: (
        <div className="space-y-3 text-muted-foreground">
          <p>PlayNLearn supports 11 different languages! Change your language anytime:</p>
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            <ol className="space-y-2">
              <li><strong>1.</strong> Click the 🌐 (Globe) icon in the top-right corner</li>
              <li><strong>2.</strong> A language selector will open</li>
              <li><strong>3.</strong> Type to search or scroll through languages</li>
              <li><strong>4.</strong> Click your preferred language</li>
              <li><strong>5.</strong> The entire app instantly changes to your language!</li>
            </ol>
          </div>
          <p className="mt-4">Supported languages: English, हिंदी, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം, मराठी, বাংলা, ગુજરાતી, اردو, and ଓଡିଆ</p>
        </div>
      ),
    },
    {
      id: "offline",
      icon: <Wifi className="h-6 w-6 text-primary" />,
      title: "📱 Offline & Sync Usage",
      description: "Learn even without internet",
      content: (
        <div className="space-y-3 text-muted-foreground">
          <div className="space-y-2">
            <p><strong>🟢 Online Mode:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
              <li>Instant sync with server</li>
              <li>Access all features</li>
              <li>See leaderboard updates</li>
              <li>Download new content</li>
            </ul>
          </div>
          <div className="space-y-2 mt-3">
            <p><strong>🔴 Offline Mode:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
              <li>Continue learning without internet!</li>
              <li>Play downloaded games</li>
              <li>Complete offline tasks</li>
              <li>Progress syncs when you go online</li>
            </ul>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm">💡 <strong>Tip:</strong> Your learning streak continues even in offline mode! Stay consistent and earn rewards.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AppLayout role="student" title="Help & Tutorials" showTabBar showBreadcrumb>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 px-4 py-6 pb-28 relative overflow-hidden">
        {/* Animated Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-40" />
        <div className="absolute bottom-32 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 opacity-40" />

        {/* Welcome Section */}
        <div className="relative z-10 max-w-2xl mx-auto mb-12">
          <style>{`
            @media (max-width: 640px) {
              .help-heading {
                font-weight: 600;
              }
            }
          `}</style>
          <div className="text-center space-y-4 mb-8">
            <div className="flex justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff07f67c11935460db26135cb9fa20837%2Fdab3fb2f1cd64797bf8139a83849d19f"
                alt="Help Guide"
                className="w-40 h-40 object-contain animate-[bounce_2s_ease-in-out_infinite]"
              />
            </div>
            <h1 className="help-heading font-heading text-4xl font-bold text-foreground">
              Need Help? We've Got You 😊
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn how to use PlayNLearn step by step
            </p>
          </div>

          {/* Help Sections */}
          <div className="space-y-3">
            {helpSections.map((section) => (
              <div
                key={section.id}
                className="glass-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === section.id ? null : section.id
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex-shrink-0">{section.icon}</div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-300",
                      expandedSection === section.id && "rotate-180"
                    )}
                  />
                </button>

                {/* Expanded Content */}
                {expandedSection === section.id && (
                  <div className="border-t border-border/50 px-6 py-4 bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-12 text-center">
            <Button
              onClick={() => navigate("/student/dashboard")}
              className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground px-8 py-3 text-lg font-medium"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Got it! Let's Learn 🚀
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
