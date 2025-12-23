import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface GroceryItem {
  name: string;
  emoji: string;
  pricePerKg: number;
}

interface GroceryLevel {
  itemsToBuy: Array<{ item: GroceryItem; targetWeight: number }>;
  walletAmount: number;
  tolerance: number; // Price tolerance in rupees
}

interface GameState {
  weights: Record<string, number>;
  selectedItem: string | null;
  totalPrice: number;
  paymentAmount: number;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
}

export function GroceryMarket({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    weights: {},
    selectedItem: null,
    totalPrice: 0,
    paymentAmount: 0,
    isFullscreen: false,
    gameResult: "none",
  });

  const items: Record<string, GroceryItem> = {
    rice: { name: "Rice", emoji: "🍚", pricePerKg: 40 },
    wheat: { name: "Wheat", emoji: "🌾", pricePerKg: 30 },
    sugar: { name: "Sugar", emoji: "🍯", pricePerKg: 50 },
  };

  const levels: GroceryLevel[] = [
    {
      itemsToBuy: [{ item: items.rice, targetWeight: 1.5 }],
      walletAmount: 100,
      tolerance: 0.5,
    },
    {
      itemsToBuy: [{ item: items.wheat, targetWeight: 2 }],
      walletAmount: 100,
      tolerance: 0.5,
    },
    {
      itemsToBuy: [
        { item: items.rice, targetWeight: 1.5 },
        { item: items.sugar, targetWeight: 1 },
      ],
      walletAmount: 200,
      tolerance: 0.5,
    },
    {
      itemsToBuy: [
        { item: items.rice, targetWeight: 2 },
        { item: items.wheat, targetWeight: 1.5 },
        { item: items.sugar, targetWeight: 0.5 },
      ],
      walletAmount: 250,
      tolerance: 0.5,
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    if (gameStarted && currentLevel < levels.length) {
      const initialWeights: Record<string, number> = {};
      level.itemsToBuy.forEach((item) => {
        initialWeights[item.item.name.toLowerCase()] = 0;
      });
      setGameState({
        weights: initialWeights,
        selectedItem: null,
        totalPrice: 0,
        paymentAmount: 0,
        isFullscreen: false,
        gameResult: "none",
      });
    }
  }, [currentLevel, gameStarted]);

  const calculatePrice = (weights: Record<string, number>) => {
    let total = 0;
    level.itemsToBuy.forEach((item) => {
      const weight = weights[item.item.name.toLowerCase()] || 0;
      total += weight * item.item.pricePerKg;
    });
    return Math.round(total * 100) / 100;
  };

  const handleAddWeight = (itemName: string, amount: number) => {
    if (gameState.gameResult !== "none") return;

    const newWeights = { ...gameState.weights };
    newWeights[itemName] = (newWeights[itemName] || 0) + amount;
    newWeights[itemName] = Math.round(newWeights[itemName] * 100) / 100; // Fix floating point

    const newPrice = calculatePrice(newWeights);
    setGameState({
      ...gameState,
      weights: newWeights,
      totalPrice: newPrice,
    });
  };

  const handlePayment = (amount: number) => {
    if (gameState.gameResult !== "none") return;

    setGameState({
      ...gameState,
      paymentAmount: amount,
    });

    // Check if payment is exact
    const difference = Math.abs(gameState.totalPrice - amount);
    if (difference <= level.tolerance && amount >= gameState.totalPrice) {
      setGameState((prev) => ({
        ...prev,
        gameResult: "won",
      }));
    } else if (amount < gameState.totalPrice) {
      setGameState((prev) => ({
        ...prev,
        gameResult: "lost",
      }));
    } else if (difference > level.tolerance) {
      setGameState((prev) => ({
        ...prev,
        gameResult: "lost",
      }));
    }
  };

  const handleRetry = () => {
    const initialWeights: Record<string, number> = {};
    level.itemsToBuy.forEach((item) => {
      initialWeights[item.item.name.toLowerCase()] = 0;
    });
    setGameState({
      weights: initialWeights,
      selectedItem: null,
      totalPrice: 0,
      paymentAmount: 0,
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
    });
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScore(score + 60);
    } else {
      setGameStarted(false);
    }
  };

  const toggleFullscreen = () => {
    setGameState({
      ...gameState,
      isFullscreen: !gameState.isFullscreen,
    });
  };

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🛒 Grocery Market</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">💰 Concept: Money & Measurement</h3>
              <p className="text-sm text-muted-foreground">
                Real-world math with decimals and money transactions.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 Task: Buy Items with Exact Money</h3>
              <p className="text-sm text-muted-foreground">
                Weigh items correctly and pay the exact amount. The shopkeeper only accepts precise payments!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 Outcome: Learn Real-World Math Accuracy</h3>
              <p className="text-sm text-muted-foreground">
                Master decimal math and understand how prices work in daily shopping.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={onClose} variant="outline" className="flex-1">
                ❌ Go Back
              </Button>
              <Button onClick={() => setGameStarted(true)} className="flex-1">
                ▶️ Start Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const GameplayUI = () => (
    <div className="space-y-6">
      {/* Shop Counter */}
      <div className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">🏪</div>
        <h3 className="font-bold text-lg">Village Grocery Shop</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Weigh items on the scale → Pay the exact amount
        </p>
      </div>

      {/* Items to Buy */}
      <div className="space-y-3">
        <div className="text-sm font-semibold">📦 Items to Buy</div>
        {level.itemsToBuy.map((item) => {
          const currentWeight = gameState.weights[item.item.name.toLowerCase()] || 0;
          const itemPrice = currentWeight * item.item.pricePerKg;
          const isComplete = Math.abs(currentWeight - item.targetWeight) <= 0.1;

          return (
            <div key={item.item.name} className="bg-card border-2 border-muted rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{item.item.emoji}</span>
                  <div>
                    <div className="font-semibold">{item.item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ₹{item.item.pricePerKg}/kg
                    </div>
                  </div>
                </div>
                {isComplete && <span className="text-xl">✅</span>}
              </div>

              {/* Scale Display */}
              <div className="bg-muted rounded p-3 mb-3 text-center">
                <div className="text-sm text-muted-foreground mb-1">⚖️ Weight on Scale</div>
                <div className="text-2xl font-bold text-secondary">
                  {currentWeight.toFixed(2)} kg
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Target: {item.targetWeight} kg
                </div>
              </div>

              {/* Price Display */}
              <div className="flex justify-between items-center mb-3 bg-badge/20 rounded p-2">
                <span className="text-sm font-semibold">Price for this item:</span>
                <span className="font-bold text-badge">₹{itemPrice.toFixed(2)}</span>
              </div>

              {/* Weight Controls */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleAddWeight(item.item.name.toLowerCase(), 0.1)}
                  disabled={gameState.gameResult !== "none"}
                  className="bg-secondary hover:bg-secondary/80 text-white font-bold py-2 rounded disabled:opacity-50"
                >
                  +0.1
                </button>
                <button
                  onClick={() => handleAddWeight(item.item.name.toLowerCase(), 0.5)}
                  disabled={gameState.gameResult !== "none"}
                  className="bg-secondary hover:bg-secondary/80 text-white font-bold py-2 rounded disabled:opacity-50"
                >
                  +0.5
                </button>
                <button
                  onClick={() => handleAddWeight(item.item.name.toLowerCase(), 1)}
                  disabled={gameState.gameResult !== "none"}
                  className="bg-secondary hover:bg-secondary/80 text-white font-bold py-2 rounded disabled:opacity-50"
                >
                  +1.0
                </button>
                <button
                  onClick={() => {
                    const newWeights = { ...gameState.weights };
                    newWeights[item.item.name.toLowerCase()] = 0;
                    const newPrice = calculatePrice(newWeights);
                    setGameState({
                      ...gameState,
                      weights: newWeights,
                      totalPrice: newPrice,
                    });
                  }}
                  disabled={gameState.gameResult !== "none"}
                  className="bg-destructive hover:bg-destructive/80 text-white font-bold py-2 rounded disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Price */}
      <div className="bg-gradient-to-r from-badge to-purple-600 rounded-lg p-6 text-center">
        <div className="text-sm text-white/80 mb-2">💰 Total Cost</div>
        <div className="text-5xl font-bold text-white">₹{gameState.totalPrice.toFixed(2)}</div>
        <div className="text-xs text-white/80 mt-2">Wallet: ₹{level.walletAmount}</div>
      </div>

      {/* Payment */}
      <div className="space-y-2">
        <div className="text-sm font-semibold">🪙 Payment Options</div>
        <div className="grid grid-cols-4 gap-2">
          {[10, 20, 50, 100, 200, 500].map((note) => (
            <button
              key={note}
              onClick={() => handlePayment(note)}
              disabled={gameState.gameResult !== "none" || note > level.walletAmount}
              className={`p-2 rounded font-bold text-white transition ${
                note === gameState.paymentAmount
                  ? "bg-accent scale-110"
                  : "bg-secondary hover:bg-secondary/80"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ₹{note}
            </button>
          ))}
        </div>
      </div>

      {/* Game Result */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            Perfect Payment!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Shopkeeper smiles and gives you the items!
          </p>
        </div>
      )}

      {gameState.gameResult === "lost" && (
        <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-center border-2 border-red-500">
          <div className="text-4xl mb-2">❌</div>
          <div className="font-bold text-lg text-red-800 dark:text-red-200">
            Payment Rejected!
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {gameState.paymentAmount < gameState.totalPrice
              ? "You didn't pay enough."
              : "That's too much or not exact enough!"}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {gameState.gameResult === "none" && (
          <Button onClick={handleRetry} variant="outline" className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
        {gameState.gameResult !== "none" && (
          <>
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              Try Again
            </Button>
            {gameState.gameResult === "won" && currentLevel < levels.length - 1 && (
              <Button onClick={nextLevel} className="flex-1">
                Next Level →
              </Button>
            )}
            {gameState.gameResult === "won" && currentLevel === levels.length - 1 && (
              <Button onClick={() => setGameStarted(false)} className="flex-1">
                Finish Game
              </Button>
            )}
          </>
        )}
      </div>

      {/* Info Strip */}
      <div className="bg-muted rounded-lg p-3 text-center text-sm font-semibold text-muted-foreground">
        💡 "Decimal math connects money to everyday shopping!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-badge">
            🛒 Grocery Market - Level {currentLevel + 1}/{levels.length}
          </h2>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full">
          <GameplayUI />
        </div>
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>🛒 Grocery Market - Level {currentLevel + 1}/{levels.length}</DialogTitle>
              <div className="flex gap-4 mt-4 text-sm">
                <div>
                  Score: <span className="font-bold text-badge">{score}</span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-muted rounded-lg transition"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <GameplayUI />
      </DialogContent>
    </Dialog>
  );
}
