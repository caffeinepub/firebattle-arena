import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Principal } from "@icp-sdk/core/principal";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { MatchType, TournamentStatus } from "../backend.d";
import { EmptyState } from "../components/shared/EmptyState";
import { TournamentCardSkeleton } from "../components/shared/LoadingSkeleton";
import { TournamentCard } from "../components/shared/TournamentCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllTournaments,
  useJoinTournament,
  useLeaveTournament,
  useUserProfile,
} from "../hooks/useQueries";

type StatusFilter = "all" | TournamentStatus;
type TypeFilter = "all" | MatchType;

export function TournamentsPage() {
  const { identity } = useInternetIdentity();
  const { data: tournaments, isLoading } = useAllTournaments();
  const { data: profile } = useUserProfile();
  const joinMutation = useJoinTournament();
  const leaveMutation = useLeaveTournament();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const myPrincipal = identity?.getPrincipal();

  const isJoined = (participants: Principal[]) => {
    if (!myPrincipal) return false;
    return participants.some((p) => p.toString() === myPrincipal.toString());
  };

  const filtered = (tournaments ?? []).filter(([, t]) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.mapType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesType = typeFilter === "all" || t.matchType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleJoin = async (id: bigint) => {
    setJoiningId(id.toString());
    try {
      await joinMutation.mutateAsync(id);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (id: bigint) => {
    setLeavingId(id.toString());
    try {
      await leaveMutation.mutateAsync(id);
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground mb-1">
          Tournaments
        </h1>
        <p className="text-muted-foreground text-sm">
          {tournaments?.length ?? 0} tournaments available
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            className="pl-9 bg-card border-border focus:border-fire"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-36 bg-card border-border">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={TournamentStatus.upcoming}>Upcoming</SelectItem>
            <SelectItem value={TournamentStatus.active}>Live</SelectItem>
            <SelectItem value={TournamentStatus.completed}>Ended</SelectItem>
            <SelectItem value={TournamentStatus.cancelled}>
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as TypeFilter)}
        >
          <SelectTrigger className="w-full sm:w-36 bg-card border-border">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={MatchType.solo}>Solo</SelectItem>
            <SelectItem value={MatchType.duo}>Duo</SelectItem>
            <SelectItem value={MatchType.squad}>Squad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status tabs shortcut */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(
          [
            "all",
            TournamentStatus.upcoming,
            TournamentStatus.active,
            TournamentStatus.completed,
          ] as const
        ).map((s) => (
          <Button
            key={s}
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 text-xs h-7 px-3 ${
              statusFilter === s
                ? "bg-fire/20 text-fire border border-fire/40"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            {s === "all"
              ? "All"
              : s === TournamentStatus.active
                ? "🔴 Live"
                : s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }, (_, i) => `sk-${i}`).map((key) => (
            <TournamentCardSkeleton key={key} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="tournaments"
          title="No Tournaments Found"
          description="Try changing your filters or check back later for new tournaments."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(([id, tournament]) => (
            <TournamentCard
              key={id.toString()}
              id={id}
              tournament={tournament}
              isJoined={isJoined(tournament.participants)}
              onJoin={handleJoin}
              onLeave={handleLeave}
              isJoining={joiningId === id.toString()}
              isLeaving={leavingId === id.toString()}
              showActions={!!identity && !!profile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
