/**
 * TASKS PAGE
 * Main hub for task management with full lifecycle support
 * Features: filtering, progress tracking, proof submission, gamification
 */

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { ProofSubmissionModal } from "@/components/student/ProofSubmissionModal";
import { TaskDetailModal } from "@/components/student/TaskDetailModal";
import {
  Home,
  Users,
  BookOpen,
  Zap,
  CheckCircle2,
  Clock,
  Award,
  Lock,
  ChevronRight,
  AlertCircle,
  Coins,
  TrendingUp,
} from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { usePlayCoins } from "@/hooks/use-playcoins";
import type { TaskCategory, ProofType } from "@/integrations/supabase/tasks.types";

const categoryConfig = {
  village: {
    icon: Home,
    label: "Village",
    color: "text-secondary",
    bgColor: "bg-secondary/20",
    borderColor: "border-secondary/30",
  },
  family: {
    icon: Users,
    label: "Family",
    color: "text-badge",
    bgColor: "bg-badge/20",
    borderColor: "border-badge/30",
  },
  subject: {
    icon: BookOpen,
    label: "Subject",
    color: "text-primary",
    bgColor: "bg-primary/20",
    borderColor: "border-primary/30",
  },
  personal: {
    icon: Zap,
    label: "Personal",
    color: "text-accent",
    bgColor: "bg-accent/20",
    borderColor: "border-accent/30",
  },
};

const statusConfig = {
  locked: {
    icon: Lock,
    color: "text-muted-foreground",
    label: "Locked",
    actionLabel: "Unlock task",
  },
  available: {
    icon: ChevronRight,
    color: "text-primary",
    label: "Ready",
    actionLabel: "Start task",
  },
  in_progress: {
    icon: Zap,
    color: "text-accent",
    label: "In Progress",
    actionLabel: "Continue",
  },
  awaiting_proof: {
    icon: AlertCircle,
    color: "text-secondary",
    label: "Awaiting Proof",
    actionLabel: "Submit proof",
  },
  under_review: {
    icon: AlertCircle,
    color: "text-secondary",
    label: "Under Review",
    actionLabel: "Under review",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-secondary",
    label: "Completed",
    actionLabel: "Completed",
  },
  rejected: {
    icon: AlertCircle,
    color: "text-destructive",
    label: "Rejected",
    actionLabel: "Retry",
  },
};

