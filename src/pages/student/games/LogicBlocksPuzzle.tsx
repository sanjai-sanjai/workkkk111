import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { ConceptIntroPopup } from "@/components/ui/concept-intro-popup";
import { GameCompletionPopup } from "@/components/ui/game-completion-popup";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogicGate {
  id: number;
  type: "AND" | "OR" | "NOT";
  x: number;
  y: number;
  inputs: (boolean | null)[];
  output: boolean;
}

interface InputNode {
  id: number;
  value: boolean;
  x: number;
  y: number;
}

const GAME_WIDTH = 900;
const GAME_HEIGHT = 500;

export default function LogicBlocksPuzzle() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const [inputNodes, setInputNodes] = useState<InputNode[]>([
    { id: 1, value: false, x: 50, y: 100 },
    { id: 2, value: false, x: 50, y: 200 },
  ]);

  const [gates, setGates] = useState<LogicGate[]>([
    {
      id: 1,
      type: "AND",
      x: 250,
      y: 150,
      inputs: [null, null],
      output: false,
    },
    {
      id: 2,
      type: "OR",
      x: 450,
      y: 150,
      inputs: [null, null],
      output: false,
    },
  ]);

  const [outputGate, setOutputGate] = useState({
    x: 700,
    y: 150,
    value: false,
  });

  const [connections, setConnections] = useState<Array<{
    fromType: "input" | "gate";
    fromId: number;
    toGateId: number;
    toInputIndex: number;
  }>>([]);

  const [draggingConnection, setDraggingConnection] = useState<{
    fromType: "input" | "gate";
    fromId: number;
    startX: number;
    startY: number;
  } | null>(null);

  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });
  const [attempts, setAttempts] = useState(0);

  // Toggle input
  const toggleInput = (id: number) => {
    setInputNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, value: !node.value } : node))
    );
    setAttempts((prev) => prev + 1);
  };

  // Evaluate logic
  useEffect(() => {
    const newGates = gates.map((gate) => {
      let output = false;

      const inputs = gate.inputs.map((_, index) => {
        const conn = connections.find(
          (c) => c.toGateId === gate.id && c.toInputIndex === index
        );
        if (!conn) return false;

        if (conn.fromType === "input") {
          return inputNodes.find((n) => n.id === conn.fromId)?.value || false;
        } else {
          const sourceGate = gates.find((g) => g.id === conn.fromId);
          return sourceGate?.output || false;
        }
      });

      switch (gate.type) {
        case "AND":
          output = inputs[0] && inputs[1];
          break;
        case "OR":
          output = inputs[0] || inputs[1];
          break;
        case "NOT":
          output = !inputs[0];
          break;
      }

      return { ...gate, inputs: inputs as (boolean | null)[], output };
    });

    setGates(newGates);

    // Calculate output
    const lastGate = newGates[newGates.length - 1];
    setOutputGate((prev) => ({
      ...prev,
      value: lastGate.output,
    }));
  }, [inputNodes, connections]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < GAME_WIDTH; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < GAME_HEIGHT; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(GAME_WIDTH, i);
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Connect Inputs Through Logic Gates to Light the Output", GAME_WIDTH / 2, 25);

    // Draw connections
    connections.forEach((conn) => {
      let fromX = 0;
      let fromY = 0;

      if (conn.fromType === "input") {
        const node = inputNodes.find((n) => n.id === conn.fromId);
        if (node) {
          fromX = node.x + 30;
          fromY = node.y;
        }
      } else {
        const gate = gates.find((g) => g.id === conn.fromId);
        if (gate) {
          fromX = gate.x + 60;
          fromY = gate.y;
        }
      }

      const toGate = gates.find((g) => g.id === conn.toGateId);
      if (!toGate) return;

      const toX = toGate.x;
      const toY = toGate.y + (conn.toInputIndex === 0 ? -15 : 15);

      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.quadraticCurveTo((fromX + toX) / 2, (fromY + toY) / 2, toX, toY);
      ctx.stroke();
    });

    // Draw dragging connection
    if (draggingConnection) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(draggingConnection.startX, draggingConnection.startY);
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw input nodes
    inputNodes.forEach((node) => {
      const isOn = node.value;
      ctx.fillStyle = isOn ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(node.x + 15, node.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = "#FFF";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(isOn ? "1" : "0", node.x + 15, node.y + 3);

      // Text label
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`In ${node.id}`, node.x - 10, node.y + 4);

      // Outline for interaction
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x + 15, node.y, 15, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw gates
    gates.forEach((gate) => {
      const width = 60;
      const height = 50;

      // Gate box
      ctx.fillStyle = "#334155";
      ctx.fillRect(gate.x, gate.y - height / 2, width, height);

      // Gate border
      ctx.strokeStyle = gate.output ? "#22c55e" : "#64748b";
      ctx.lineWidth = 2;
      ctx.strokeRect(gate.x, gate.y - height / 2, width, height);

      // Gate label
      ctx.fillStyle = gate.output ? "#22c55e" : "#e2e8f0";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(gate.type, gate.x + width / 2, gate.y + 3);

      // Input points
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(gate.x, gate.y - 15, 4, 0, Math.PI * 2);
      ctx.fill();

      if (gate.type !== "NOT") {
        ctx.beginPath();
        ctx.arc(gate.x, gate.y + 15, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Output point
      ctx.fillStyle = gate.output ? "#22c55e" : "#8b5cf6";
      ctx.beginPath();
      ctx.arc(gate.x + width, gate.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw output
    ctx.fillStyle = outputGate.value ? "#22c55e" : "#ef4444";
    ctx.beginPath();
    ctx.arc(outputGate.x, outputGate.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Output glow if on
    if (outputGate.value) {
      ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(outputGate.x, outputGate.y, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Output label
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("OUT", outputGate.x, outputGate.y + 3);

    // Output text
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(outputGate.value ? "ON" : "OFF", outputGate.x + 25, outputGate.y + 4);

    // Status
    ctx.fillStyle = outputGate.value ? "#22c55e" : "#64748b";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      outputGate.value ? "✓ Output ON" : "Output OFF",
      GAME_WIDTH / 2,
      GAME_HEIGHT - 20
    );
  }, [inputNodes, gates, connections, draggingConnection, currentMousePos, outputGate]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking input node
    inputNodes.forEach((node) => {
      if (
        Math.abs(x - (node.x + 15)) < 20 &&
        Math.abs(y - node.y) < 20
      ) {
        toggleInput(node.id);
      }
    });

    // Check if starting connection from gate
    gates.forEach((gate) => {
      if (
        x >= gate.x &&
        x <= gate.x + 60 &&
        y >= gate.y - 25 &&
        y <= gate.y + 25
      ) {
        setDraggingConnection({
          fromType: "gate",
          fromId: gate.id,
          startX: gate.x + 60,
          startY: gate.y,
        });
      }
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentMousePos({ x, y });
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingConnection) {
      gates.forEach((gate) => {
        const inputY1 = gate.y - 15;
        const inputY2 = gate.y + 15;

        if (
          x >= gate.x - 10 &&
          x <= gate.x + 10 &&
          Math.abs(y - inputY1) < 10
        ) {
          setConnections((prev) => [
            ...prev,
            {
              fromType: draggingConnection.fromType,
              fromId: draggingConnection.fromId,
              toGateId: gate.id,
              toInputIndex: 0,
            },
          ]);
        }

        if (
          x >= gate.x - 10 &&
          x <= gate.x + 10 &&
          Math.abs(y - inputY2) < 10 &&
          gate.type !== "NOT"
        ) {
          setConnections((prev) => [
            ...prev,
            {
              fromType: draggingConnection.fromType,
              fromId: draggingConnection.fromId,
              toGateId: gate.id,
              toInputIndex: 1,
            },
          ]);
        }
      });
    }

    setDraggingConnection(null);
  };

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
    setInputNodes([
      { id: 1, value: false, x: 50, y: 100 },
      { id: 2, value: false, x: 50, y: 200 },
    ]);
    setGates([
      {
        id: 1,
        type: "AND",
        x: 250,
        y: 150,
        inputs: [null, null],
        output: false,
      },
      {
        id: 2,
        type: "OR",
        x: 450,
        y: 150,
        inputs: [null, null],
        output: false,
      },
    ]);
    setConnections([]);
    setAttempts(0);
    setShowCompletion(false);
  };

  const gameContainer = (
    <div
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50 bg-black p-0" : "w-full bg-slate-900 p-4"
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
          className="absolute top-4 right-4 z-10 gap-2 bg-white"
        >
          <Minimize2 className="w-4 h-4" />
          Exit
        </Button>
      )}

      {/* Canvas */}
      <div className={cn(
        "rounded-lg border-2 border-purple-500 shadow-lg bg-slate-900 overflow-hidden",
        isFullscreen ? "w-screen h-screen" : "w-full max-w-5xl"
      )}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-full cursor-crosshair"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => setDraggingConnection(null)}
        />
      </div>

      {/* Controls */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-5xl bg-slate-800 p-6 rounded-lg border border-purple-500">
          <div className="space-y-6">
            <div className="text-white text-center text-sm">
              <p className="mb-2">
                Click input nodes (red/green circles) to toggle them. Drag from gate outputs to gate inputs to create connections.
              </p>
              <p className="text-xs text-gray-400">
                Goal: Make the output light green by routing signals through logic gates!
              </p>
            </div>

            {/* Logic Explanation */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-700 rounded-lg">
              <div className="text-white text-center text-xs">
                <div className="font-bold mb-2">AND Gate</div>
                <p className="text-gray-400">Both inputs = ON</p>
              </div>
              <div className="text-white text-center text-xs">
                <div className="font-bold mb-2">OR Gate</div>
                <p className="text-gray-400">One input = ON</p>
              </div>
              <div className="text-white text-center text-xs">
                <div className="font-bold mb-2">NOT Gate</div>
                <p className="text-gray-400">Flips the signal</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700 rounded-lg text-white text-center">
              <div>
                <div className="text-xs text-gray-400">Connections Made</div>
                <div className="text-2xl font-bold text-purple-400">{connections.length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Attempts</div>
                <div className="text-2xl font-bold text-blue-400">{attempts}</div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="text-purple-400 border-purple-500 hover:bg-purple-500 hover:text-white font-bold"
              >
                🔄 Reset
              </Button>
              <Button
                onClick={() => setShowCompletion(true)}
                disabled={!outputGate.value}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold disabled:opacity-50"
              >
                ✅ Output ON!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Info */}
      {!isFullscreen && (
        <div className="mt-6 w-full max-w-5xl bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📘 Concept</h3>
              <p className="text-sm text-gray-700">
                Logic gates are like decision makers. AND needs both inputs ON, OR needs at least one ON, NOT flips the signal.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🕹 How to Play</h3>
              <p className="text-sm text-gray-700">
                Click input circles to toggle ON/OFF. Drag from gate outputs to other gate inputs to create connections. Route signals to light the output!
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">🧠 What You Learn</h3>
              <p className="text-sm text-gray-700">
                AND gates require both inputs. OR gates need one. Logic is predictable and follows clear rules!
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
        conceptName="Logic Blocks Puzzle"
        whatYouWillUnderstand="Understand how logic gates work and how to combine them to solve problems."
        gameSteps={[
          "Toggle input nodes (red/green circles) ON and OFF",
          "Drag connections from gate outputs to other gate inputs",
          "AND gate lights up when both inputs are ON",
          "OR gate lights up when at least one input is ON",
          "Route signals to make the output light green!",
        ]}
        successMeaning="When the output turns green and says ON, you've successfully routed the logic signals!"
        icon="⚙️"
      />

      <GameCompletionPopup
        isOpen={showCompletion && outputGate.value}
        onPlayAgain={handleReset}
        onExitFullscreen={handleExitFullscreen}
        onBackToGames={handleGoBack}
        learningOutcome="You mastered logic gates! You understand how AND, OR, and NOT gates work and how to combine them to solve problems."
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
