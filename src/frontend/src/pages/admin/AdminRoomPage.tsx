import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Key, Lock, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { PageLoadingSkeleton } from "../../components/shared/LoadingSkeleton";
import {
  useTournament,
  useUploadRoomCredentials,
} from "../../hooks/useQueries";

export function AdminRoomPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const tournamentId = BigInt(id);

  const { data: tournament, isLoading } = useTournament(tournamentId);
  const uploadMutation = useUploadRoomCredentials();

  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (tournament) {
      setRoomId(tournament.roomId ?? "");
      setRoomPassword(tournament.roomPassword ?? "");
    }
  }, [tournament]);

  if (isLoading) return <PageLoadingSkeleton />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await uploadMutation.mutateAsync({ tournamentId, roomId, roomPassword });
  };

  return (
    <div className="p-4 sm:p-6 max-w-xl">
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
            <Key className="w-5 h-5 text-fire" />
            Room Credentials
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {tournament?.title ?? "Tournament"} — credentials revealed 10 min
            before match
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-5 text-sm text-blue-300">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Credentials are automatically revealed to joined players 10
              minutes before the match starts.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-muted-foreground" />
                Room ID <span className="text-fire">*</span>
              </Label>
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. 1234567890"
                required
                className="bg-background border-border focus:border-fire font-mono-gaming tracking-wider"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Room Password <span className="text-fire">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  placeholder="Room password"
                  required
                  className="bg-background border-border focus:border-fire font-mono-gaming pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm font-bold"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Room Credentials
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