export default function TasksPage() {
  // =========================================================================
  // STATE & HOOKS
  // =========================================================================

  const { useTasks: useTasksHook } = { useTasks: () => {} };
  const {
    allTasks,
    userTasks,
    filteredTasks,
    availableTasks,
    inProgressTasks,
    completedTasks,
    lockedTasks,
    selectedTask,
    taskStats,
    startTask,
    submitProof,
    selectTask,
    filterByCategory,
    selectedCategory,
    isLoading,
    error,
  } = useTasks();

  const { wallet } = usePlayCoins();
  const [showProofModal, setShowProofModal] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TaskCategory | "all">("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | "completed" | "active" | "available">("all");

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleSelectTask = (userTaskId: string) => {
    selectTask(userTaskId);
    setShowTaskDetail(true);
  };

  const handleFilterChange = (category: TaskCategory | "all") => {
    setActiveFilter(category);
    filterByCategory(category);
  };

  // Get filtered tasks based on both status and category
  const getFilteredTasksByStatus = () => {
    let tasks: typeof userTasks = [];

    switch (selectedStatusFilter) {
      case "completed":
        tasks = completedTasks;
        break;
      case "active":
        tasks = inProgressTasks;
        break;
      case "available":
        tasks = availableTasks;
        break;
      case "all":
      default:
        tasks = [...inProgressTasks, ...availableTasks, ...completedTasks];
    }

    // Further filter by category if needed
    if (activeFilter !== "all") {
      tasks = tasks.filter((userTask) => {
        const taskDef = allTasks.find((t) => t.id === userTask.taskId);
        return taskDef?.category === activeFilter;
      });
    }

    return tasks;
  };

  const displayedTasks = getFilteredTasksByStatus();
  const getStatusLabel = () => {
    switch (selectedStatusFilter) {
      case "completed":
        return "Completed Tasks";
      case "active":
        return "Active Tasks";
      case "available":
        return "Available Tasks";
      default:
        return "All Tasks";
    }
  };

  const handleStartTask = async () => {
    if (!selectedTask) return;
    try {
      await startTask(selectedTask.userTask.taskId);
      setShowTaskDetail(false);
    } catch (err) {
      console.error("Failed to start task:", err);
    }
  };

  const handleOpenProofModal = () => {
    if (selectedTask?.taskDefinition.proofPolicy.type === "auto") {
      // Auto-proof tasks auto-complete
      setShowProofModal(false);
    } else {
      setShowProofModal(true);
    }
  };

  const handleSubmitProof = async (proofType: ProofType, data: any) => {
    if (!selectedTask) return;
    try {
      // Create proof object matching the type
      const proof: any = {
        id: `proof_${Date.now()}`,
        userTaskId: selectedTask.userTask.id,
        userId: "current_user",
        taskId: selectedTask.userTask.taskId,
        proofType,
        submittedAt: new Date(),
        status: "pending",
      };

      if (proofType === "photo") {
        proof.fileUrl = data.photo?.preview || "";
        proof.fileName = data.photo?.file?.name || "photo.jpg";
        proof.fileSizeBytes = data.photo?.file?.size || 0;
        proof.mimeType = data.photo?.file?.type || "image/jpeg";
      } else if (proofType === "text") {
        proof.content = data.text?.content || "";
        proof.wordCount = (data.text?.content || "").split(/\s+/).length;
        proof.characterCount = (data.text?.content || "").length;
      }

      await submitProof(selectedTask.userTask.id, proof);
      setShowProofModal(false);
      setShowTaskDetail(false);
    } catch (err) {
      console.error("Failed to submit proof:", err);
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <AppLayout role="student" playCoins={wallet?.balance || 0} title="Tasks">
      {/* MODALS */}
      {selectedTask && (
        <>
          <ProofSubmissionModal
            open={showProofModal}
            onClose={() => setShowProofModal(false)}
            onSubmit={handleSubmitProof}
            taskDefinition={selectedTask.taskDefinition}
            isLoading={isLoading}
          />
          <TaskDetailModal
            open={showTaskDetail}
            onClose={() => setShowTaskDetail(false)}
            taskContext={selectedTask}
            onStartTask={handleStartTask}
            onSubmitProof={handleOpenProofModal}
            isLoading={isLoading}
          />
        </>
      )}

      <div className="px-4 py-6 pb-24 space-y-6">
        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* HEADER STATS */}
        <div className="slide-up space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">Your Tasks</h2>
              <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                {taskStats.completed}/{userTasks.length} Done
              </Badge>
            </div>

            {/* PROGRESS BAR */}
            <AnimatedProgress
              value={userTasks.length > 0 ? (taskStats.completed / userTasks.length) * 100 : 0}
              variant="default"
              className="mb-4"
            />

            {/* STATUS FILTER CARDS */}
            <div className="grid grid-cols-3 gap-3">
              {/* Completed Card */}
              <button
                onClick={() => setSelectedStatusFilter("completed")}
                className={`aspect-square rounded-xl transition-all duration-300 flex flex-col items-center justify-center p-3 cursor-pointer group ${
                  selectedStatusFilter === "completed"
                    ? "bg-secondary/20 border-2 border-secondary shadow-lg shadow-secondary/20 scale-105"
                    : "bg-card border-2 border-border hover:border-secondary/50 hover:shadow-md"
                }`}
              >
                <div className="text-center space-y-1">
                  <p className="font-heading text-2xl font-bold text-secondary">
                    {taskStats.completed}
                  </p>
                  <p className="text-xs font-medium text-foreground">Completed</p>
                  <div className={`h-1 rounded-full transition-all ${selectedStatusFilter === "completed" ? "w-8 bg-secondary" : "w-4 bg-border"}`}></div>
                </div>
              </button>

              {/* Active Card */}
              <button
                onClick={() => setSelectedStatusFilter("active")}
                className={`aspect-square rounded-xl transition-all duration-300 flex flex-col items-center justify-center p-3 cursor-pointer group ${
                  selectedStatusFilter === "active"
                    ? "bg-accent/20 border-2 border-accent shadow-lg shadow-accent/20 scale-105"
                    : "bg-card border-2 border-border hover:border-accent/50 hover:shadow-md"
                }`}
              >
                <div className="text-center space-y-1">
                  <p className="font-heading text-2xl font-bold text-accent">
                    {taskStats.inProgress}
                  </p>
                  <p className="text-xs font-medium text-foreground">Active</p>
                  <div className={`h-1 rounded-full transition-all ${selectedStatusFilter === "active" ? "w-8 bg-accent" : "w-4 bg-border"}`}></div>
                </div>
              </button>

              {/* Available Card */}
              <button
                onClick={() => setSelectedStatusFilter("available")}
                className={`aspect-square rounded-xl transition-all duration-300 flex flex-col items-center justify-center p-3 cursor-pointer group ${
                  selectedStatusFilter === "available"
                    ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-card border-2 border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                <div className="text-center space-y-1">
                  <p className="font-heading text-2xl font-bold text-primary">
                    {taskStats.available}
                  </p>
                  <p className="text-xs font-medium text-foreground">Available</p>
                  <div className={`h-1 rounded-full transition-all ${selectedStatusFilter === "available" ? "w-8 bg-primary" : "w-4 bg-border"}`}></div>
                </div>
              </button>
            </div>

            {/* MOTIVATIONAL MESSAGE */}
            <p className="text-xs text-muted-foreground mt-4">
              Complete tasks to earn rewards and level up! 🚀
            </p>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="slide-up space-y-3" style={{ animationDelay: "50ms" }}>
          <p className="text-sm font-medium text-foreground px-1">Filter by category</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(["all", "family", "village", "subject", "personal"] as const).map((filter) => {
              const isAll = filter === "all";
              const config = isAll ? null : categoryConfig[filter];

              return (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    activeFilter === filter
                      ? isAll
                        ? "bg-primary text-primary-foreground"
                        : `${config?.bgColor} ${config?.color} border ${config?.borderColor}`
                      : "glass-card border border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {isAll ? "All Tasks" : config?.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TASK LIST */}
        <div className="space-y-4">
          {/* Status Label */}
          {selectedStatusFilter !== "all" && (
            <div className="flex items-center justify-between px-1 py-2 border-b border-border/30">
              <p className="text-sm font-semibold text-foreground">
                📋 Showing: {getStatusLabel()}
              </p>
              <button
                onClick={() => setSelectedStatusFilter("all")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                View All
              </button>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3">
            {displayedTasks.length === 0 ? (
              <div className="glass-card border border-border rounded-lg p-8 text-center">
                <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">
                  {selectedStatusFilter === "completed" && "No completed tasks yet"}
                  {selectedStatusFilter === "active" && "No active tasks"}
                  {selectedStatusFilter === "available" && "No available tasks"}
                  {selectedStatusFilter === "all" && "No tasks available"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedStatusFilter !== "all" && selectedCategory !== "all"
                    ? "Try selecting a different category"
                    : selectedStatusFilter === "completed"
                    ? "Complete tasks to earn rewards!"
                    : selectedStatusFilter === "available"
                    ? "Check back soon for more tasks"
                    : "Start an available task to get going!"}
                </p>
              </div>
            ) : (
              displayedTasks.map((userTask, index) => {
                const taskDef = allTasks.find((t) => t.id === userTask.taskId);
                if (!taskDef) return null;

                const catConfig = categoryConfig[taskDef.category];
                const statusCfg = statusConfig[userTask.status];
                const StatusIcon = statusCfg.icon;
                const CategoryIcon = catConfig.icon;

                const isCompleted = userTask.status === "completed";
                const isActive = userTask.status === "in_progress";
                const isAvailable = userTask.status === "available";

                // Determine verification status for completed tasks (demo purposes)
                const getCompletionStatus = () => {
                  if (!isCompleted) return null;
                  const statusRandom = Math.random();
                  if (statusRandom < 0.5) return "verified"; // ✅ Verified
                  if (statusRandom < 0.8) return "pending"; // ⏳ Pending
                  return "rejected"; // ❌ Rejected
                };

                const completionStatus = getCompletionStatus();

                return (
                  <Card
                    key={userTask.id}
                    className={`glass-card border transition-all cursor-pointer slide-up ${
                      isCompleted ? "opacity-60 border-border/50" : "border-border hover:border-primary/50"
                    }`}
                    style={{ animationDelay: `${100 + index * 50}ms` }}
                    onClick={() => handleSelectTask(userTask.id)}
                  >
                    <div className="p-4 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start gap-3">
                        {/* Status Icon */}
                        <div className="pt-1">
                          <StatusIcon className={`h-5 w-5 ${statusCfg.color}`} />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          {/* Category & Time */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${catConfig.bgColor} ${catConfig.color} ${catConfig.borderColor}`}
                            >
                              <CategoryIcon className="h-3 w-3" />
                              {taskDef.category}
                            </span>

                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {taskDef.estimatedTime} min
                            </span>

                            {taskDef.timeFrame !== "anytime" && (
                              <Badge variant="outline" className="text-xs">
                                {taskDef.timeFrame === "today" ? "Today" : "This week"}
                              </Badge>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="font-heading font-semibold text-foreground mb-1 line-clamp-2">
                            {taskDef.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {taskDef.description}
                          </p>

                          {/* STATUS-SPECIFIC INFO */}
                          {/* Completed Task - Verification Status */}
                          {isCompleted && completionStatus && (
                            <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                              completionStatus === "verified"
                                ? "bg-secondary/20 text-secondary"
                                : completionStatus === "pending"
                                ? "bg-accent/20 text-accent"
                                : "bg-destructive/20 text-destructive"
                            }`}>
                              {completionStatus === "verified" && (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  ✅ Verified by Teacher
                                </>
                              )}
                              {completionStatus === "pending" && (
                                <>
                                  <Clock className="h-4 w-4" />
                                  ⏳ Pending Verification
                                </>
                              )}
                              {completionStatus === "rejected" && (
                                <>
                                  <AlertCircle className="h-4 w-4" />
                                  ❌ Rejected - Please retry
                                </>
                              )}
                            </div>
                          )}

                          {/* Active Task - Progress */}
                          {isActive && (
                            <div className="mb-3 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-foreground">Progress</span>
                                <span className="text-muted-foreground">65%</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full" style={{ width: "65%" }}></div>
                              </div>
                              <p className="text-xs text-muted-foreground">In progress...</p>
                            </div>
                          )}

                          {/* Proof Requirements */}
                          {taskDef.proofPolicy.type !== "none" && !isCompleted && (
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {taskDef.proofPolicy.type === "photo" && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                                  📸 Photo
                                </span>
                              )}
                              {taskDef.proofPolicy.type === "text" && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                                  ✍️ Write
                                </span>
                              )}
                              {taskDef.proofPolicy.type === "auto" && (
                                <span className="flex items-center gap-1 text-xs text-secondary bg-secondary/10 px-2 py-1 rounded">
                                  ✓ Auto
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer: Rewards & Status */}
                          <div className="flex items-center justify-between">
                            {/* Rewards */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-sm font-semibold text-accent">
                                <Coins className="h-4 w-4" />
                                {taskDef.reward.eduCoins}
                              </div>
                              <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                                <TrendingUp className="h-4 w-4" />
                                {taskDef.reward.xp} XP
                              </div>
                            </div>

                            {/* Status Badge */}
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isCompleted
                                  ? "bg-secondary/10 text-secondary"
                                  : isActive
                                  ? "bg-accent/10 text-accent"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {statusCfg.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* CTA Buttons - Status Specific */}
                      {isAvailable && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTask(userTask.id);
                          }}
                          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm font-semibold"
                          size="sm"
                        >
                          🚀 Start Task
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}

                      {isActive && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTask(userTask.id);
                          }}
                          className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-sm font-semibold"
                          size="sm"
                        >
                          ▶️ Continue Task
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}

                      {isCompleted && (
                        <div className="flex items-center justify-center gap-2 text-secondary text-sm font-medium py-2 bg-secondary/10 rounded-lg">
                          <CheckCircle2 className="h-4 w-4" />
                          ✅ Completed
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Locked Tasks Section - Only show when viewing all tasks */}
          {lockedTasks.length > 0 && selectedStatusFilter === "all" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Upcoming Tasks</h3>
                <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                  {lockedTasks.length}
                </span>
              </div>
              
              {lockedTasks.map((userTask, index) => {
                const taskDef = allTasks.find((t) => t.id === userTask.taskId);
                if (!taskDef) return null;

                const catConfig = categoryConfig[taskDef.category];
                const CategoryIcon = catConfig.icon;

                return (
                  <Card
                    key={userTask.id}
                    className="glass-card border border-border/50 opacity-60 slide-up"
                    style={{ animationDelay: `${200 + index * 50}ms` }}
                  >
                    <div className="p-4 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start gap-3">
                        {/* Lock Icon */}
                        <div className="pt-1">
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          {/* Category & Time */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-muted bg-muted/20 text-muted-foreground`}
                            >
                              <CategoryIcon className="h-3 w-3" />
                              {taskDef.category}
                            </span>

                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {taskDef.estimatedTime} min
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-heading font-semibold text-muted-foreground mb-1 line-clamp-2">
                            {taskDef.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground/70 mb-3 line-clamp-2">
                            {taskDef.description}
                          </p>

                          {/* Footer: Rewards & Unlock Condition */}
                          <div className="flex items-center justify-between">
                            {/* Rewards */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Coins className="h-4 w-4" />
                                {taskDef.reward.eduCoins}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                {taskDef.reward.xp} XP
                              </div>
                            </div>

                            {/* Lock Badge */}
                            <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                              Locked
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Unlock Condition */}
                      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-1 bg-muted/10 rounded">
                        <Lock className="h-4 w-4" />
                        Complete {availableTasks.length > 0 ? '1 more task' : 'more tasks'} to unlock
                      </div>
                    </div>
                  </Card>
                );
              })
            }
          </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {userTasks.length === 0 && (
          <div className="glass-card border border-border rounded-lg p-8 text-center">
            <Award className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">
              No tasks available yet
            </h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Check back soon when new tasks are released, or explore the app to find other learning opportunities!
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
