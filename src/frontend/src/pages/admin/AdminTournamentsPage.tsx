import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  Coins,
  Edit,
  Key,
  Plus,
  Swords,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { MatchType, TournamentStatus } from "../../backend.d";
import { EmptyState } from "../../components/shared/EmptyState";
import { TableRowSkeleton } from "../../components/shared/LoadingSkeleton";
import { useAllTournaments, useDeleteTournament } from "../../hooks/useQueries";
import { formatCoin, formatDateTime, nsToDate } from "../../utils/format";

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
          Upcoming
        </Badge>
      );
    case TournamentStatus.active:
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
          Live
        </Badge>
      );
    case TournamentStatus.completed:
      return (
        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/40 text-xs">
          Ended
        </Badge>
      );
    case TournamentStatus.cancelled:
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
          Cancelled
        </Badge>
      );
  }
};

export function AdminTournamentsPage() {
  const { data: tournaments, isLoading } = useAllTournaments();
  const deleteMutation = useDeleteTournament();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id.toString());
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <Swords className="w-5 h-5 text-fire" />
            Tournaments
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tournaments?.length ?? 0} total tournaments
          </p>
        </div>
        <Button
          asChild
          className="bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm font-semibold"
        >
          <Link to="/admin/tournaments/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Tournament
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-right">
                  <Coins className="w-3 h-3 inline mr-1" />
                  Fee
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-right">
                  <Trophy className="w-3 h-3 inline mr-1" />
                  Prize
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-center">
                  <Users className="w-3 h-3 inline mr-1" />
                  Slots
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => `sk-${i}`).map((key) => (
                  <TableRowSkeleton key={key} cols={8} />
                ))
              ) : !tournaments?.length ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState
                      icon="tournaments"
                      title="No Tournaments"
                      description="Create your first tournament to get started."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tournaments.map(([id, t]) => (
                  <TableRow key={id.toString()} className="border-border">
                    <TableCell>
                      <div className="font-medium text-sm text-foreground max-w-[140px] truncate">
                        {t.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t.mapType}
                      </div>
                    </TableCell>
                    <TableCell>{matchTypeBadge(t.matchType)}</TableCell>
                    <TableCell>{statusBadge(t.status)}</TableCell>
                    <TableCell className="text-right font-mono-gaming text-sm">
                      {formatCoin(t.entryFee)}
                    </TableCell>
                    <TableCell className="text-right font-mono-gaming text-sm text-gold">
                      {formatCoin(t.prizePool)}
                    </TableCell>
                    <TableCell className="text-center text-sm font-mono-gaming">
                      {Number(t.currentSlots)}/{Number(t.totalSlots)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(nsToDate(t.dateTime))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-fire"
                          title="Edit"
                        >
                          <Link
                            to="/admin/tournaments/$id/edit"
                            params={{ id: id.toString() }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-400"
                          title="Room"
                        >
                          <Link
                            to="/admin/tournaments/$id/room"
                            params={{ id: id.toString() }}
                          >
                            <Key className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-gold"
                          title="Results"
                        >
                          <Link
                            to="/admin/tournaments/$id/results"
                            params={{ id: id.toString() }}
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Tournament?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{t.title}". This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-muted border-border">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(id)}
                                disabled={deletingId === id.toString()}
                              >
                                {deletingId === id.toString()
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
