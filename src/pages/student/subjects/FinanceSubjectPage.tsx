import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { GameBadge } from "@/components/ui/game-badge";
import { GameIntroModal, GameContainer } from "@/components/games";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Play, 
  Star, 
  Trophy,
  Zap,
  ChevronRight,
  Target,
  BookOpen,
  Gamepad2
} from "lucide-react";
import { useState } from "react";

import {
  PocketMoneyManager,
  SmartShopperChallenge,
  SavingsGrower,
  BankingBasicsSimulator,
  PriceCompareMaster,
  MiniBusinessTycoon,
  DigitalMoneyExplorer,
} from "@/components/games";

interface GameCard {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  xp: number;
  coins: number;
  difficulty: "easy" | "medium" | "hard";
  status: "available" | "locked";
  route: string;
  introConfig: {
    conceptName: string;
    concept: string;
    whatYouLearn: string[];
    howToPlay: string[];
    outcome: string;
  };
  component: React.ComponentType<{ onComplete: (score: number) => void }>;
  instructions: string;
  conceptLearned: string;
}

const financeGames: GameCard[] = [
  {
    id: "pocket-money",
    name: "Pocket Money Manager",
    description: "Learn budgeting and expense control",
    icon: Wallet,
    xp: 150,
    coins: 50,
    difficulty: "easy",
    status: "available",
    route: "/student/finance/game/pocket-money",
    component: PocketMoneyManager,
    instructions:
      "You have ₹500 for the month. Every day, you'll see mandatory (must pay) and optional (nice to have) expenses. Decide which ones to pay. Your goal is to finish the month with savings! Remember: necessities come first.",
    conceptLearned:
      "Budgeting is about managing your money wisely. Spending on needs keeps you healthy and safe. Optional wants can wait. Small savings every day add up!",
    introConfig: {
      conceptName: "Pocket Money Manager",
      concept: "Budgeting & Expense Control",
      whatYouLearn: [
        "Manage ₹500 throughout a month",
        "Prioritize needs over wants and watch your savings grow",
      ],
      howToPlay: [
        "Each day, you'll see mandatory expenses (like travel) and optional ones (like snacks)",
        "Drag money from your wallet to pay for items",
        "Unspent money goes to your savings jar",
        "Finish day 30 with money left = you win!",
      ],
      outcome:
        "You'll understand that smart spending leads to real savings—the foundation of financial health!",
    },
  },
  {
    id: "smart-shopper",
    name: "Smart Shopper Challenge",
    description: "Discover needs vs wants",
    icon: Target,
    xp: 150,
    coins: 50,
    difficulty: "easy",
    status: "available",
    route: "/student/finance/game/smart-shopper",
    component: SmartShopperChallenge,
    instructions:
      "Visit three different market scenes with different items to buy. Items are labeled as either NEEDS (green) or WANTS (yellow). Select items wisely and checkout. You'll see how many needs vs wants you picked and get feedback on your choices.",
    conceptLearned:
      "Needs are things you must have (food, school supplies). Wants are extras you'd like (toys, games). Spending money on needs first is smart because they keep you healthy and help you learn.",
    introConfig: {
      conceptName: "Smart Shopper Challenge",
      concept: "Needs vs Wants",
      whatYouLearn: [
        "Identify what you truly NEED vs what you WANT",
        "Balance your budget by choosing wisely in a market",
      ],
      howToPlay: [
        "Visit the market and see items with prices",
        "Drag items into your basket to select them",
        "Green items = NEEDS, Yellow items = WANTS",
        "Checkout and see your wise (or not so wise!) choices",
      ],
      outcome:
        "You'll master the art of smart shopping—knowing the difference between needs and wants saves money!",
    },
  },
  {
    id: "savings-grower",
    name: "Savings Grower",
    description: "Build consistent saving habits",
    icon: Zap,
    xp: 150,
    coins: 50,
    difficulty: "medium",
    status: "available",
    route: "/student/finance/game/savings-grower",
    component: SavingsGrower,
    instructions:
      "You have a plant that grows when you save money consistently. Every day, decide: save ₹100 or skip. Save for 15 consecutive days to win! But if you skip days, your plant wilts. The key: consistency beats big one-time savings.",
    conceptLearned:
      "Small, regular savings are more powerful than big, rare ones. Saving ₹100 every day for 15 days builds ₹1500 and stronger money habits. Missing days sets you back.",
    introConfig: {
      conceptName: "Savings Grower",
      concept: "Consistency > Amount",
      whatYouLearn: [
        "Save a little bit every day for 15 days straight",
        "Watch your plant grow with regular deposits",
      ],
      howToPlay: [
        "Each day, choose to save ₹100 or skip",
        "Saving adds water to grow your plant",
        "Missing a day causes your plant to wilt",
        "Reach 15 consecutive saving days to win!",
      ],
      outcome:
        "You'll learn that showing up every day—even with small amounts—creates real wealth and strong habits!",
    },
  },
  {
    id: "banking-basics",
    name: "Banking Basics Simulator",
    description: "Explore how banks grow money",
    icon: Wallet,
    xp: 200,
    coins: 60,
    difficulty: "medium",
    status: "available",
    route: "/student/finance/game/banking-basics",
    component: BankingBasicsSimulator,
    instructions:
      "Start a bank account and manage it for a year. Make deposits, watch your money grow through interest, and see how withdrawals stop your growth. You'll earn about 5% annual interest, so bigger deposits = bigger returns!",
    conceptLearned:
      "Banks pay you interest on your savings! The more you save and the longer you leave it, the more it grows. Early withdrawals stop the growth. This is how long-term wealth is built.",
    introConfig: {
      conceptName: "Banking Basics Simulator",
      concept: "How Banks Grow Money",
      whatYouLearn: [
        "Deposit money and watch it grow through interest",
        "Keep money in longer = bigger returns",
      ],
      howToPlay: [
        "Start by making your first deposit",
        "Each month, your money grows by ~0.42% in interest",
        "Deposit more to earn more or withdraw to spend",
        "Run the bank for 12 months to see final growth",
      ],
      outcome:
        "You'll understand that banks reward savers with interest—the earlier you start, the more you grow!",
    },
  },
  {
    id: "price-compare",
    name: "Price Compare Master",
    description: "Find the best value, not just lowest price",
    icon: Target,
    xp: 150,
    coins: 50,
    difficulty: "medium",
    status: "available",
    route: "/student/finance/game/price-compare",
    component: PriceCompareMaster,
    instructions:
      "Three shops sell the same product at different prices and quantities. Pick the best value! Remember: lowest price isn't always best value. Calculate price per unit to make smart choices. Correct answers earn points!",
    conceptLearned:
      "Best value = lowest price PER UNIT, not the lowest total price. ₹100 for 2 liters (₹50/L) is better than ₹60 for 1 liter (₹60/L). Always do the math!",
    introConfig: {
      conceptName: "Price Compare Master",
      concept: "Best Value ≠ Lowest Price",
      whatYouLearn: [
        "Calculate price per unit to find the real best deal",
        "Bigger packs often have better per-unit pricing",
      ],
      howToPlay: [
        "Three shops sell the same product",
        "Each has different price and quantity",
        "Calculate the price per unit for each",
        "Pick the option with the lowest per-unit cost",
      ],
      outcome:
        "You'll become a smart shopper who saves money by comparing value, not just price!",
    },
  },
  {
    id: "business-tycoon",
    name: "Mini Business Tycoon",
    description: "Learn profit and loss management",
    icon: Trophy,
    xp: 200,
    coins: 60,
    difficulty: "hard",
    status: "available",
    route: "/student/finance/game/business-tycoon",
    component: MiniBusinessTycoon,
    instructions:
      "Run a lemonade stall for 7 days. Buy materials (₹30 per glass), set your selling price, and serve customers. Customers buy more at lower prices but with less profit per item. Higher prices = more profit per item but fewer customers. Find the balance!",
    conceptLearned:
      "Profit = Revenue - Cost. Lower prices attract more customers (more volume), higher prices earn more per item. The best business owners find the sweet spot that maximizes total profit, not just price or volume.",
    introConfig: {
      conceptName: "Mini Business Tycoon",
      concept: "Profit & Loss Management",
      whatYouLearn: [
        "Buy materials and create inventory",
        "Set competitive prices and manage profit margins",
      ],
      howToPlay: [
        "Buy materials (each item costs ₹30 to make)",
        "Set a selling price (higher = more profit per item)",
        "Each day, customers come to buy based on your price",
        "Run for 7 days and see your total profit",
      ],
      outcome:
        "You'll learn that business success is about balancing price, volume, and profit. Great entrepreneurs think strategically!",
    },
  },
  {
    id: "digital-money",
    name: "Digital Money Explorer",
    description: "Compare cash vs digital payments",
    icon: Wallet,
    xp: 150,
    coins: 50,
    difficulty: "medium",
    status: "available",
    route: "/student/finance/game/digital-money",
    component: DigitalMoneyExplorer,
    instructions:
      "Face 4 real-world shopping scenarios (street vendor, supermarket, etc.). For each, choose between cash, debit card, or mobile payment. You'll see how each method works and learn when to use each one. Different situations call for different payment methods!",
    conceptLearned:
      "Cash is best for small purchases (immediate, no fees). Cards are best for large purchases (safe, tracked). Mobile payments are fastest for medium purchases. Understanding pros and cons helps you choose wisely!",
    introConfig: {
      conceptName: "Digital Money Explorer",
      concept: "Cash vs Digital Payments",
      whatYouLearn: [
        "Understand when to use cash, cards, or mobile payments",
        "Learn the pros and cons of each method",
      ],
      howToPlay: [
        "Read a shopping scenario",
        "Choose your payment method: cash, card, or mobile",
        "See how the transaction processes",
        "Learn the best practice for that situation",
      ],
      outcome:
        "You'll be a payment expert—knowing exactly when and how to pay makes transactions smooth and safe!",
    },
  },
];

