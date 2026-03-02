import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import type { Principal } from "@icp-sdk/core/principal";
import {
  Ban,
  CheckCircle,
  Coins,
  Minus,
  Plus,
  Search,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { UserProfile } from "../../backend.d";
import { EmptyState } from "../../components/shared/EmptyState";
import { TableRowSkeleton } from "../../components/shared/LoadingSkeleton";
import {
  useAdjustWallet,
  useAllUsers,
  useBanUser,
  useUnbanUser,
} from "../../hooks/useQueries";
import { formatCoin } from "../../utils/format";

function AdjustWalletModal({
  userId,
  username,
}: { userId: Principal; username: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isCredit, setIsCredit] = useState(true);
  const [reason, setReason] = useState("");
  const adjustMutation = useAdjustWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number.parseInt(amount, 10);
    if (!amt || amt <= 0) return;
    await adjustMutation.mutateAsync({
      userId,
      amount: BigInt(amt),
      isCredit,
      reason: reason || (isCredit ? "Admin credit" : "Admin debit"),
    });
    setOpen(false);
    setAmount("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-gold"
          title="Adjust Wallet"
        >
          <Coins className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold" />
            Adjust Wallet — {username}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Credit / Debit toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={isCredit ? "default" : "outline"}
              size="sm"
              className={
                isCredit
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "border-border"
              }
              onClick={() => setIsCredit(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Credit
            </Button>
            <Button
              type="button"
              variant={!isCredit ? "default" : "outline"}
              size="sm"
              className={
                !isCredit
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "border-border"
              }
              onClick={() => setIsCredit(false)}
            >
              <Minus className="w-3.5 h-3.5 mr-1" />
              Debit
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">
              Amount <span className="text-fire">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              required
              className="bg-background border-border focus:border-fire font-mono-gaming"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Prize correction, refund, etc."
              className="bg-background border-border focus:border-fire"
            />
          </div>

          <Button
            type="submit"
            className={`w-full font-bold ${isCredit ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
            disabled={adjustMutation.isPending}
          >
            {adjustMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isCredit ? "Add" : "Deduct"} {amount || "0"} coins
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminUsersPage() {
  const { data: users, isLoading } = useAllUsers();
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const [search, setSearch] = useState("");

  const filtered = (users ?? []).filter(([, profile]) => {
    const q = search.toLowerCase();
    return (
      !q ||
      profile.username.toLowerCase().includes(q) ||
      profile.email.toLowerCase().includes(q) ||
      profile.freeFireUID.toLowerCase().includes(q)
    );
  });

  const handleToggleBan = (userId: Principal, profile: UserProfile) => {
    if (profile.isBanned) {
      unbanMutation.mutate(userId);
    } else {
      banMutation.mutate(userId);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-fire" />
            Users
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {users?.length ?? 0} registered players
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 bg-card border-border focus:border-fire w-full sm:w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
                  Player
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground">
                  Free Fire UID
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-right">
                  Wallet
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-center">
                  Wins
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-center">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }, (_, i) => `sk-${i}`).map((key) => (
                  <TableRowSkeleton key={key} cols={6} />
                ))
              ) : !filtered.length ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon="users"
                      title={search ? "No Users Found" : "No Users Yet"}
                      description={
                        search
                          ? "Try a different search query."
                          : "Users will appear here once they register."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(([userId, profile]) => (
                  <TableRow key={userId.toString()} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-fire/10 border border-fire/20 flex items-center justify-center shrink-0">
                          <UserCog className="w-4 h-4 text-fire" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-foreground">
                            {profile.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {profile.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {profile.freeFireUID}
                    </TableCell>
                    <TableCell className="text-right font-mono-gaming text-sm text-gold">
                      {formatCoin(profile.walletBalance)}
                    </TableCell>
                    <TableCell className="text-center font-mono-gaming text-sm text-fire">
                      {profile.totalWins.toString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {profile.isBanned ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
                          Banned
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <AdjustWalletModal
                          userId={userId}
                          username={profile.username}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${
                            profile.isBanned
                              ? "text-muted-foreground hover:text-emerald-400"
                              : "text-muted-foreground hover:text-red-400"
                          }`}
                          title={profile.isBanned ? "Unban" : "Ban"}
                          onClick={() => handleToggleBan(userId, profile)}
                          disabled={
                            banMutation.isPending || unbanMutation.isPending
                          }
                        >
                          {profile.isBanned ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                        </Button>
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
