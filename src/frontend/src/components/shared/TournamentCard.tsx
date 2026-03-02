import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";
import { Clock, Coins, MapPin, Trophy, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { Tournament } from "../../backend.d";
import { MatchType, TournamentStatus } from "../../backend.d";
import {
  formatCoin,
  formatDateTime,
  nsToDate,
  timeUntil,
} from "../../utils/format";

interface TournamentCardProps {
  id: bigint;
  tournament: Tournament;
  onJoin?: (id: bigint) => void;
  onLeave?: (id: bigint) => void;
  isJoined?: boolean;
  isJoining?: boolean;
  isLeaving?: boolean;
  showActions?: boolean;
}

const matchTypeBadge = (type: MatchType) => {
  switch (type) {
    case MatchType.solo:
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 text-xs">
          SOLO
        </Badge>
      );
    case MatchType.duo:
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
          DUO
        </Badge>
      );
    case MatchType.squad:
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 text-xs">
          SQUAD
        </Badge>
      );
  }
};

const statusBadge = (status: TournamentStatus) => {
  switch (status) {
    case TournamentStatus.upcoming:
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40 text-xs">
          UPCOMING
        </Badge>
      );
    case TournamentStatus.active:
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-status-pulse" />
          LIVE
        </Badge>
      );
    case TournamentStatus.completed:
      return (
        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/40 text-xs">
          ENDED
        </Badge>
      );
    case TournamentStatus.cancelled:
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
          CANCELLED
        </Badge>
      );
  }
};

export function TournamentCard({
  id,
  tournament,
  onJoin,
  onLeave,
  isJoined,
  isJoining,
  isLeaving,
  showActions = true,
}: TournamentCardProps) {
  const matchDate = nsToDate(tournament.dateTime);
  const slotsUsed = Number(tournament.currentSlots);
  const totalSlots = Number(tournament.totalSlots);
  const slotsPercent = totalSlots > 0 ? (slotsUsed / totalSlots) * 100 : 0;
  const isFull = slotsUsed >= totalSlots;
  const canJoin =
    !isJoined && !isFull && tournament.status === TournamentStatus.upcoming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-hover bg-card border border-border rounded-lg overflow-hidden"
    >
      {/* Top accent bar based on status */}
      <div
        className={`h-0.5 w-full ${
          tournament.status === TournamentStatus.active
            ? "bg-emerald-500 animate-pulse"
            : tournament.status === TournamentStatus.upcoming
              ? "bg-yellow-500"
              : tournament.status === TournamentStatus.completed
                ? "bg-muted"
                : "bg-red-500"
        }`}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground text-sm sm:text-base truncate">
              {tournament.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{tournament.mapType}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {statusBadge(tournament.status)}
            {matchTypeBadge(tournament.matchType)}
          </div>
        </div>

        {/* Prize & Fee */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-gold" />
            <span className="font-mono-gaming text-sm font-semibold text-gold">
              {formatCoin(tournament.prizePool)}
            </span>
            <span className="text-xs text-muted-foreground">prize</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono-gaming text-sm text-foreground">
              {formatCoin(tournament.entryFee)}
            </span>
            <span className="text-xs text-muted-foreground">entry</span>
          </div>
        </div>

        {/* Slots progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>
                {slotsUsed}/{totalSlots} players
              </span>
            </div>
            {isFull && <span className="text-red-400 font-medium">FULL</span>}
          </div>
          <Progress value={slotsPercent} className="h-1.5 bg-muted" />
        </div>

        {/* Date & Time */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDateTime(matchDate)}</span>
          </div>
          {tournament.status === TournamentStatus.upcoming && (
            <span className="text-fire font-medium">
              in {timeUntil(matchDate)}
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-1">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 border-border hover:border-fire hover:text-fire text-xs"
            >
              <Link to="/tournaments/$id" params={{ id: id.toString() }}>
                View Details
              </Link>
            </Button>
            {canJoin && onJoin && (
              <Button
                size="sm"
                className="flex-1 bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm text-xs font-semibold"
                onClick={() => onJoin(id)}
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <Zap className="w-3 h-3 animate-spin mr-1" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 mr-1" />
                    Join
                  </>
                )}
              </Button>
            )}
            {isJoined &&
              tournament.status === TournamentStatus.upcoming &&
              onLeave && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs"
                  onClick={() => onLeave(id)}
                  disabled={isLeaving}
                >
                  {isLeaving ? "Leaving..." : "Leave"}
                </Button>
              )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
