import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { OfflineIndicator, InstallPrompt } from "@/components/pwa";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { ProtectedRoute } from "@/components/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import '@/i18n/config';

// Eager load critical pages
import SplashPage from "./pages/SplashPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import AuthPage from "./pages/AuthPage";
import SignUpPage from "./pages/SignUpPage";
import NotFound from "./pages/NotFound";

// Lazy load other pages for better performance
const InstallPage = lazy(() => import("./pages/InstallPage"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const SubjectsPage = lazy(() => import("./pages/student/SubjectsPage"));
const TasksPage = lazy(() => import("./pages/student/TasksPage"));
const RewardsPage = lazy(() => import("./pages/student/RewardsPage"));
const ProgressPage = lazy(() => import("./pages/student/ProgressPage"));
const ProfilePage = lazy(() => import("./pages/student/ProfilePage"));
const ProfileSettingsPage = lazy(() => import("./pages/student/ProfileSettingsPage"));
const HelpPage = lazy(() => import("./pages/student/HelpPage"));
const SettingsPage = lazy(() => import("./pages/student/SettingsPage"));
const LearningModeSelectionPage = lazy(() => import("./pages/student/LearningModeSelectionPage"));
const PassiveLearningPage = lazy(() => import("./pages/student/PassiveLearningPage"));
const PhysicsSubjectPage = lazy(() => import("./pages/student/subjects/PhysicsSubjectPage"));
const ChemistrySubjectPage = lazy(() => import("./pages/student/subjects/ChemistrySubjectPage"));
const FinanceSubjectPage = lazy(() => import("./pages/student/subjects/FinanceSubjectPage"));
const EntrepreneurshipSubjectPage = lazy(() => import("./pages/student/subjects/EntrepreneurshipSubjectPage"));
const EntrepreneurshipActiveLearningPage = lazy(() => import("./pages/student/subjects/EntrepreneurshipActiveLearningPage"));
const BiologySubjectPage = lazy(() => import("./pages/student/subjects/BiologySubjectPage"));
const MathematicsSubjectPage = lazy(() => import("./pages/student/subjects/MathematicsSubjectPage"));
const TechnologySubjectPage = lazy(() => import("./pages/student/subjects/TechnologySubjectPage"));
const TechnologyActiveLearningPage = lazy(() => import("./pages/student/subjects/TechnologyActiveLearningPage"));
const VillageSkillsSubjectPage = lazy(() => import("./pages/student/subjects/VillageSkillsSubjectPage"));
const VillageSkillsActiveLearningPage = lazy(() => import("./pages/student/subjects/VillageSkillsActiveLearningPage"));
const GameLevelPage = lazy(() => import("./pages/student/games/GameLevelPage"));
const LeaderboardPage = lazy(() => import("./pages/student/LeaderboardPage"));
const PhysicsPage = lazy(() => import("./pages/student/PhysicsPage"));
const ChemistryPage = lazy(() => import("./pages/student/ChemistryPage"));
const BiologyPage = lazy(() => import("./pages/student/BiologyPage"));
const MathematicsPage = lazy(() => import("./pages/student/MathematicsPage"));
const TechnologyPage = lazy(() => import("./pages/student/TechnologyPage"));
const FinancePage = lazy(() => import("./pages/student/FinancePage"));
const EntrepreneurshipPage = lazy(() => import("./pages/student/EntrepreneurshipPage"));
const VillageSkillsPage = lazy(() => import("./pages/student/VillageSkillsPage"));
const ProjectileMotion = lazy(() => import("./pages/student/games/ProjectileMotion"));
const VillagePhysicsExplorer = lazy(() => import("./pages/student/games/VillagePhysicsExplorer"));
const ForceBuilder = lazy(() => import("./pages/student/games/ForceBuilder"));
const EnergyQuest = lazy(() => import("./pages/student/games/EnergyQuest"));
const VillageLightUp = lazy(() => import("./pages/student/games/VillageLightUp"));
const LogicBlocksPuzzle = lazy(() => import("./pages/student/games/LogicBlocksPuzzle"));
const PropertyPuzzle = lazy(() => import("./pages/student/games/PropertyPuzzle"));
const MoleculeBuilder = lazy(() => import("./pages/student/games/MoleculeBuilder"));
const PeriodicTablePuzzle = lazy(() => import("./pages/student/games/PeriodicTablePuzzle"));
const ReactionDetective = lazy(() => import("./pages/student/games/ReactionDetective"));
const EquationBuilder = lazy(() => import("./pages/student/games/EquationBuilder"));
const BiologyExplorer = lazy(() => import("./pages/student/games/BiologyExplorer"));
const FoodChainHunter = lazy(() => import("./pages/student/games/FoodChainHunter"));
const SproutHelp = lazy(() => import("./pages/student/games/SproutHelp"));
const IdeaToIncomePage = lazy(() => import("./pages/student/games/IdeaToIncomePage"));
const StartupSurvivalPage = lazy(() => import("./pages/student/games/StartupSurvivalPage"));
const CustomerFirstPage = lazy(() => import("./pages/student/games/CustomerFirstPage"));
const CycleTap = lazy(() => import("./pages/student/games/CycleTap"));
const BuildACell = lazy(() => import("./pages/student/games/BuildACell"));
const GoodGermVsBadGerm = lazy(() => import("./pages/student/games/GoodGermVsBadGerm"));
const MathMissions = lazy(() => import("./pages/student/games/MathMissions"));
const TechnologyVillageLightUp = lazy(() => import("./pages/student/games/TechnologyVillageLightUp"));
const TechnologySystemBuilder = lazy(() => import("./pages/student/games/TechnologySystemBuilder"));
const TechnologyDebugDungeon = lazy(() => import("./pages/student/games/TechnologyDebugDungeon"));
const SmartFarmerGame = lazy(() => import("./pages/student/games/SmartFarmerGame"));
const WaterSaverGame = lazy(() => import("./pages/student/games/WaterSaverGame"));
const VillageMarketGame = lazy(() => import("./pages/student/games/VillageMarketGame"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const TeacherClassesPage = lazy(() => import("./pages/teacher/TeacherClassesPage"));
const TeacherClassDetailPage = lazy(() => import("./pages/teacher/TeacherClassDetailPage"));
const TeacherAnalyticsPage = lazy(() => import("./pages/teacher/TeacherAnalyticsPage"));
const TeacherTaskVerificationPage = lazy(() => import("./pages/teacher/TeacherTaskVerificationPage"));
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
const ParentChildProgressPage = lazy(() => import("./pages/parent/ParentChildProgressPage"));
const ParentFamilyTasksPage = lazy(() => import("./pages/parent/ParentFamilyTasksPage"));
const ParentRewardsHistoryPage = lazy(() => import("./pages/parent/ParentRewardsHistoryPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <InstallPrompt />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Splash & Auth */}
                <Route path="/" element={<Navigate to="/splash" replace />} />
                <Route path="/splash" element={<SplashPage />} />
                <Route path="/install" element={<InstallPage />} />
                <Route path="/role-selection" element={<RoleSelectionPage />} />
                <Route path="/login/:role" element={<AuthPage />} />
                <Route path="/register/:role" element={<SignUpPage />} />

                {/* Student Routes - Protected */}
                <Route path="/student/dashboard" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/student/subjects" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SubjectsPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/physics" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PhysicsPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/physics/projectile-motion" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ProjectileMotion />
                  </ProtectedRoute>
                } />
                <Route path="/student/physics/village-physics-explorer" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <VillagePhysicsExplorer />
                  </ProtectedRoute>
                } />
                <Route path="/student/physics/force-builder" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ForceBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/student/physics/energy-quest" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <EnergyQuest />
                  </ProtectedRoute>
                } />
                <Route path="/student/physics/village-light-up" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <VillageLightUp />
                  </ProtectedRoute>
                } />
                <Route path="/student/physics/logic-blocks-puzzle" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <LogicBlocksPuzzle />
                  </ProtectedRoute>
                } />
                <Route path="/student/chemistry" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ChemistryPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/chemistry/property-puzzle" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PropertyPuzzle />
                  </ProtectedRoute>
                } />
                <Route path="/student/chemistry/molecule-builder" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MoleculeBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/student/chemistry/periodic-table" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PeriodicTablePuzzle />
                  </ProtectedRoute>
                } />
                <Route path="/student/chemistry/reaction-detective" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ReactionDetective />
                  </ProtectedRoute>
                } />
                <Route path="/student/chemistry/equation-builder" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <EquationBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/student/biology" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <BiologyPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/biology/explorer" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <BiologyExplorer />
                  </ProtectedRoute>
                } />
                <Route path="/student/biology/food-chain" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <FoodChainHunter />
                  </ProtectedRoute>
                } />
                <Route path="/student/biology/sprout-help" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SproutHelp />
                  </ProtectedRoute>
                } />
                <Route path="/student/biology/cycle-tap" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <CycleTap />
                  </ProtectedRoute>
                } />
                <Route path="/student/biology/build-cell" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <BuildACell />
                  </ProtectedRoute>
                } />
                <Route path="/student/biology/germ-game" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <GoodGermVsBadGerm />
                  </ProtectedRoute>
                } />
                <Route path="/student/mathematics" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MathematicsPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/mathematics/missions" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MathMissions />
                  </ProtectedRoute>
                } />
                <Route path="/student/technology" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TechnologyPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/technology/village-light-up" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TechnologyVillageLightUp />
                  </ProtectedRoute>
                } />
                <Route path="/student/technology/system-builder" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TechnologySystemBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/student/technology/debug-dungeon" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TechnologyDebugDungeon />
                  </ProtectedRoute>
                } />
                <Route path="/student/finance" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <FinancePage />
                  </ProtectedRoute>
                } />
                <Route path="/student/entrepreneurship" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <EntrepreneurshipPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/village-skills" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <VillageSkillsPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/village-skills/smart-farmer" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SmartFarmerGame />
                  </ProtectedRoute>
                } />
                <Route path="/student/village-skills/water-saver" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <WaterSaverGame />
                  </ProtectedRoute>
                } />
                <Route path="/student/village-skills/market-manager" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <VillageMarketGame />
                  </ProtectedRoute>
                } />
                <Route path="/student/tasks" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TasksPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/playcoins/wallet" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <RewardsPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/achievements" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ProgressPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/profile" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/student/profile/settings" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ProfileSettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/help" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <HelpPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                {/* Learning Mode Selection - New Flow */}
                <Route path="/learn/:subject" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <LearningModeSelectionPage />
                  </ProtectedRoute>
                } />
                
                {/* Active Learning (Game Levels) */}
                <Route path="/learn/physics/levels" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PhysicsSubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/chemistry/levels" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <ChemistrySubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/biology/levels" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <BiologySubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/mathematics/levels" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <MathematicsSubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/technology/levels" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TechnologySubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/technology/active-learning" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <TechnologyActiveLearningPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/finance/levels" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <FinanceSubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/entrepreneurship/levels" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <EntrepreneurshipSubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/entrepreneurship/active-learning" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <EntrepreneurshipActiveLearningPage />
                  </ProtectedRoute>
                } />

                {/* Entrepreneurship Games */}
                <Route path="/student/entrepreneurship/idea-to-income" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <IdeaToIncomePage />
                  </ProtectedRoute>
                } />
                <Route path="/student/entrepreneurship/startup-survival" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <StartupSurvivalPage />
                  </ProtectedRoute>
                } />
                <Route path="/student/entrepreneurship/customer-first" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <CustomerFirstPage />
                  </ProtectedRoute>
                } />

                <Route path="/learn/village-skills/levels" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <VillageSkillsSubjectPage />
                  </ProtectedRoute>
                } />
                <Route path="/learn/village-skills/active-learning" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <VillageSkillsActiveLearningPage />
                  </ProtectedRoute>
                } />

                {/* Passive Learning (Reading Pages) */}
                <Route path="/learn/:subject/read" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <PassiveLearningPage />
                  </ProtectedRoute>
                } />
                
                {/* Game Level Pages */}
                <Route path="/student/:subject/level/:levelId" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <GameLevelPage />
                  </ProtectedRoute>
                } />
                
                {/* Leaderboard */}
                <Route path="/student/leaderboard" element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <LeaderboardPage />
                  </ProtectedRoute>
                } />

                {/* Teacher Routes - Protected */}
                <Route path="/teacher/dashboard" element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/teacher/classes" element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherClassesPage />
                  </ProtectedRoute>
                } />
                <Route path="/teacher/class/:id" element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherClassDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/teacher/analytics" element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherAnalyticsPage />
                  </ProtectedRoute>
                } />
                <Route path="/teacher/tasks/verification" element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherTaskVerificationPage />
                  </ProtectedRoute>
                } />
                <Route path="/teacher/profile" element={
                  <ProtectedRoute allowedRoles={["teacher"]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                } />

                {/* Parent Routes - Protected */}
                <Route path="/parent/dashboard" element={
                  <ProtectedRoute allowedRoles={["parent"]}>
                    <ParentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/parent/child/progress" element={
                  <ProtectedRoute allowedRoles={["parent"]}>
                    <ParentChildProgressPage />
                  </ProtectedRoute>
                } />
                <Route path="/parent/family/tasks" element={
                  <ProtectedRoute allowedRoles={["parent"]}>
                    <ParentFamilyTasksPage />
                  </ProtectedRoute>
                } />
                <Route path="/parent/rewards/history" element={
                  <ProtectedRoute allowedRoles={["parent"]}>
                    <ParentRewardsHistoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/parent/profile" element={
                  <ProtectedRoute allowedRoles={["parent"]}>
                    <ParentDashboard />
                  </ProtectedRoute>
                } />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </WalletProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
