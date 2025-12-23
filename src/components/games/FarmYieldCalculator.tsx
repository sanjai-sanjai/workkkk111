import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize2, X } from "lucide-react";

interface FarmLevel {
  targetYield: number;
  idealFieldSize: number;
  idealSeeds: number;
  idealWater: number;
  tolerance: number;
}

interface GameState {
  fieldSize: number;
  seeds: number;
  water: number;
  yield: number;
  isFullscreen: boolean;
  gameResult: "none" | "won" | "lost";
}

export function FarmYieldCalculator({ onClose }: { onClose: () => void }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    fieldSize: 5,
    seeds: 50,
    water: 50,
    yield: 0,
    isFullscreen: false,
    gameResult: "none",
  });

  const levels: FarmLevel[] = [
    {
      targetYield: 500,
      idealFieldSize: 5,
      idealSeeds: 100,
      idealWater: 75,
      tolerance: 50,
    },
    {
      targetYield: 1200,
      idealFieldSize: 10,
      idealSeeds: 200,
      idealWater: 80,
      tolerance: 100,
    },
    {
      targetYield: 2000,
      idealFieldSize: 15,
      idealSeeds: 300,
      idealWater: 85,
      tolerance: 150,
    },
  ];

  const level = levels[currentLevel];

  useEffect(() => {
    calculateYield(gameState.fieldSize, gameState.seeds, gameState.water);
  }, [gameState.fieldSize, gameState.seeds, gameState.water]);

  const calculateYield = (fieldSize: number, seeds: number, water: number) => {
    // Formula: Yield = fieldSize × (seeds/100) × (water/100) × 100
    const yieldAmount = Math.round((fieldSize * seeds * water) / 100);
    setGameState((prev) => ({
      ...prev,
      yield: yieldAmount,
    }));
  };

  const checkSuccess = () => {
    const difference = Math.abs(gameState.yield - level.targetYield);
    const targetMet = difference <= level.tolerance;

    if (targetMet) {
      setGameState((prev) => ({
        ...prev,
        gameResult: "won",
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        gameResult: "lost",
      }));
    }
  };

  const handleReset = () => {
    setGameState({
      fieldSize: 5,
      seeds: 50,
      water: 50,
      yield: 0,
      isFullscreen: gameState.isFullscreen,
      gameResult: "none",
    });
  };

  const handleRetry = () => {
    handleReset();
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setScore(score + 85);
      handleReset();
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

  const yieldPercentage = Math.round((gameState.yield / level.targetYield) * 100);
  const isOptimal = yieldPercentage >= 90 && yieldPercentage <= 110;
  const isTooLow = yieldPercentage < 90;

  if (!gameStarted) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🌾 Farm Yield Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold">📈 Concept: Multiplication, Ratios & Estimation</h3>
              <p className="text-sm text-muted-foreground">
                Control field size, seeds, and water to maximize crop yield.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🎯 How to Play</h3>
              <p className="text-sm text-muted-foreground">
                Adjust sliders to optimize inputs. Your yield depends on the math you choose!
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🏆 Why It's Powerful</h3>
              <p className="text-sm text-muted-foreground">
                Shows math as decision-based and teaches cause → effect relationships.
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
      {/* Target Display */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg p-6 border-2 border-green-500">
        <div className="text-center mb-3">
          <div className="text-sm font-semibold text-muted-foreground">🎯 Target Yield</div>
          <div className="text-4xl font-bold text-green-700 dark:text-green-300">
            {level.targetYield} 🌾
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Acceptable range: {level.targetYield - level.tolerance} - {level.targetYield + level.tolerance}
        </div>
      </div>

      {/* Farm Field Visualization */}
      <div className="bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg p-6">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🌾</div>
          <div className="text-sm font-semibold text-muted-foreground">
            Your Farm (Field Size: {gameState.fieldSize})
          </div>
        </div>

        {/* Field Growth Visualization */}
        <div className="flex justify-center gap-1 flex-wrap">
          {Array(Math.round(gameState.fieldSize / 2))
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                  gameState.water > 50
                    ? "bg-green-500 text-white text-lg scale-100"
                    : "bg-amber-500 text-white text-lg scale-75"
                }`}
              >
                {gameState.water > 50 ? "🌱" : "🍂"}
              </div>
            ))}
        </div>
      </div>

      {/* Yield Display */}
      <div
        className={`rounded-lg p-6 text-center border-2 transition-all ${
          isOptimal
            ? "bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 border-green-500"
            : isTooLow
              ? "bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 border-red-500"
              : "bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 border-yellow-500"
        }`}
      >
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          📊 Current Yield
        </div>
        <div className="text-4xl font-bold mb-2">
          {gameState.yield} 🌾
        </div>
        <div className="text-sm font-semibold">
          {yieldPercentage}% of target
        </div>
        {isOptimal && (
          <div className="text-sm text-green-700 dark:text-green-300 mt-2">
            ✅ Perfect balance!
          </div>
        )}
        {isTooLow && (
          <div className="text-sm text-red-700 dark:text-red-300 mt-2">
            ❌ Need more growth
          </div>
        )}
        {!isOptimal && !isTooLow && (
          <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
            ⚠️ Close but not quite
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4 bg-card rounded-lg p-4 border border-muted">
        {/* Field Size */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold">🌾 Field Size</label>
            <span className="text-lg font-bold text-badge">{gameState.fieldSize} sq units</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={gameState.fieldSize}
            onChange={(e) =>
              setGameState({
                ...gameState,
                fieldSize: parseInt(e.target.value),
              })
            }
            disabled={gameState.gameResult !== "none"}
            className="w-full h-2 bg-gradient-to-r from-red-400 to-green-400 rounded cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-muted-foreground text-right">
            Min 1 | Max 20
          </div>
        </div>

        {/* Seeds */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold">🌱 Seeds Count</label>
            <span className="text-lg font-bold text-badge">{gameState.seeds}</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={gameState.seeds}
            onChange={(e) =>
              setGameState({
                ...gameState,
                seeds: parseInt(e.target.value),
              })
            }
            disabled={gameState.gameResult !== "none"}
            className="w-full h-2 bg-gradient-to-r from-amber-400 to-green-400 rounded cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-muted-foreground text-right">
            Min 10 | Max 500
          </div>
        </div>

        {/* Water */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold">💧 Water Level</label>
            <span className="text-lg font-bold text-badge">{gameState.water}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={gameState.water}
            onChange={(e) =>
              setGameState({
                ...gameState,
                water: parseInt(e.target.value),
              })
            }
            disabled={gameState.gameResult !== "none"}
            className="w-full h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded cursor-pointer disabled:opacity-50"
          />
          <div className="text-xs text-muted-foreground text-right">
            Min 10 | Max 100
          </div>
        </div>
      </div>

      {/* Stats Box */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Ideal Field</div>
          <div className="font-bold text-badge">{level.idealFieldSize}</div>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Ideal Seeds</div>
          <div className="font-bold text-badge">{level.idealSeeds}</div>
        </div>
        <div className="bg-muted rounded-lg p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Ideal Water</div>
          <div className="font-bold text-badge">{level.idealWater}%</div>
        </div>
      </div>

      {/* Game Result */}
      {gameState.gameResult === "won" && (
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 text-center border-2 border-green-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            Harvest Success!
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Your yield reached {gameState.yield} bushels!
          </p>
        </div>
      )}

      {gameState.gameResult === "lost" && (
        <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-center border-2 border-red-500">
          <div className="text-4xl mb-2">❌</div>
          <div className="font-bold text-lg text-red-800 dark:text-red-200">
            Yield Too Low
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            You got {gameState.yield} but needed {level.targetYield}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {gameState.gameResult === "none" && (
          <>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={checkSuccess} className="flex-1">
              🌾 Check Yield
            </Button>
          </>
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
        💡 "Balance all inputs to maximize your harvest!"
      </div>
    </div>
  );

  if (gameState.isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 p-4 flex flex-col overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-badge">
            🌾 Farm Yield Calculator - Level {currentLevel + 1}/{levels.length}
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
              <DialogTitle>
                🌾 Farm Yield Calculator - Level {currentLevel + 1}/{levels.length}
              </DialogTitle>
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
