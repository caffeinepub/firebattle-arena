import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Coins,
  MapPin,
  Save,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MatchType } from "../../backend.d";
import { PageLoadingSkeleton } from "../../components/shared/LoadingSkeleton";
import {
  useCreateTournament,
  useEditTournament,
  useTournament,
} from "../../hooks/useQueries";
import { datetimeLocalToNs, nsToDatetimeLocal } from "../../utils/format";

interface TournamentFormProps {
  mode: "create" | "edit";
}

export function TournamentFormPage({ mode }: TournamentFormProps) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id?: string };
  const tournamentId = params.id ? BigInt(params.id) : null;

  const { data: existing, isLoading } = useTournament(
    mode === "edit" ? tournamentId : null,
  );
  const createMutation = useCreateTournament();
  const editMutation = useEditTournament();

  const [form, setForm] = useState({
    title: "",
    matchType: MatchType.solo as MatchType,
    entryFee: "",
    prizePool: "",
    mapType: "",
    dateTime: "",
    totalSlots: "",
  });

  useEffect(() => {
    if (mode === "edit" && existing) {
      setForm({
        title: existing.title,
        matchType: existing.matchType,
        entryFee: existing.entryFee.toString(),
        prizePool: existing.prizePool.toString(),
        mapType: existing.mapType,
        dateTime: nsToDatetimeLocal(existing.dateTime),
        totalSlots: existing.totalSlots.toString(),
      });
    }
  }, [existing, mode]);

  if (mode === "edit" && isLoading) return <PageLoadingSkeleton />;

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      matchType: form.matchType,
      entryFee: BigInt(Number.parseInt(form.entryFee, 10)),
      prizePool: BigInt(Number.parseInt(form.prizePool, 10)),
      mapType: form.mapType,
      dateTime: datetimeLocalToNs(form.dateTime),
      totalSlots: BigInt(Number.parseInt(form.totalSlots, 10)),
    };

    if (mode === "create") {
      await createMutation.mutateAsync(payload);
      navigate({ to: "/admin/tournaments" });
    } else if (tournamentId !== null) {
      await editMutation.mutateAsync({ tournamentId, ...payload });
      navigate({ to: "/admin/tournaments" });
    }
  };

  const isPending = createMutation.isPending || editMutation.isPending;

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
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
            <Swords className="w-5 h-5 text-fire" />
            {mode === "create" ? "Create Tournament" : "Edit Tournament"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {mode === "create"
              ? "Set up a new battle tournament"
              : "Update tournament details"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Tournament Title <span className="text-fire">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={update("title")}
                placeholder="e.g. FireStorm Championship #1"
                required
                className="bg-background border-border focus:border-fire"
              />
            </div>

            {/* Match Type + Map */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-muted-foreground" />
                  Match Type <span className="text-fire">*</span>
                </Label>
                <Select
                  value={form.matchType}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, matchType: v as MatchType }))
                  }
                >
                  <SelectTrigger className="bg-background border-border focus:border-fire">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value={MatchType.solo}>Solo</SelectItem>
                    <SelectItem value={MatchType.duo}>Duo</SelectItem>
                    <SelectItem value={MatchType.squad}>Squad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Map Type <span className="text-fire">*</span>
                </Label>
                <Input
                  value={form.mapType}
                  onChange={update("mapType")}
                  placeholder="e.g. Bermuda, Kalahari"
                  required
                  className="bg-background border-border focus:border-fire"
                />
              </div>
            </div>

            {/* Entry Fee + Prize Pool */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                  Entry Fee (coins) <span className="text-fire">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={form.entryFee}
                  onChange={update("entryFee")}
                  placeholder="50"
                  required
                  className="bg-background border-border focus:border-fire font-mono-gaming"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                  Prize Pool (coins) <span className="text-fire">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={form.prizePool}
                  onChange={update("prizePool")}
                  placeholder="5000"
                  required
                  className="bg-background border-border focus:border-fire font-mono-gaming"
                />
              </div>
            </div>

            {/* Date + Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  Date & Time <span className="text-fire">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={update("dateTime")}
                  required
                  className="bg-background border-border focus:border-fire"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  Total Slots <span className="text-fire">*</span>
                </Label>
                <Input
                  type="number"
                  min="2"
                  max="200"
                  value={form.totalSlots}
                  onChange={update("totalSlots")}
                  placeholder="20"
                  required
                  className="bg-background border-border focus:border-fire font-mono-gaming"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 sm:flex-none bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm font-bold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create Tournament" : "Save Changes"}
                  </>
                )}
              </Button>
              <Button
                asChild
                type="button"
                variant="outline"
                className="border-border"
              >
                <Link to="/admin/tournaments">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
