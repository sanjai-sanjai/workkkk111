import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GameState {
  waterLevel: number;
  waterMoving: boolean;
  turbineRotation: number;
  generatorPower: number;
  housesLit: number;
  flowRate: number;
  energyPhase: "water" | "kinetic" | "electrical";
}

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;
const MAX_HOUSES = 3;
const WIN_CONDITION = 3;

export default function EnergyQuest() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    waterLevel: 100,
    waterMoving: false,
    turbineRotation: 0,
    generatorPower: 0,
    housesLit: 0,
    flowRate: 0,
    energyPhase: "water",
  });
  const animationRef = useRef<number | null>(null);

  const releaseWater = () => {
    setGameState((prev) => ({
      ...prev,
      waterMoving: true,
      flowRate: 5,
    }));
  };

  const stopWater = () => {
    setGameState((prev) => ({
      ...prev,
      waterMoving: false,
      flowRate: 0,
    }));
  };

  const adjustFlow = (delta: number) => {
    setGameState((prev) => ({
      ...prev,
      flowRate: Math.max(0, Math.min(10, prev.flowRate + delta)),
    }));
  };

  // Physics and energy transformation
  useEffect(() => {
    if (gameState.flowRate === 0) {
      setGameState((prev) => ({
        ...prev,
        waterMoving: false,
        turbineRotation: Math.max(0, prev.turbineRotation - 2),
        generatorPower: Math.max(0, prev.generatorPower - 3),
      }));
      return;
    }

    const animate = () => {
      setGameState((prev) => {
        let newState = { ...prev };

        // Water energy: Decrease water level as it flows
        newState.waterLevel = Math.max(0, newState.waterLevel - newState.flowRate * 0.3);

        // Kinetic energy: Water spin turbine
        newState.turbineRotation = (newState.turbineRotation + newState.flowRate * 3) % 360;

        // Electrical energy: Turbine spins generator
        newState.generatorPower = newState.flowRate * 8;

        // Determine houses lit based on power
        if (newState.generatorPower > 15) {
          newState.housesLit = 1;
        }
        if (newState.generatorPower > 30) {
          newState.housesLit = 2;
        }
        if (newState.generatorPower > 45) {
          newState.housesLit = 3;
        }

        // Determine energy phase
        if (newState.flowRate > 0) {
          newState.energyPhase = "kinetic";
        }
        if (newState.generatorPower > 10) {
          newState.energyPhase = "electrical";
        }

        // Stop if water runs out
        if (newState.waterLevel <= 0) {
          newState.waterLevel = 0;
          newState.waterMoving = false;
          newState.flowRate = 0;
        }

        return newState;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.flowRate]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sky background
    const bgColor = gameState.housesLit >= WIN_CONDITION ? "#0f2741" : "#87CEEB";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    ctx.fillStyle = gameState.housesLit >= WIN_CONDITION ? "#FFF" : "#000";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Energy Transformation: Water → Motion → Electricity", GAME_WIDTH / 2, 30);

    // ===== WATER TANK =====
    const tankX = 80;
    const tankY = 80;
    const tankW = 100;
    const tankH = 200;

    // Tank structure
    ctx.fillStyle = "#556B7E";
    ctx.fillRect(tankX, tankY, tankW, tankH);
    ctx.strokeStyle = "#34495E";
    ctx.lineWidth = 3;
    ctx.strokeRect(tankX, tankY, tankW, tankH);

    // Water inside
    const waterHeight = (gameState.waterLevel / 100) * tankH;
    const waterGradient = ctx.createLinearGradient(0, tankY + tankH - waterHeight, 0, tankY + tankH);
    waterGradient.addColorStop(0, "rgba(52, 152, 219, 0.4)");
    waterGradient.addColorStop(1, "#3498DB");
    ctx.fillStyle = waterGradient;
    ctx.fillRect(tankX, tankY + tankH - waterHeight, tankW, waterHeight);

    // Water label
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("WATER", tankX + tankW / 2, tankY + tankH + 25);
    ctx.fillText(`${Math.round(gameState.waterLevel)}%`, tankX + tankW / 2, tankY + tankH + 40);

    // Energy phase indicator for water
    if (gameState.waterMoving) {
      ctx.strokeStyle = "#3498DB";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(tankX + tankW / 2, tankY + tankH / 2, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ===== WATER PIPE & FLOW =====
    ctx.strokeStyle = "#556B7E";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(tankX + tankW, tankY + tankH / 2);
    ctx.quadraticCurveTo(300, tankY + 200, 350, 280);
    ctx.stroke();

    // Animated water flow particles
    if (gameState.waterMoving && gameState.flowRate > 0) {
      ctx.fillStyle = "#3498DB";
      for (let i = 0; i < gameState.flowRate * 2; i++) {
        const offset = (Date.now() / 20 + i * 20) % 300;
        const t = offset / 300;
        const x = tankX + tankW + (300 - tankW) * t;
        const y = tankY + tankH / 2 + (280 - tankY - tankH / 2) * t;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flow label
      ctx.fillStyle = "#3498DB";
      ctx.font = "bold 14px Arial";
      ctx.fillText(`Flow: ${gameState.flowRate.toFixed(1)} L/s`, 200, 240);
    }

    // ===== TURBINE =====
    const turbineX = 380;
    const turbineY = 280;
    const turbineR = 50;

    // Turbine housing
    ctx.fillStyle = "#2C3E50";
    ctx.beginPath();
    ctx.arc(turbineX, turbineY, turbineR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1A252F";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Turbine blades with rotation
    ctx.save();
    ctx.translate(turbineX, turbineY);
    ctx.rotate((gameState.turbineRotation * Math.PI) / 180);

    ctx.strokeStyle = "#E74C3C";
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * turbineR * 0.7, Math.sin(angle) * turbineR * 0.7);
      ctx.stroke();
    }
    ctx.restore();

    // Turbine label
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TURBINE", turbineX, turbineY + 70);
    ctx.fillText(`${Math.round(gameState.turbineRotation)}°`, turbineX, turbineY + 85);

    // Energy phase indicator for kinetic
    if (gameState.energyPhase === "kinetic" && gameState.turbineRotation > 10) {
      ctx.strokeStyle = "#E74C3C";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(turbineX, turbineY, 65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ===== GENERATOR & POWER LINES =====
    const genX = 600;
    const genY = 280;

    // Generator
    ctx.fillStyle = "#F39C12";
    ctx.fillRect(genX - 30, genY - 30, 60, 60);
    ctx.strokeStyle = "#D68910";
    ctx.lineWidth = 2;
    ctx.strokeRect(genX - 30, genY - 30, 60, 60);

    // Generator label
    ctx.fillStyle = "#000";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GEN", genX, genY + 3);

    // Power output display
    ctx.fillStyle = "#E67E22";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(gameState.generatorPower)}kW`, genX, genY + 50);

    // Transmission lines
    ctx.strokeStyle = "#F39C12";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(turbineX + turbineR, turbineY);
    ctx.lineTo(genX - 30, genY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(genX + 30, genY);
    ctx.lineTo(750, genY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Energy phase indicator for electrical
    if (gameState.generatorPower > 10) {
      ctx.strokeStyle = "#F39C12";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(genX, genY, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ===== HOUSES =====
    const houseBaseY = 350;
    const houseSpacing = 80;
    const startX = 700;

    for (let i = 0; i < MAX_HOUSES; i++) {
      const houseX = startX + i * houseSpacing;

      // House body
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(houseX, houseBaseY, 50, 50);

      // Roof
      ctx.fillStyle = "#D2691E";
      ctx.beginPath();
      ctx.moveTo(houseX, houseBaseY);
      ctx.lineTo(houseX + 25, houseBaseY - 20);
      ctx.lineTo(houseX + 50, houseBaseY);
      ctx.closePath();
      ctx.fill();

      // Door
      ctx.fillStyle = "#654321";
      ctx.fillRect(houseX + 18, houseBaseY + 25, 14, 20);

      // Window/Light
      const isLit = i < gameState.housesLit;
      if (isLit) {
        // Glowing light
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(houseX + 30, houseBaseY + 15, 8, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(houseX + 30, houseBaseY + 15, 15, 0, Math.PI * 2);
        ctx.stroke();

        // Light rays
        ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
        ctx.lineWidth = 1;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(houseX + 30, houseBaseY + 15);
          ctx.lineTo(
            houseX + 30 + Math.cos(angle) * 20,
            houseBaseY + 15 + Math.sin(angle) * 20
          );
          ctx.stroke();
        }
      } else {
        // Dark window
        ctx.fillStyle = "#444";
        ctx.fillRect(houseX + 25, houseBaseY + 10, 10, 10);
      }
    }

    // House label
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("VILLAGE", startX + houseSpacing, houseBaseY + 70);

    // ===== VICTORY STATE =====
    if (gameState.housesLit >= WIN_CONDITION) {
      ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = "#22C55E";
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.fillText("🎉 VICTORY!", GAME_WIDTH / 2, GAME_HEIGHT / 2);

      ctx.font = "18px Arial";
      ctx.fillText("All houses powered by water energy!", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    }

    // ===== ENERGY FLOW LEGEND =====
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Energy Flow: ", 20, GAME_HEIGHT - 30);

    // Water phase
    ctx.fillStyle = "#3498DB";
    ctx.fillRect(150, GAME_HEIGHT - 40, 15, 15);
    ctx.fillStyle = "#000";
    ctx.fillText("Potential Energy (Water)", 170, GAME_HEIGHT - 25);

    // Kinetic phase
    ctx.fillStyle = "#E74C3C";
    ctx.fillRect(420, GAME_HEIGHT - 40, 15, 15);
    ctx.fillStyle = "#000";
    ctx.fillText("Kinetic Energy (Motion)", 440, GAME_HEIGHT - 25);

    // Electrical phase
    ctx.fillStyle = "#F39C12";
    ctx.fillRect(690, GAME_HEIGHT - 40, 15, 15);
    ctx.fillStyle = "#000";
    ctx.fillText("Electrical Energy", 710, GAME_HEIGHT - 25);
  }, [gameState]);

  const handleStart = () => {
    setShowTutorial(false);
  };

  const handleGoBack = () => {
    navigate("/student/physics");
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleReset = () => {
    setGameState({
      waterLevel: 100,
      waterMoving: false,
      turbineRotation: 0,
      generatorPower: 0,
      housesLit: 0,
      flowRate: 0,
      energyPhase: "water",
    });
    setShowCompletion(false);
  };

  const gameContainer = (
    <div
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black p-0 overflow-hidden" : "w-full bg-gradient-to-br from-blue-50 to-cyan-50 p-4"
      )}
    >
      {/* Fullscreen button */}
      {!isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={() => setIsFullscreen(true)}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            Full Screen
          </Button>
        </div>
      )}

      {isFullscreen && (
        <Button
          onClick={() => setIsFullscreen(false)}
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 z-10 gap-2 bg-white hover:bg-gray-100"
        >
          <Minimize2 className="w-4 h-4" />
          Exit
        </Button>
      )}

      {/* Canvas */}
      <div className={cn(
        "rounded-lg border-2 border-gray-300 shadow-lg bg-white overflow-hidden",
        isFullscreen ? "w-screen h-screen" : "w-full max-w-5xl"
      )}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-full"
        />
      </div>

      {/* Controls */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-5xl bg-white p-6 rounded-lg border border-gray-200 shadow-md">
          <div className="space-y-6">
            {/* Flow Control */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-black">
                Control Water Flow
              </label>
              <div className="flex gap-3 items-center">
                <Button
                  onClick={() => adjustFlow(-1)}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  ◀
                </Button>
                <div className="flex-1 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-4 text-center font-bold text-blue-700">
                  {gameState.flowRate.toFixed(1)} L/s
                </div>
                <Button
                  onClick={() => adjustFlow(1)}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  ▶
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={releaseWater}
                disabled={gameState.waterLevel < 5 || gameState.waterMoving}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold"
                size="lg"
              >
                💧 Release Water
              </Button>
              <Button
                onClick={stopWater}
                variant="outline"
                className="font-bold text-black"
                size="lg"
              >
                🛑 Stop
              </Button>
            </div>

            {/* Energy Status */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl">💧</div>
                <div className="text-xs text-gray-600">Water</div>
                <div className="text-lg font-bold text-blue-600">{Math.round(gameState.waterLevel)}%</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">⚙️</div>
                <div className="text-xs text-gray-600">Turbine</div>
                <div className="text-lg font-bold text-red-600">{Math.round(gameState.turbineRotation % 360)}°</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">⚡</div>
                <div className="text-xs text-gray-600">Power</div>
                <div className="text-lg font-bold text-orange-600">{Math.round(gameState.generatorPower)}kW</div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-800">Houses Lit</span>
                <span className="text-gray-600">{gameState.housesLit}/{WIN_CONDITION}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(gameState.housesLit / WIN_CONDITION) * 100}%` }}
                />
              </div>
            </div>

            {gameState.housesLit >= WIN_CONDITION && (
              <Button
                onClick={() => setShowCompletion(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                size="lg"
              >
                ✅ See Results
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Info */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-5xl bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📘 Energy Transformation</h3>
              <p className="text-sm text-gray-700">
                Water falls (potential energy) → Spins turbine (kinetic energy) → Generator creates electricity → Houses light up!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🕹 How to Play</h3>
              <p className="text-sm text-gray-700">
                Release water to spin the turbine. Watch it power the generator. More flow = more power = more houses lit!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">💡 What You Learn</h3>
              <p className="text-sm text-gray-700">
                Energy never disappears—it just changes form. Water energy becomes motion, then electricity!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <ConceptIntroPopup
        isOpen={showTutorial}
        onStart={handleStart}
        onGoBack={handleGoBack}
        conceptName="Energy Quest"
        whatYouWillUnderstand="Watch energy transform: Water → Motion → Electricity. Energy never disappears, it just changes form!"
        gameSteps={[
          "Release water from the tank",
          "Watch it flow down and spin the turbine",
          "The turbine powers the generator",
          "The generator creates electricity to light houses",
        ]}
        successMeaning="When all 3 houses light up, you've successfully transformed water's energy into electrical energy!"
        icon="⚡"
      />

      <GameCompletionPopup
        isOpen={showCompletion && gameState.housesLit >= WIN_CONDITION}
        onPlayAgain={handleReset}
        onExitFullscreen={handleExitFullscreen}
        onBackToGames={handleGoBack}
        learningOutcome="You mastered energy transformation! Potential → Kinetic → Electrical! Energy is never lost, just transformed."
        isFullscreen={isFullscreen}
      />

      <div className="py-6">
        <div className="mb-4 flex items-center gap-2">
          <Button
            onClick={handleGoBack}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Physics
          </Button>
        </div>

        {gameContainer}
      </div>
    </AppLayout>
  );
}
