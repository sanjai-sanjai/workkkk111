import React, { useState } from "react";
import { ChevronRight, X, ArrowLeft } from "lucide-react";

interface Location {
  id: string;
  name: string;
  emoji: string;
  problem: string;
  feasibility: "High" | "Medium" | "Low";
  demand: "Very High" | "High" | "Medium";
}

interface NPC {
  id: string;
  name: string;
  emoji: string;
  isAffected: boolean;
  maxTrust: number;
}

interface ProblemData {
  id: string;
  location: string;
  problem: string;
  affectedNPCs: string[];
  feasibility: string;
}

const LOCATIONS: Location[] = [
  {
    id: "well",
    name: "The Well",
    emoji: "💧",
    problem: "Women walk 5km daily for water",
    feasibility: "High",
    demand: "Very High"
  },
  {
    id: "farm",
    name: "The Farm",
    emoji: "🌾",
    problem: "Crops die from poor soil quality",
    feasibility: "Medium",
    demand: "High"
  },
  {
    id: "school",
    name: "The School",
    emoji: "📚",
    problem: "Students can't study; no electricity",
    feasibility: "Low",
    demand: "Very High"
  },
  {
    id: "market",
    name: "The Market",
    emoji: "🏪",
    problem: "Vendors lose money on unsold goods",
    feasibility: "Medium",
    demand: "High"
  },
  {
    id: "road",
    name: "The Road",
    emoji: "🛣️",
    problem: "Bad roads damage goods in transport",
    feasibility: "Low",
    demand: "Medium"
  },
  {
    id: "hospital",
    name: "The Hospital",
    emoji: "🏥",
    problem: "Patients wait hours for basic care",
    feasibility: "Medium",
    demand: "Very High"
  }
];

const NPCS: NPC[] = [
  { id: "meera", name: "Meera", emoji: "👩", isAffected: true, maxTrust: 20 },
  { id: "raja", name: "Raja", emoji: "👨", isAffected: false, maxTrust: 5 },
  { id: "arjun", name: "Arjun", emoji: "👨‍🔧", isAffected: false, maxTrust: 10 }
];

interface GameState {
  phase: "splash" | "explore" | "pitch" | "results";
  selectedProblems: string[];
  currentProblemIndex: number;
  npcReactions: Record<string, { reaction: string; trust: number; willPay: boolean }[]>;
  totalTrust: number;
  totalRevenue: number;
}

