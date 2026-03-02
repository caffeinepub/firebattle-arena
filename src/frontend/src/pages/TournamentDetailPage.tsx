import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Coins,
  Copy,
  Lock,
  MapPin,
  Skull,
  Star,
  Trophy,
  Unlock,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { MatchType, TournamentStatus } from "../backend.d";
import { PageLoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useJoinTournament,
  useLeaveTournament,
  useResults,
  useRoomCredentials,
  useTournament,
  useUserProfile,
} from "../hooks/useQueries";
import {
  formatCoin,
  formatDateTime,
  nsToDate,
  timeUntil,
} from "../utils/format";

function CopyableField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
      <div>
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        <div className="font-mono-gaming text-sm font-semibold text-foreground">
          {value}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </Button>
    </div>
  );
}

const matchTypeBadge = (type: MatchType) => {
  switch (type) {
    case MatchType.solo:
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">
          SOLO
        </Badge>
      );
    case MatchType.duo:
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
          DUO
        </Badge>
      );
    case MatchType.squad:
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40">
          SQUAD
        </Badge>
      );
  }
};

const statusBadge = (status: TournamentStatus) => {
  switch (status) {
    case TournamentStatus.upcoming:
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
          UPCOMING
        </Badge>
      );
    case TournamentStatus.active:
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-status-pulse" />
          LIVE
        </Badge>
      );
    case TournamentStatus.completed:
      return (
        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/40">
          ENDED
        </Badge>
      );
    case TournamentStatus.cancelled:
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
          CANCELLED
        </Badge>
      );
  }
};

