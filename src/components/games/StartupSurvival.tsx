import React, { useState } from "react";
import { ChevronRight, X } from "lucide-react";

interface GameState {
  phase: "splash" | "setup" | "playing" | "results" | "gameover";
  day: number;
  cash: number;
  inventory: number;
  costPerUnit: number;
  sellingPrice: number;
  dailyHistory: {
    day: number;
    cash: number;
    revenue: number;
    cost: number;
    profit: number;
    bottlesSold: number;
  }[];
  totalProfit: number;
  setupSubmitted: boolean;
  pendingPitch: boolean;
}

export function StartupSurvival({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<GameState>({
    phase: "splash",
    day: 1,
    cash: 500,
    inventory: 0,
    costPerUnit: 30,
    sellingPrice: 50,
    dailyHistory: [],
    totalProfit: 0,
    setupSubmitted: false,
    pendingPitch: false
  });

  const RENT_PER_DAY = 50;

  const calculateDemand = (price: number): number => {
    // Demand curve: higher price = lower demand
    const baseDemand = 50;
    const priceElasticity = -0.5; // Inelastic goods
    const demandMultiplier = Math.pow(1 + priceElasticity * ((price - 50) / 50), 2);
    return Math.max(5, Math.floor(baseDemand * demandMultiplier * (0.85 + Math.random() * 0.3)));
  };

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, phase: "setup" }));
  };

  const handleBuyInventory = (quantity: number) => {
    const cost = quantity * gameState.costPerUnit;
    if (cost > gameState.cash) {
      alert("❌ Not enough cash! You need ₹" + cost + " but have ₹" + gameState.cash);
      return;
    }

    setGameState(prev => ({
      ...prev,
      cash: prev.cash - cost,
      inventory: prev.inventory + quantity
    }));
  };

  const handleOperateDay = () => {
    if (!gameState.setupSubmitted) {
      alert("❌ Please set up your inventory first!");
      return;
    }

    const demand = calculateDemand(gameState.sellingPrice);
    const bottlesSold = Math.min(demand, gameState.inventory);
    const revenue = bottlesSold * gameState.sellingPrice;
    const costOfGoodsSold = gameState.inventory * gameState.costPerUnit;
    const profit = revenue - costOfGoodsSold - RENT_PER_DAY;
    const endCash = gameState.cash + profit;

    if (endCash < 0) {
      // Game over - out of cash
      setGameState(prev => ({
        ...prev,
        phase: "gameover",
        dailyHistory: [
          ...prev.dailyHistory,
          {
            day: prev.day,
            cash: endCash,
            revenue,
            cost: costOfGoodsSold + RENT_PER_DAY,
            profit,
            bottlesSold
          }
        ]
      }));
      return;
    }

    const newDay = gameState.day + 1;

    if (newDay > 7) {
      // Week complete - move to results
      setGameState(prev => ({
        ...prev,
        phase: "results",
        day: newDay,
        cash: endCash,
        totalProfit: prev.totalProfit + profit,
        inventory: 0,
        setupSubmitted: false,
        dailyHistory: [
          ...prev.dailyHistory,
          {
            day: prev.day,
            cash: endCash,
            revenue,
            cost: costOfGoodsSold + RENT_PER_DAY,
            profit,
            bottlesSold
          }
        ]
      }));
    } else {
      // Next day
      setGameState(prev => ({
        ...prev,
        day: newDay,
        cash: endCash,
        inventory: 0,
        setupSubmitted: false,
        totalProfit: prev.totalProfit + profit,
        dailyHistory: [
          ...prev.dailyHistory,
          {
            day: prev.day,
            cash: endCash,
            revenue,
            cost: costOfGoodsSold + RENT_PER_DAY,
            profit,
            bottlesSold
          }
        ]
      }));
    }

    setGameState(prev => ({ ...prev, pendingPitch: true }));
    setTimeout(() => setGameState(prev => ({ ...prev, pendingPitch: false })), 2000);
  };

  const handleSubmitSetup = () => {
    if (gameState.inventory === 0) {
      alert("❌ You need to buy some inventory to sell!");
      return;
    }
    setGameState(prev => ({ ...prev, setupSubmitted: true }));
  };

  const getDemandForecast = (price: number): string => {
    if (price <= 25) return "🤩 Very High Demand: ~60+ customers";
    if (price <= 50) return "😊 Good Demand: ~40-50 customers";
    if (price <= 75) return "😐 Moderate Demand: ~20-30 customers";
    return "😞 Low Demand: ~5-10 customers";
  };

  const handleExitGame = () => {
    onComplete(0);
  };

  // ===== RENDER: SPLASH SCREEN =====
  if (gameState.phase === "splash") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-accent/20 to-card rounded-3xl border border-accent/50 p-8 max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Startup Survival</h2>
            <p className="text-sm text-muted-foreground">Can you keep your business alive?</p>
          </div>

          <div className="space-y-4 bg-card/50 rounded-xl p-4 border border-border/50">
            <div>
              <h3 className="font-heading font-semibold text-accent mb-2">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">You can make sales but still fail if you don't manage money wisely</p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-primary mb-2">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">Run a juice stall for 7 days. Buy inventory, set price, manage cash. Will you survive?</p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-secondary mb-2">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">Stay cash-positive for all 7 days. Higher profit = higher score!</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStartGame}
              className="flex-1 py-3 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-semibold rounded-lg transition-all"
            >
              ▶ Start Game
            </button>
            <button
              onClick={handleExitGame}
              className="px-4 py-3 bg-card border border-border text-muted-foreground hover:border-primary/50 rounded-lg transition-all"
            >
              ❌
            </button>
          </div>

          <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
            "Cash flow matters more than profit; a business dies when it runs out of cash."
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: SETUP PHASE =====
  if (gameState.phase === "setup") {
    const costOfInventory = gameState.inventory * gameState.costPerUnit;

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-background/80 flex flex-col p-4 overflow-auto">
        <div className="max-w-2xl mx-auto w-full space-y-6 py-6">
          {/* Header */}
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground">🍹 Day {gameState.day} Setup</h2>
            <p className="text-sm text-muted-foreground">Plan your day carefully</p>
          </div>

          {/* Cash Display */}
          <div className="glass-card rounded-xl border border-accent/50 p-6 bg-accent/10">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">💰 ₹{gameState.cash}</div>
              <div className="text-sm text-muted-foreground">Available Cash</div>
            </div>
          </div>

          {/* Cost Per Unit Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">Cost per bottle: ₹{gameState.costPerUnit}</label>
              <span className="text-xs text-muted-foreground">(affects profit margin)</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={gameState.costPerUnit}
              onChange={(e) => setGameState(prev => ({ ...prev, costPerUnit: parseInt(e.target.value) }))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-muted-foreground">Lower cost = better margins but might signal poor quality</div>
          </div>

          {/* Selling Price Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">Selling price: ₹{gameState.sellingPrice}</label>
              <span className="text-xs text-muted-foreground">(affects demand)</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="10"
              value={gameState.sellingPrice}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
              onChange={(e) => setGameState(prev => ({ ...prev, sellingPrice: parseInt(e.target.value) }))}
            />
            <div className="text-xs text-muted-foreground">{getDemandForecast(gameState.sellingPrice)}</div>
          </div>

          {/* Inventory Buying */}
          <div className="space-y-3">
            <label className="font-semibold text-foreground">Buy bottles:</label>
            <div className="flex gap-2">
              {[5, 10, 20, 30].map(qty => (
                <button
                  key={qty}
                  onClick={() => handleBuyInventory(qty)}
                  disabled={qty * gameState.costPerUnit > gameState.cash}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                    qty * gameState.costPerUnit > gameState.cash
                      ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                      : "bg-card border border-border hover:border-primary/50"
                  }`}
                >
                  {qty}x
                  <br />₹{qty * gameState.costPerUnit}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              📦 Current inventory: {gameState.inventory} bottles
              {gameState.inventory > 0 && (
                <span className="ml-2">
                  (₹{costOfInventory} invested)
                </span>
              )}
            </div>
          </div>

          {/* Summary */}
          {gameState.inventory > 0 && (
            <div className="glass-card rounded-xl border border-border/50 p-4 space-y-2">
              <h4 className="font-heading font-semibold text-foreground">Day Summary (forecast):</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected customers:</span>
                  <span className="font-medium text-foreground">{calculateDemand(gameState.sellingPrice)}+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bottles to sell:</span>
                  <span className="font-medium text-foreground">~{Math.min(calculateDemand(gameState.sellingPrice), gameState.inventory)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected revenue:</span>
                  <span className="font-medium text-secondary">₹{Math.min(calculateDemand(gameState.sellingPrice), gameState.inventory) * gameState.sellingPrice}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1">
                  <span className="text-muted-foreground">Costs (inventory + rent):</span>
                  <span className="font-medium text-destructive">₹{costOfInventory + RENT_PER_DAY}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmitSetup}
              disabled={gameState.inventory === 0}
              className="flex-1 py-3 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 disabled:opacity-50 text-secondary-foreground font-semibold rounded-lg transition-all"
            >
              ✅ Ready to Operate
            </button>
          </div>

          <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
            "Cash flow matters more than profit; a business dies when it runs out of cash."
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: OPERATING PHASE =====
  if (gameState.phase === "playing" || gameState.setupSubmitted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-background/80 flex flex-col p-4 overflow-auto">
        <div className="max-w-2xl mx-auto w-full space-y-6 py-6">
          {/* Day Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">☀️ Day {gameState.day}</h2>
              <p className="text-sm text-muted-foreground">Operating your juice stall...</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent">💰 ₹{gameState.cash}</div>
              <div className="text-xs text-muted-foreground">Cash</div>
            </div>
          </div>

          {/* Inventory Display */}
          {!gameState.setupSubmitted && (
            <div className="glass-card rounded-xl border border-primary/50 p-6 bg-primary/10">
              <div className="text-center">
                <div className="text-4xl mb-2">🧃</div>
                <div className="text-3xl font-bold text-foreground">{gameState.inventory} bottles</div>
                <div className="text-sm text-muted-foreground mt-2">Selling at ₹{gameState.sellingPrice} each</div>
              </div>
            </div>
          )}

          {/* Operating Display */}
          {gameState.setupSubmitted && !gameState.pendingPitch && (
            <div className="space-y-4">
              <button
                onClick={handleOperateDay}
                className="w-full py-4 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-bold text-lg rounded-lg transition-all"
              >
                ▶️ Run the Day
              </button>

              <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
                Review your setup and run the day!
              </div>
            </div>
          )}

          {/* Day Result */}
          {gameState.pendingPitch && gameState.dailyHistory.length > 0 && (
            <div className="glass-card rounded-xl border border-secondary/50 p-6 bg-secondary/10 space-y-4">
              <h3 className="font-heading font-semibold text-foreground text-lg">📊 Day Result</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">👥 Customers arrived:</span>
                  <span className="font-bold text-foreground">{gameState.dailyHistory[gameState.dailyHistory.length - 1].bottlesSold} buyers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">🧃 Bottles sold:</span>
                  <span className="font-bold text-foreground">{gameState.dailyHistory[gameState.dailyHistory.length - 1].bottlesSold}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">💵 Revenue:</span>
                  <span className="font-bold text-secondary">₹{gameState.dailyHistory[gameState.dailyHistory.length - 1].revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">💳 Total costs:</span>
                  <span className="font-bold text-destructive">₹{gameState.dailyHistory[gameState.dailyHistory.length - 1].cost}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">📈 Day profit:</span>
                  <span className={`font-bold ${gameState.dailyHistory[gameState.dailyHistory.length - 1].profit >= 0 ? "text-secondary" : "text-destructive"}`}>
                    ₹{gameState.dailyHistory[gameState.dailyHistory.length - 1].profit}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setGameState(prev => ({ ...prev, phase: "setup", setupSubmitted: false }))}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold rounded-lg transition-all mt-4"
              >
                Next Day {gameState.day < 7 ? `(${gameState.day}/7)` : "(Final)"}
              </button>
            </div>
          )}

          {/* Cash Warning */}
          {gameState.cash < 300 && gameState.cash > 0 && (
            <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3 text-sm">
              <span className="font-semibold text-destructive">⚠️ WARNING: Low Cash!</span>
              <p className="text-destructive text-xs mt-1">You need to make smart decisions or you'll run out!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== RENDER: GAME OVER =====
  if (gameState.phase === "gameover") {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="font-heading text-3xl font-bold text-destructive">You're Broke!</h2>
            <p className="text-sm text-muted-foreground mt-2">You ran out of cash on Day {gameState.day}</p>
          </div>

          <div className="glass-card rounded-xl border border-destructive/50 p-6 space-y-4 bg-destructive/10">
            <h3 className="font-heading font-semibold text-foreground">What happened?</h3>
            <p className="text-sm text-muted-foreground">
              You spent too much on inventory but didn't have enough customers. This is the real challenge of new businesses - managing cash flow while building up your customer base.
            </p>

            {gameState.dailyHistory.length > 0 && (
              <div className="space-y-2 bg-card/50 p-3 rounded-lg">
                <div className="text-xs font-semibold text-foreground">Final Day ({gameState.day}):</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>💰 Cash before: ₹{gameState.dailyHistory[gameState.dailyHistory.length - 1].cash + gameState.dailyHistory[gameState.dailyHistory.length - 1].profit}</div>
                  <div>💔 Loss: -₹{Math.abs(gameState.dailyHistory[gameState.dailyHistory.length - 1].profit)}</div>
                  <div>💀 Cash after: ₹{gameState.dailyHistory[gameState.dailyHistory.length - 1].cash}</div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onComplete(0)}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold rounded-lg transition-all"
          >
            Return to Gamified Learning
          </button>

          <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
            "This is how real businesses fail - not from bad ideas, but from bad cash management."
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: RESULTS =====
  if (gameState.phase === "results") {
    const finalScore = Math.min(500, gameState.totalProfit);

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Week Complete!</h2>
          </div>

          <div className="glass-card rounded-xl border border-secondary/50 p-6 space-y-4 bg-secondary/10">
            <div className="space-y-3">
              {gameState.dailyHistory.slice(0, 3).map((day) => (
                <div key={day.day} className="flex items-center justify-between p-2 bg-card/50 rounded text-xs">
                  <span className="text-muted-foreground">Day {day.day}:</span>
                  <span className={`font-bold ${day.profit >= 0 ? "text-secondary" : "text-destructive"}`}>
                    {day.profit >= 0 ? "+" : ""}₹{day.profit}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total Profit:</span>
                  <span className="text-2xl font-bold text-secondary">₹{gameState.totalProfit}</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary/20 border border-secondary/50 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground">
                ✅ <strong>You survived! Cash flow management is critical.</strong>
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
              <span className="text-foreground font-semibold">Final Score:</span>
              <span className="text-2xl font-bold text-primary">{finalScore} XP</span>
            </div>
          </div>

          <button
            onClick={() => onComplete(finalScore)}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold rounded-lg transition-all"
          >
            Finish Game
          </button>

          <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
            "Cash flow matters more than profit; a business dies when it runs out of cash."
          </div>
        </div>
      </div>
    );
  }

  return null;
}
