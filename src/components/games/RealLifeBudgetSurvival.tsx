import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Home, Utensils, BookOpen, Heart } from "lucide-react";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: "fixed" | "random";
  icon: string;
  reason: string;
}

interface GameState {
  day: number;
  salary: number;
  wallet: number;
  savings: number;
  status: "playing" | "won" | "lost";
  decisions: Record<string, "paid" | "delayed" | "skipped">;
  stressLevel: number;
}

const fixedExpenses: Expense[] = [
  { id: "rent", name: "Rent", amount: 1500, category: "fixed", icon: "🏠", reason: "Monthly shelter" },
  { id: "food", name: "Food", amount: 800, category: "fixed", icon: "🍲", reason: "Daily meals" },
  { id: "school", name: "School Fees", amount: 500, category: "fixed", icon: "📚", reason: "Education" },
];

const randomEvents: Expense[] = [
  { id: "phone", name: "Phone Repair", amount: 300, category: "random", icon: "📱", reason: "Broke my phone" },
  { id: "birthday", name: "Friend's Birthday Gift", amount: 200, category: "random", icon: "🎉", reason: "Party coming up" },
  { id: "medical", name: "Medical Bill", amount: 400, category: "random", icon: "💊", reason: "Doctor visit" },
];

export function RealLifeBudgetSurvival({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    salary: 3000,
    wallet: 3000,
    savings: 0,
    status: "playing",
    decisions: {},
    stressLevel: 0,
  });

  const [todayRandom, setTodayRandom] = useState<Expense | null>(null);
  const [message, setMessage] = useState("");
  const [showDecision, setShowDecision] = useState<string | null>(null);

  // Generate random event for this day
  useEffect(() => {
    if (gameState.status === "playing" && Math.random() > 0.6) {
      setTodayRandom(randomEvents[Math.floor(Math.random() * randomEvents.length)]);
    }
  }, [gameState.day]);

  const expenses = [...fixedExpenses, ...(todayRandom ? [todayRandom] : [])];
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const canPayAll = gameState.wallet >= totalFixed;

  const handlePayExpense = (expense: Expense) => {
    const key = `${gameState.day}-${expense.id}`;
    if (gameState.decisions[key]) return;

    const newWallet = gameState.wallet - expense.amount;
    const newSavings = Math.max(0, newWallet);
    const newStress = expense.category === "fixed" ? gameState.stressLevel : gameState.stressLevel + 10;

    setGameState({
      ...gameState,
      wallet: newWallet,
      savings: newSavings,
      decisions: { ...gameState.decisions, [key]: "paid" },
      stressLevel: newStress,
    });

    setMessage(`✅ Paid ₹${expense.amount} for ${expense.name}`);
    setTimeout(() => setMessage(""), 1500);
  };

  const handleDelayExpense = (expense: Expense) => {
    const key = `${gameState.day}-${expense.id}`;
    if (gameState.decisions[key]) return;

    setGameState({
      ...gameState,
      decisions: { ...gameState.decisions, [key]: "delayed" },
      stressLevel: gameState.stressLevel + 20,
    });

    setMessage(`⏰ Delayed ₹${expense.amount} - adds stress!`);
    setTimeout(() => setMessage(""), 1500);
  };

  const handleSkipExpense = (expense: Expense) => {
    const key = `${gameState.day}-${expense.id}`;
    if (gameState.decisions[key]) return;

    if (expense.category === "fixed") {
      setMessage("❌ Can't skip necessities!");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    setGameState({
      ...gameState,
      decisions: { ...gameState.decisions, [key]: "skipped" },
    });

    setMessage(`💰 Skipped unnecessary expense!`);
    setTimeout(() => setMessage(""), 1500);
  };

  const handleEndDay = () => {
    const paidFixed = fixedExpenses.every((e) => gameState.decisions[`${gameState.day}-${e.id}`] === "paid");

    if (!paidFixed) {
      setMessage("⚠️ Must pay all essential expenses!");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    if (gameState.day === 30) {
      // Check win condition
      if (gameState.wallet >= 500) {
        setGameState({ ...gameState, status: "won" });
      } else {
        setGameState({ ...gameState, status: "lost" });
      }
    } else {
      setGameState({
        ...gameState,
        day: gameState.day + 1,
        decisions: {},
      });
      setTodayRandom(null);
      setShowDecision(null);
    }
  };

  const progress = (gameState.day / 30) * 100;
  const allDecided = fixedExpenses.every((e) => gameState.decisions[`${gameState.day}-${e.id}`]);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-primary/5 via-accent/5 to-background p-8 gap-8 overflow-auto">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">🏡 Real Life Budget Survival</h2>
          <div className="text-right">
            <div className="text-sm font-medium text-muted-foreground">Day {gameState.day}/30</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-card rounded-full overflow-hidden shadow-sm">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Wallet Status */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-3 gap-4">
        <Card className="glass-card border border-accent/40 p-5 rounded-xl hover:border-accent/60 transition-colors flex flex-col">
          <p className="text-xs font-medium text-muted-foreground mb-3">Monthly Salary</p>
          <p className="text-3xl font-bold text-accent text-right">₹{gameState.salary}</p>
        </Card>
        <Card className="glass-card border border-primary/40 p-5 rounded-xl hover:border-primary/60 transition-colors flex flex-col">
          <p className="text-xs font-medium text-muted-foreground mb-3">Current Wallet</p>
          <p className="text-3xl font-bold text-primary text-right">₹{gameState.wallet}</p>
        </Card>
        <Card className="glass-card border border-secondary/40 p-5 rounded-xl hover:border-secondary/60 transition-colors flex flex-col">
          <p className="text-xs font-medium text-muted-foreground mb-3">Potential Savings</p>
          <p className={`text-3xl font-bold text-right ${gameState.wallet >= 500 ? "text-secondary" : "text-destructive"}`}>
            ₹{Math.max(0, gameState.wallet - 1900)}
          </p>
        </Card>
      </div>

      {/* Messages */}
      {message && (
        <div className="max-w-4xl mx-auto w-full p-4 bg-primary/20 border border-primary/50 rounded-xl text-sm text-foreground animate-in fade-in font-medium">
          {message}
        </div>
      )}

      {/* Expenses Grid */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-5">
        {expenses.map((expense) => {
          const key = `${gameState.day}-${expense.id}`;
          const decision = gameState.decisions[key];
          const icon = expense.icon;

          return (
            <Card
              key={expense.id}
              className={`glass-card border p-5 rounded-xl transition-all ${
                decision
                  ? decision === "paid"
                    ? "border-secondary/50 bg-secondary/5"
                    : decision === "delayed"
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : "border-green-500/50 bg-green-500/5"
                  : "border-border/60 hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-4xl">{icon}</div>
                <span className={`text-xs px-2 py-1 rounded ${expense.category === "fixed" ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-600"}`}>
                  {expense.category === "fixed" ? "Essential" : "Unexpected"}
                </span>
              </div>

              <h3 className="font-semibold text-foreground mb-1">{expense.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{expense.reason}</p>

              <div className="text-lg font-bold text-accent mb-3">₹{expense.amount}</div>

              {!decision ? (
                <div className="space-y-2">
                  <Button
                    size="sm"
                    onClick={() => handlePayExpense(expense)}
                    disabled={gameState.wallet < expense.amount}
                    className="w-full bg-secondary hover:bg-secondary/90"
                  >
                    Pay Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelayExpense(expense)}
                    className="w-full"
                  >
                    Delay (adds stress)
                  </Button>
                  {expense.category === "random" && (
                    <Button size="sm" variant="ghost" onClick={() => handleSkipExpense(expense)} className="w-full">
                      Skip
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {decision === "paid" && "✅ Paid"}
                  {decision === "delayed" && "⏰ Delayed"}
                  {decision === "skipped" && "✂️ Skipped"}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* End Day Button */}
      {allDecided && (
        <div className="max-w-4xl mx-auto w-full">
          <Button
            onClick={handleEndDay}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 py-6 text-base font-semibold rounded-xl"
          >
            {gameState.day === 30 ? "See Results" : "End Day & Continue →"}
          </Button>
        </div>
      )}

      {/* Win/Loss State */}
      {gameState.status === "won" && (
        <Card className="max-w-4xl mx-auto w-full glass-card border border-secondary/40 bg-secondary/10 p-8 rounded-2xl">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-10 h-10 text-secondary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-3">🎉 You Survived!</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                You managed your budget wisely and ended with ₹{gameState.wallet} in savings!
              </p>
              <Button onClick={() => onComplete(100)} className="w-full bg-secondary hover:bg-secondary/90 py-6 text-base font-semibold rounded-xl">
                Finish & Celebrate
              </Button>
            </div>
          </div>
        </Card>
      )}

      {gameState.status === "lost" && (
        <Card className="max-w-4xl mx-auto w-full glass-card border border-destructive/40 bg-destructive/10 p-8 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-10 h-10 text-destructive mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-3">💔 Better Luck Next Time</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                You ended with ₹{gameState.wallet}. To win, you need ₹500 saved after paying essentials. Try again!
              </p>
              <Button onClick={() => window.location.reload()} className="w-full bg-destructive/20 hover:bg-destructive/30 text-destructive py-6 text-base font-semibold rounded-xl border border-destructive/50">
                Retry
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
