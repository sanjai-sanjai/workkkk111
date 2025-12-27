import { useQuery } from "@tanstack/react-query";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LeaderboardEntry {
  user_id: string;
  current_level: number;
  total_xp: number;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    village: string | null;
    school: string | null;
  };
}

export function useLeaderboard(limit = 20) {
  const { user } = useAuth();

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      // Return empty data if Supabase is not configured
      if (!hasSupabaseConfig()) {
        console.warn("Supabase not configured - returning demo leaderboard data");
        // Return demo data for development
        return [
          {
            user_id: "demo-1",
            current_level: 8,
            total_xp: 2450,
            profile: {
              full_name: "Demo Learner 1",
              avatar_url: null,
              village: "Demo Village",
              school: null,
            },
          },
          {
            user_id: "demo-2",
            current_level: 6,
            total_xp: 1800,
            profile: {
              full_name: "Demo Learner 2",
              avatar_url: null,
              village: "Demo Village",
              school: null,
            },
          },
        ];
      }

      try {
        // Get top users by XP with their profiles
        const { data: levels, error: levelsError } = await supabase
          .from("user_levels")
          .select(`
            user_id,
            current_level,
            total_xp
          `)
          .order("total_xp", { ascending: false })
          .limit(limit);

        if (levelsError) throw levelsError;

        // Get profiles for these users
        const userIds = levels?.map(l => l.user_id) ?? [];
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, village, school")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Merge data
        const profileMap = new Map(profiles?.map(p => [p.id, p]));
        const entries: LeaderboardEntry[] = levels?.map(level => ({
          ...level,
          profile: profileMap.get(level.user_id) ? {
            full_name: profileMap.get(level.user_id)!.full_name,
            avatar_url: profileMap.get(level.user_id)!.avatar_url,
            village: profileMap.get(level.user_id)!.village,
            school: profileMap.get(level.user_id)!.school,
          } : undefined
        })) ?? [];

        return entries;
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        // Return empty array on error instead of throwing
        return [];
      }
    },
  });

  // Find current user's rank
  const userRank = leaderboardQuery.data?.findIndex(
    entry => entry.user_id === user?.id
  );

  return {
    leaderboard: leaderboardQuery.data ?? [],
    userRank: userRank !== undefined && userRank >= 0 ? userRank + 1 : null,
    isLoading: leaderboardQuery.isLoading,
  };
}