export function TournamentDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const tournamentId = BigInt(id);

  const { identity } = useInternetIdentity();
  const { data: tournament, isLoading } = useTournament(tournamentId);
  const { data: profile } = useUserProfile();
  const { data: roomCreds } = useRoomCredentials(tournamentId);
  const { data: results } = useResults(tournamentId);
  const joinMutation = useJoinTournament();
  const leaveMutation = useLeaveTournament();

  if (isLoading) return <PageLoadingSkeleton />;
  if (!tournament)
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Tournament Not Found
        </h2>
        <Button asChild variant="ghost">
          <Link to="/tournaments">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>
    );

  const myPrincipal = identity?.getPrincipal();
  const isJoined = myPrincipal
    ? tournament.participants.some(
        (p: Principal) => p.toString() === myPrincipal.toString(),
      )
    : false;

  const matchDate = nsToDate(tournament.dateTime);
  const slotsUsed = Number(tournament.currentSlots);
  const totalSlots = Number(tournament.totalSlots);
  const slotsPercent = totalSlots > 0 ? (slotsUsed / totalSlots) * 100 : 0;
  const isFull = slotsUsed >= totalSlots;
  const canJoin =
    !isJoined && !isFull && tournament.status === TournamentStatus.upcoming;
  const canLeave = isJoined && tournament.status === TournamentStatus.upcoming;

  const sortedResults = [...(results ?? [])].sort(
    (a, b) => Number(b.totalPoints) - Number(a.totalPoints),
  );

  const positionLabel = (pos: bigint) => {
    const n = Number(pos);
    if (n === 1) return "🥇";
    if (n === 2) return "🥈";
    if (n === 3) return "🥉";
    return `#${n}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 text-muted-foreground hover:text-foreground -ml-2"
      >
        <Link to="/tournaments">
          <ArrowLeft className="w-4 h-4 mr-2" />
          All Tournaments
        </Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
          <div
            className={`h-1 w-full ${
              tournament.status === TournamentStatus.active
                ? "bg-emerald-500"
                : tournament.status === TournamentStatus.upcoming
                  ? "bg-yellow-500"
                  : tournament.status === TournamentStatus.completed
                    ? "bg-muted"
                    : "bg-red-500"
            }`}
          />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {statusBadge(tournament.status)}
                  {matchTypeBadge(tournament.matchType)}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                  {tournament.title}
                </h1>
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{tournament.mapType}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:text-right">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Prize Pool
                  </div>
                  <div className="font-mono-gaming text-2xl font-bold text-gold flex items-center gap-1 sm:justify-end">
                    <Trophy className="w-5 h-5" />
                    {formatCoin(tournament.prizePool)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Entry Fee</div>
                  <div className="font-mono-gaming text-lg font-semibold text-foreground flex items-center gap-1 sm:justify-end">
                    <Coins className="w-4 h-4 text-muted-foreground" />
                    {formatCoin(tournament.entryFee)}
                  </div>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">Date</div>
                <div className="text-sm font-medium text-foreground">
                  {formatDateTime(matchDate)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-0.5">
                  Starts in
                </div>
                <div className="text-sm font-medium text-fire">
                  {timeUntil(matchDate)}
                </div>
              </div>
              <div className="text-center col-span-2">
                <div className="text-xs text-muted-foreground mb-1">
                  <Users className="w-3 h-3 inline mr-1" />
                  Slots: {slotsUsed}/{totalSlots}
                </div>
                <Progress value={slotsPercent} className="h-2 bg-muted" />
              </div>
            </div>

            {/* Join / Leave */}
            {identity && profile && (
              <div className="mt-4 flex gap-2">
                {canJoin && (
                  <Button
                    className="flex-1 sm:flex-none bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm font-semibold"
                    onClick={() => joinMutation.mutate(tournamentId)}
                    disabled={joinMutation.isPending}
                  >
                    {joinMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Join Tournament
                      </>
                    )}
                  </Button>
                )}
                {canLeave && (
                  <Button
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                    onClick={() => leaveMutation.mutate(tournamentId)}
                    disabled={leaveMutation.isPending}
                  >
                    {leaveMutation.isPending
                      ? "Leaving..."
                      : "Leave Tournament"}
                  </Button>
                )}
                {isJoined &&
                  tournament.status !== TournamentStatus.upcoming && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                      ✓ You're in this tournament
                    </Badge>
                  )}
              </div>
            )}

            {isFull && !isJoined && (
              <div className="mt-3 text-sm text-red-400 font-medium">
                Tournament is full.
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="room">
          <TabsList className="bg-card border border-border w-full grid grid-cols-2">
            <TabsTrigger
              value="room"
              className="data-[state=active]:bg-fire/20 data-[state=active]:text-fire"
            >
              Room Details
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-fire/20 data-[state=active]:text-fire"
            >
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Room Credentials */}
          <TabsContent value="room" className="mt-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-fire" />
                Room Credentials
              </h2>

              {!isJoined ? (
                <div className="text-center py-8">
                  <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Join this tournament to access room details.
                  </p>
                </div>
              ) : roomCreds ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium mb-4">
                    <Unlock className="w-4 h-4" />
                    Room is live! Access credentials below:
                  </div>
                  <CopyableField value={roomCreds.roomId} label="Room ID" />
                  <CopyableField
                    value={roomCreds.roomPassword}
                    label="Room Password"
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">
                    Credentials Not Available Yet
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Room ID and password will be revealed 10 minutes before the
                    match starts.
                  </p>
                  <div className="mt-3 text-sm text-fire font-medium">
                    Match in: {timeUntil(matchDate)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="mt-4">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" />
                  Match Results
                </h2>
              </div>

              {sortedResults.length === 0 ? (
                <div className="p-10 text-center">
                  <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">
                    No Results Yet
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Results will appear here after the match ends.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs uppercase text-muted-foreground">
                          Rank
                        </TableHead>
                        <TableHead className="text-xs uppercase text-muted-foreground">
                          Player
                        </TableHead>
                        <TableHead className="text-xs uppercase text-muted-foreground text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Skull className="w-3 h-3" />
                            Kills
                          </div>
                        </TableHead>
                        <TableHead className="text-xs uppercase text-muted-foreground text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Star className="w-3 h-3" />
                            Points
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedResults.map((result, i) => (
                        <TableRow
                          key={`${result.userId.toString()}-${result.position}`}
                          className={`border-border ${i < 3 ? "bg-gold/5" : ""}`}
                        >
                          <TableCell className="font-mono-gaming font-bold text-lg">
                            {positionLabel(result.position)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {result.userId.toString().slice(0, 12)}...
                          </TableCell>
                          <TableCell className="text-right font-mono-gaming font-semibold">
                            {result.kills.toString()}
                          </TableCell>
                          <TableCell className="text-right font-mono-gaming font-bold text-gold">
                            {result.totalPoints.toString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
