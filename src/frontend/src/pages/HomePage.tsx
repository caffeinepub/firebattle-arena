import { Button } from "@/components/ui/button";
import type { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Flame, Swords, Trophy, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { TournamentStatus } from "../backend.d";
import { TournamentCardSkeleton } from "../components/shared/LoadingSkeleton";
import { TournamentCard } from "../components/shared/TournamentCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllTournaments,
  useJoinTournament,
  useLeaveTournament,
  useUserProfile,
} from "../hooks/useQueries";
import { formatCoin } from "../utils/format";

export function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: tournaments, isLoading } = useAllTournaments();
  const { data: profile } = useUserProfile();
  const joinMutation = useJoinTournament();
  const leaveMutation = useLeaveTournament();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const myPrincipal = identity?.getPrincipal();

  const activeTournaments =
    tournaments?.filter(
      ([, t]) =>
        t.status === TournamentStatus.active ||
        t.status === TournamentStatus.upcoming,
    ) ?? [];

  const totalPrizePool =
    tournaments?.reduce(
      (sum, [, t]) =>
        sum +
        (t.status !== TournamentStatus.cancelled ? t.prizePool : BigInt(0)),
      BigInt(0),
    ) ?? BigInt(0);

  const totalPlayers =
    tournaments?.reduce((sum, [, t]) => sum + Number(t.currentSlots), 0) ?? 0;

  const isJoined = (participants: Principal[]) => {
    if (!myPrincipal) return false;
    return participants.some((p) => p.toString() === myPrincipal.toString());
  };

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
    <div>
      {/* Hero Section */}
      <section className="relative hero-bg grid-pattern overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-fire/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gold/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-fire animate-flicker" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-fire">
                Free Fire Tournament Platform
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 leading-none">
              <span className="fire-text block">FireBattle</span>
              <span className="text-foreground">Arena</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl">
              Compete. Win. Dominate.
              <br />
              <span className="text-foreground">
                Join elite tournaments, climb the leaderboard, claim your prize.
              </span>
            </p>

            <div className="flex flex-wrap gap-3">
              {identity && profile ? (
                <Button
                  asChild
                  className="bg-fire text-primary-foreground hover:opacity-90 fire-glow h-10 px-6 font-semibold"
                >
                  <Link to="/tournaments">
                    <Swords className="w-4 h-4 mr-2" />
                    Browse Tournaments
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-fire text-primary-foreground hover:opacity-90 fire-glow h-10 px-6 font-semibold"
                >
                  <Link to="/register">
                    <Zap className="w-4 h-4 mr-2" />
                    Join Arena
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="border-border hover:border-fire hover:text-fire h-10 px-6"
              >
                <Link to="/tournaments">
                  View All Tournaments
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-3 gap-4 max-w-lg"
          >
            <div className="bg-card/60 border border-border rounded-lg p-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-fire" />
              </div>
              <div className="font-mono-gaming text-xl sm:text-2xl font-bold text-foreground">
                {totalPlayers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Players
              </div>
            </div>
            <div className="bg-card/60 border border-border rounded-lg p-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Swords className="w-4 h-4 text-fire" />
              </div>
              <div className="font-mono-gaming text-xl sm:text-2xl font-bold text-foreground">
                {activeTournaments.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Active</div>
            </div>
            <div className="bg-card/60 border border-border rounded-lg p-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Trophy className="w-4 h-4 text-gold" />
              </div>
              <div className="font-mono-gaming text-xl sm:text-2xl font-bold text-gold">
                {formatCoin(totalPrizePool)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Prize Pool
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Active / Upcoming Tournaments */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Active Tournaments
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Join now and prove your skills
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-fire hover:text-fire"
          >
            <Link to="/tournaments">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((key) => (
              <TournamentCardSkeleton key={key} />
            ))}
          </div>
        ) : activeTournaments.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-10 text-center">
            <Swords className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display font-semibold text-foreground mb-1">
              No Active Tournaments
            </h3>
            <p className="text-sm text-muted-foreground">
              Check back soon — battles are coming.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTournaments.slice(0, 6).map(([id, tournament]) => (
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
      </section>
    </div>
  );
}