export function IdeaToIncome({ onComplete }: { onComplete: (score: number) => void }) {
  const [gameState, setGameState] = useState<GameState>({
    phase: "splash",
    selectedProblems: [],
    currentProblemIndex: 0,
    npcReactions: {},
    totalTrust: 0,
    totalRevenue: 0
  });

  const [timeLeft, setTimeLeft] = useState(60);
  const [showProblemDetail, setShowProblemDetail] = useState<string | null>(null);
  const [ideaText, setIdeaText] = useState("");
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);

  // Phase: Start Screen
  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, phase: "explore" }));
    setTimeLeft(60);
  };

  const handleExitGame = () => {
    onComplete(0);
  };

  // Phase: Explore - Select problems
  const handleSelectProblem = (locationId: string) => {
    setGameState(prev => {
      if (prev.selectedProblems.includes(locationId)) {
        return {
          ...prev,
          selectedProblems: prev.selectedProblems.filter(id => id !== locationId)
        };
      } else if (prev.selectedProblems.length < 3) {
        const newSelected = [...prev.selectedProblems, locationId];
        if (newSelected.length === 3) {
          return {
            ...prev,
            selectedProblems: newSelected,
            phase: "pitch",
            currentProblemIndex: 0,
            npcReactions: newSelected.reduce((acc, id) => ({ ...acc, [id]: [] }), {})
          };
        }
        return { ...prev, selectedProblems: newSelected };
      }
      return prev;
    });
  };

  // Phase: Pitch - Submit idea and get NPC reactions
  const handleSubmitIdea = () => {
    if (!ideaText.trim()) return;

    setIsSubmittingIdea(true);

    const currentProblemId = gameState.selectedProblems[gameState.currentProblemIndex];
    const location = LOCATIONS.find(l => l.id === currentProblemId);

    // Simulate NPC reactions
    const reactions = NPCS.map(npc => {
      let reaction = "";
      let trust = 0;
      let willPay = false;

      if (npc.isAffected) {
        reaction = `${npc.emoji} ${npc.name}: "Yes! This solves my problem! I'd pay for this!"`;
        trust = 20;
        willPay = true;
      } else {
        reaction = `${npc.emoji} ${npc.name}: "That's good for them, but not for me."`;
        trust = 5;
        willPay = false;
      }

      return { reaction, trust, willPay };
    });

    setGameState(prev => ({
      ...prev,
      npcReactions: {
        ...prev.npcReactions,
        [currentProblemId]: reactions
      },
      totalTrust: prev.totalTrust + reactions.reduce((sum, r) => sum + r.trust, 0),
      totalRevenue: prev.totalRevenue + (reactions.filter(r => r.willPay).length * 100)
    }));

    setIdeaText("");
    setIsSubmittingIdea(false);

    // Move to next problem or results
    setTimeout(() => {
      if (gameState.currentProblemIndex < gameState.selectedProblems.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentProblemIndex: prev.currentProblemIndex + 1
        }));
      } else {
        const finalScore = gameState.totalTrust + (gameState.totalRevenue / 10);
        setGameState(prev => ({ ...prev, phase: "results" }));
      }
    }, 1500);
  };

  // ===== RENDER: SPLASH SCREEN =====
  if (gameState.phase === "splash") {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-badge/20 to-card rounded-3xl border border-badge/50 p-8 max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Idea to Income</h2>
            <p className="text-sm text-muted-foreground">Turn problems into profit</p>
          </div>

          <div className="space-y-4 bg-card/50 rounded-xl p-4 border border-border/50">
            <div>
              <h3 className="font-heading font-semibold text-badge mb-2">📘 What You Will Discover</h3>
              <p className="text-sm text-muted-foreground">Great ideas come from spotting real problems people face every day</p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-accent mb-2">🎯 What You Need To Do</h3>
              <p className="text-sm text-muted-foreground">Walk through your village and identify 3 problems. Then pitch solutions to villagers and earn trust and money!</p>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-secondary mb-2">🏆 What Success Looks Like</h3>
              <p className="text-sm text-muted-foreground">Turn problems into profit by helping real people. Your score is total money earned + people satisfied</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStartGame}
              className="flex-1 py-3 bg-gradient-to-r from-badge to-badge/80 hover:from-badge/90 hover:to-badge/70 text-badge-foreground font-semibold rounded-lg transition-all"
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
            "Problems are the seeds of profitable businesses."
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: EXPLORE PHASE =====
  if (gameState.phase === "explore") {
    const selectedCount = gameState.selectedProblems.length;
    const canProceed = selectedCount === 3;

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-background/80 flex flex-col p-4 overflow-auto">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">🏘️ Explore the Village</h2>
              <p className="text-sm text-muted-foreground">Find 3 problems to solve</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-badge">{selectedCount}/3</div>
              <div className="text-xs text-muted-foreground">Selected</div>
            </div>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOCATIONS.map(location => {
              const isSelected = gameState.selectedProblems.includes(location.id);
              return (
                <div key={location.id} className="slide-up">
                  <button
                    onClick={() => handleSelectProblem(location.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-badge bg-badge/20 shadow-lg shadow-badge/20"
                        : "border-border bg-card/50 hover:border-badge/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{location.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-foreground">{location.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{location.problem}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            location.feasibility === "High" ? "bg-green-500/20 text-green-600" :
                            location.feasibility === "Medium" ? "bg-yellow-500/20 text-yellow-600" :
                            "bg-red-500/20 text-red-600"
                          }`}>
                            Feasibility: {location.feasibility}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                            Demand: {location.demand}
                          </span>
                        </div>
                      </div>
                      {isSelected && <span className="text-2xl">✅</span>}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Proceed Button */}
          {canProceed && (
            <button
              onClick={() => setGameState(prev => ({
                ...prev,
                phase: "pitch",
                currentProblemIndex: 0,
                npcReactions: gameState.selectedProblems.reduce((acc, id) => ({ ...acc, [id]: [] }), {})
              }))}
              className="w-full py-3 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold rounded-lg transition-all"
            >
              Start Pitching to Villagers <ChevronRight className="inline ml-2 h-4 w-4" />
            </button>
          )}

          <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
            "Problems are the seeds of profitable businesses."
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: PITCH PHASE =====
  if (gameState.phase === "pitch") {
    const currentProblemId = gameState.selectedProblems[gameState.currentProblemIndex];
    const currentLocation = LOCATIONS.find(l => l.id === currentProblemId);
    const currentReactions = gameState.npcReactions[currentProblemId] || [];

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-background/80 flex flex-col p-4 overflow-auto">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">🎤 Pitch Your Ideas</h2>
              <p className="text-sm text-muted-foreground">Problem {gameState.currentProblemIndex + 1} of {gameState.selectedProblems.length}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-secondary">💰 ₹{gameState.totalRevenue}</div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
          </div>

          {/* Problem Display */}
          {currentLocation && (
            <div className="glass-card rounded-xl border border-badge/50 p-6 bg-badge/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{currentLocation.emoji}</div>
                <div className="flex-1">
                  <h3 className="font-heading text-2xl font-bold text-foreground">{currentLocation.name}</h3>
                  <p className="text-base text-muted-foreground mt-2">{currentLocation.problem}</p>
                </div>
              </div>
            </div>
          )}

          {/* Idea Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Your Solution:</label>
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="What's your idea to solve this problem? (1-2 sentences)"
              maxLength={100}
              className="w-full p-4 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none h-24"
            />
            <div className="text-xs text-muted-foreground">{ideaText.length}/100</div>
          </div>

          {/* NPC Reactions Display */}
          {currentReactions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-heading font-semibold text-foreground">Villager Reactions:</h4>
              {currentReactions.map((reaction, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${
                  reaction.willPay
                    ? "border-secondary/50 bg-secondary/10"
                    : "border-muted-foreground/50 bg-muted/10"
                }`}>
                  <p className="text-sm text-foreground">{reaction.reaction}</p>
                  {reaction.willPay && (
                    <p className="text-xs text-secondary font-semibold mt-1">✅ Will pay ₹100</p>
                  )}
                  {!reaction.willPay && (
                    <p className="text-xs text-muted-foreground mt-1">😐 Not interested</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmitIdea}
              disabled={!ideaText.trim() || isSubmittingIdea}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg transition-all"
            >
              {isSubmittingIdea ? "Getting reactions..." : "🎤 Pitch to Villagers"}
            </button>
            {gameState.currentProblemIndex === gameState.selectedProblems.length - 1 && currentReactions.length > 0 && (
              <button
                onClick={() => {
                  const finalScore = gameState.totalTrust + (gameState.totalRevenue / 10);
                  setGameState(prev => ({ ...prev, phase: "results" }));
                }}
                className="flex-1 py-3 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-semibold rounded-lg transition-all"
              >
                See Results
              </button>
            )}
          </div>

          <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
            "Good ideas solve REAL problems that people will pay for"
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: RESULTS PHASE =====
  if (gameState.phase === "results") {
    const finalScore = gameState.totalTrust + Math.floor(gameState.totalRevenue / 10);

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="font-heading text-3xl font-bold text-foreground">Week Results</h2>
          </div>

          <div className="glass-card rounded-xl border border-secondary/50 p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <span className="text-muted-foreground">Problems solved:</span>
                <span className="font-bold text-foreground">{gameState.selectedProblems.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <span className="text-muted-foreground">Total trust earned:</span>
                <span className="font-bold text-foreground">{gameState.totalTrust}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <span className="text-muted-foreground">Revenue generated:</span>
                <span className="font-bold text-secondary">₹{gameState.totalRevenue}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">Final Score:</span>
                  <span className="text-3xl font-bold text-primary">{finalScore} XP</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary/20 border border-secondary/50 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground">
                ✅ <strong>Good businesses solve real problems people will pay for</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => onComplete(finalScore)}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold rounded-lg transition-all"
          >
            Finish Game
          </button>

          <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
            "Problems are the seeds of profitable businesses."
          </div>
        </div>
      </div>
    );
  }

  return null;
}
