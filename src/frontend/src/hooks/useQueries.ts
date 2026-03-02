import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  DashboardStats,
  MatchType,
  Notification,
  Result,
  RevenueReport,
  Tournament,
  Transaction,
  UserProfile,
} from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Profile saved!");
    },
    onError: () => toast.error("Failed to save profile"),
  });
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      email,
      freeFireUID,
      phoneNumber,
      referredByCode,
    }: {
      username: string;
      email: string;
      freeFireUID: string;
      phoneNumber: string;
      referredByCode: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.register(
        username,
        email,
        freeFireUID,
        phoneNumber,
        referredByCode,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Registration successful! Welcome to FireBattle Arena!");
    },
    onError: (err) => toast.error(`Registration failed: ${err.message}`),
  });
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

export function useTransactionHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFunds() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.addFunds(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Funds added successfully!");
    },
    onError: (err) => toast.error(`Failed to add funds: ${err.message}`),
  });
}

// ─── Tournaments ──────────────────────────────────────────────────────────────

export function useAllTournaments() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[bigint, Tournament]>>({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTournaments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTournament(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Tournament | null>({
    queryKey: ["tournament", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return null;
      return actor.getTournament(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
  });
}

export function useJoinTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tournamentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.joinTournament(tournamentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Successfully joined tournament!");
    },
    onError: (err) => toast.error(`Failed to join: ${err.message}`),
  });
}

export function useLeaveTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tournamentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.leaveTournament(tournamentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Left tournament.");
    },
    onError: (err) => toast.error(`Failed to leave: ${err.message}`),
  });
}

export function useRoomCredentials(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["roomCredentials", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return null;
      return actor.getRoomCredentials(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
    refetchInterval: 30_000,
  });
}

export function useResults(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Result[]>({
    queryKey: ["results", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return [];
      return actor.getResults(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markNotificationAsRead(index);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats | null>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRevenueReport() {
  const { actor, isFetching } = useActor();
  return useQuery<RevenueReport | null>({
    queryKey: ["revenueReport"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRevenueReport();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTournamentParticipants(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["participants", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return [];
      return actor.getTournamentParticipants(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
  });
}

export function useCreateTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      matchType,
      entryFee,
      prizePool,
      mapType,
      dateTime,
      totalSlots,
    }: {
      title: string;
      matchType: MatchType;
      entryFee: bigint;
      prizePool: bigint;
      mapType: string;
      dateTime: bigint;
      totalSlots: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTournament(
        title,
        matchType,
        entryFee,
        prizePool,
        mapType,
        dateTime,
        totalSlots,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success("Tournament created!");
    },
    onError: (err) => toast.error(`Failed to create: ${err.message}`),
  });
}

export function useEditTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      title,
      matchType,
      entryFee,
      prizePool,
      mapType,
      dateTime,
      totalSlots,
    }: {
      tournamentId: bigint;
      title: string;
      matchType: MatchType;
      entryFee: bigint;
      prizePool: bigint;
      mapType: string;
      dateTime: bigint;
      totalSlots: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.editTournament(
        tournamentId,
        title,
        matchType,
        entryFee,
        prizePool,
        mapType,
        dateTime,
        totalSlots,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
      toast.success("Tournament updated!");
    },
    onError: (err) => toast.error(`Failed to update: ${err.message}`),
  });
}

export function useDeleteTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tournamentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTournament(tournamentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success("Tournament deleted.");
    },
    onError: (err) => toast.error(`Failed to delete: ${err.message}`),
  });
}

export function useUploadRoomCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      roomId,
      roomPassword,
    }: {
      tournamentId: bigint;
      roomId: string;
      roomPassword: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.uploadRoomCredentials(tournamentId, roomId, roomPassword);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament"] });
      queryClient.invalidateQueries({ queryKey: ["roomCredentials"] });
      toast.success("Room credentials uploaded!");
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });
}

export function useUploadResults() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tournamentId,
      resultsList,
    }: {
      tournamentId: bigint;
      resultsList: Array<[Principal, bigint, bigint]>;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.uploadResults(tournamentId, resultsList);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success("Results uploaded and prizes distributed!");
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });
}

export function useBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.banUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success("User banned.");
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });
}

export function useUnbanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.unbanUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success("User unbanned.");
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });
}

export function useAdjustWallet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      isCredit,
      reason,
    }: {
      userId: Principal;
      amount: bigint;
      isCredit: boolean;
      reason: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adjustWallet(userId, amount, isCredit, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Wallet adjusted.");
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });
}