const activeLearningLevels = [
  {
    level: 1,
    name: "Earning & Spending",
    description: "Understand income and expenses",
    xp: 100,
    coins: 30
  },
  {
    level: 2,
    name: "Saving Strategies",
    description: "Learn effective saving methods",
    xp: 150,
    coins: 40
  },
  {
    level: 3,
    name: "Banking Essentials",
    description: "Explore how banks work",
    xp: 200,
    coins: 60
  }
];

interface GameCardProps {
  game: GameCard;
  onPlay: (game: GameCard) => void;
}

function GameCardComponent({ game, onPlay }: GameCardProps) {
  const Icon = game.icon;
  const difficultyColor = {
    easy: "bg-green-500/20 text-green-600",
    medium: "bg-yellow-500/20 text-yellow-600",
    hard: "bg-red-500/20 text-red-600"
  };

  return (
    <Card className="glass-card border border-accent/30 p-4 hover:scale-105 transition-transform">
      <div className="flex items-start justify-between mb-3">
        <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <Badge className={`text-xs capitalize ${difficultyColor[game.difficulty]}`}>
          {game.difficulty}
        </Badge>
      </div>
      
      <h3 className="font-heading font-semibold text-foreground mb-1">{game.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
      
      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className="text-accent">+{game.coins} 🪙</span>
        <span className="text-primary">+{game.xp} XP</span>
      </div>
      
      <Button
        onClick={() => onPlay(game)}
        size="sm"
        className="w-full bg-accent hover:bg-accent/90"
      >
        <Play className="h-4 w-4 mr-1" />
        Play
      </Button>
    </Card>
  );
}

export default function FinanceSubjectPage() {
  const [selectedGame, setSelectedGame] = useState<GameCard | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [playingGame, setPlayingGame] = useState<GameCard | null>(null);
  const totalProgress = 65;

  const handlePlayGame = (game: GameCard) => {
    setSelectedGame(game);
    setShowIntro(true);
  };

  const handleStartGame = () => {
    if (selectedGame) {
      setShowIntro(false);
      setPlayingGame(selectedGame);
    }
  };

  const handleGoBack = () => {
    setShowIntro(false);
    setSelectedGame(null);
  };

  const handleGameComplete = () => {
    setPlayingGame(null);
    setSelectedGame(null);
  };

  const handleExitGame = () => {
    setPlayingGame(null);
    setSelectedGame(null);
  };

  // Show active game view
  if (playingGame) {
    const GameComponent = playingGame.component;
    return (
      <AppLayout role="student" playCoins={1250} title={playingGame.name}>
        <div className="px-4 py-6 pb-24">
          <GameContainer
            gameComponent={
              <GameComponent onComplete={handleGameComplete} />
            }
            instructions={playingGame.instructions}
            conceptLearned={playingGame.conceptLearned}
            onRetry={() => setPlayingGame(playingGame)}
            onExit={handleExitGame}
            gameName={playingGame.name}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="student" playCoins={1250} title="Finance">
      <div className="px-4 py-6 pb-24">
        {/* Subject Header */}
        <div className="mb-6 slide-up">
          <div className="glass-card rounded-2xl p-5 border border-border bg-gradient-to-br from-accent/20 to-accent/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-accent/30 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-accent" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-bold text-foreground">Finance</h2>
                <p className="text-sm text-muted-foreground">Master your money skills</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-accent">{totalProgress}%</span>
              </div>
              <AnimatedProgress value={totalProgress} variant="default" />
            </div>
          </div>
        </div>

        {/* Learning Tabs */}
        <Tabs defaultValue="gamified" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Active</span>
            </TabsTrigger>
            <TabsTrigger value="passive" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Passive</span>
            </TabsTrigger>
            <TabsTrigger value="gamified" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden sm:inline">Gamified</span>
            </TabsTrigger>
          </TabsList>

          {/* Active Learning Tab */}
          <TabsContent value="active" className="space-y-4">
            <div className="mb-4">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Learning Levels
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Complete levels to build your skills</p>
            </div>

            <div className="space-y-3">
              {activeLearningLevels.map((level, index) => (
                <Card 
                  key={level.level}
                  className="glass-card border border-primary/30 p-4 slide-up"
                  style={{ animationDelay: `${100 + index * 75}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <span className="font-heading text-lg font-bold text-primary-foreground">{level.level}</span>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-heading font-semibold text-foreground mb-1">
                        Level {level.level}: {level.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-accent">+{level.coins} 🪙</span>
                        <span className="text-xs text-primary">+{level.xp} XP</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                    >
                      Start
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Passive Learning Tab */}
          <TabsContent value="passive" className="space-y-4">
            <div className="mb-4">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                Read & Learn
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Explore concepts at your own pace</p>
            </div>

            <div className="space-y-3">
              {[
                { chapter: 1, title: "Introduction to Money", duration: "5 min" },
                { chapter: 2, title: "Understanding Savings", duration: "7 min" },
                { chapter: 3, title: "Banking Basics", duration: "6 min" }
              ].map((item, index) => (
                <Card 
                  key={item.chapter}
                  className="glass-card border border-secondary/30 p-4 slide-up cursor-pointer hover:border-secondary/60"
                  style={{ animationDelay: `${100 + index * 75}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-secondary-foreground" />
                    </div>

                    <div className="flex-1">
                      <h4 className="font-heading font-semibold text-foreground">
                        Chapter {item.chapter}: {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">📖 {item.duration} read</p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gamified Learning Tab */}
          <TabsContent value="gamified" className="space-y-4">
            <div className="mb-4">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-accent" />
                Game Cards
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Learn through interactive games</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financeGames.map((game, index) => (
                <div
                  key={game.id}
                  className="slide-up"
                  style={{ animationDelay: `${100 + index * 50}ms` }}
                >
                  <GameCardComponent game={game} onPlay={handlePlayGame} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Game Intro Modal */}
      {selectedGame && (
        <GameIntroModal
          isOpen={showIntro}
          config={{
            ...selectedGame.introConfig,
            gameIcon: selectedGame.icon,
          }}
          onStartGame={handleStartGame}
          onGoBack={handleGoBack}
        />
      )}
    </AppLayout>
  );
}
