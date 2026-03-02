import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Principal } from "@icp-sdk/core/principal";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BarChart2, Info, Plus, Trash2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLoadingSkeleton } from "../../components/shared/LoadingSkeleton";
import {
  useTournament,
  useTournamentParticipants,
  useUploadResults,
} from "../../hooks/useQueries";

interface ResultRow {
  principalStr: string;
  position: string;
  kills: string;
}

export function AdminResultsPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const tournamentId = BigInt(id);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const { data: participants } = useTournamentParticipants(tournamentId);
  const uploadMutation = useUploadResults();

  const [rows, setRows] = useState<ResultRow[]>([
    { principalStr: "", position: "1", kills: "0" },
  ]);

  if (isLoading) return <PageLoadingSkeleton />;

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { principalStr: "", position: "", kills: "0" },
    ]);

  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = (i: number, key: keyof ResultRow, value: string) => {
    setRows((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)),
    );
  };

  const fillFromParticipants = () => {
    if (!participants?.length) return;
    setRows(
      participants.map((p, i) => ({
        principalStr: p.toString(),
        position: String(i + 1),
        kills: "0",
      })),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resultsList: Array<[Principal, bigint, bigint]> = [];
    for (const row of rows) {
      if (!row.principalStr || !row.position) {
        toast.error("All rows must have a Principal and Position.");
        return;
      }
      try {
        const principal = Principal.fromText(row.principalStr);
        const position = BigInt(Number.parseInt(row.position, 10));
        const kills = BigInt(Number.parseInt(row.kills, 10) || 0);
        resultsList.push([principal, position, kills]);
      } catch {
        toast.error(`Invalid Principal: ${row.principalStr}`);
        return;
      }
    }

    await uploadMutation.mutateAsync({ tournamentId, resultsList });
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <Link to="/admin/tournaments">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tournaments
        </Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6">
          <h1 className="font-display text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-fire" />
            Upload Results
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tournament?.title ?? "Tournament"} — prizes auto-distributed on
            submit
          </p>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gold/10 border border-gold/20 mb-5 text-sm text-yellow-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Points: 1st=10, 2nd=8, 3rd=6, 4th=4, 5th=2, kills=1pt each. Prizes
            are auto-calculated and distributed.
          </span>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm font-medium text-foreground">
              Results Table
            </div>
            <div className="flex gap-2">
              {participants && participants.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border text-xs hover:border-fire hover:text-fire"
                  onClick={fillFromParticipants}
                >
                  Auto-fill from Participants
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border text-xs hover:border-fire hover:text-fire"
                onClick={addRow}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Row
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs uppercase text-muted-foreground min-w-[200px]">
                      Player Principal
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground w-24">
                      Position
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground w-24">
                      Kills
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow
                      key={`row-${i}-${row.principalStr}`}
                      className="border-border"
                    >
                      <TableCell>
                        <Input
                          value={row.principalStr}
                          onChange={(e) =>
                            updateRow(i, "principalStr", e.target.value)
                          }
                          placeholder="xxxxx-xxxxx-xxxxx-..."
                          className="bg-background border-border focus:border-fire font-mono text-xs h-8"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={row.position}
                          onChange={(e) =>
                            updateRow(i, "position", e.target.value)
                          }
                          className="bg-background border-border focus:border-fire font-mono-gaming h-8"
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={row.kills}
                          onChange={(e) =>
                            updateRow(i, "kills", e.target.value)
                          }
                          className="bg-background border-border focus:border-fire font-mono-gaming h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeRow(i)}
                          disabled={rows.length === 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-border flex gap-3">
              <Button
                type="submit"
                className="flex-1 sm:flex-none bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm font-bold"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Distributing Prizes...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Results & Distribute Prizes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-border"
                onClick={addRow}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Row
              </Button>
            </div>
          </form>
        </div>

        {/* Participants reference */}
        {participants && participants.length > 0 && (
          <div className="mt-4 bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3 border-b border-border">
              <Label className="text-xs uppercase text-muted-foreground tracking-wider">
                Participants Reference ({participants.length} players)
              </Label>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {participants.map((p) => (
                <button
                  key={p.toString()}
                  type="button"
                  className="flex items-center gap-2 text-left hover:bg-muted/30 p-2 rounded text-xs transition-colors group"
                  onClick={() => {
                    const emptyRowIdx = rows.findIndex((r) => !r.principalStr);
                    if (emptyRowIdx >= 0) {
                      updateRow(emptyRowIdx, "principalStr", p.toString());
                    } else {
                      setRows((prev) => [
                        ...prev,
                        {
                          principalStr: p.toString(),
                          position: "",
                          kills: "0",
                        },
                      ]);
                    }
                  }}
                >
                  <span className="font-mono text-muted-foreground group-hover:text-foreground truncate">
                    {p.toString()}
                  </span>
                  <span className="text-fire opacity-0 group-hover:opacity-100 shrink-0">
                    +
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
