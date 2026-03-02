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
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  CreditCard,
  Gift,
  Hash,
  LogOut,
  Plus,
  Shield,
  Swords,
  Trophy,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { TransactionType } from "../backend.d";
import { EmptyState } from "../components/shared/EmptyState";
import { PageLoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddFunds,
  useAllTournaments,
  useTransactionHistory,
  useUserProfile,
} from "../hooks/useQueries";
import { formatCoin, formatDateTime, nsToDate } from "../utils/format";

function AddFundsModal() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const addFunds = useAddFunds();

  const handlePay = async () => {
    const num = Number.parseInt(amount, 10);
    if (!num || num <= 0) return;
    await addFunds.mutateAsync(BigInt(num));
    setOpen(false);
    setAmount("");
  };

  const presets = [100, 500, 1000, 5000];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm text-sm font-semibold">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-fire" />
            Add Funds to Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <Button
                key={p}
                variant="outline"
                size="sm"
                className={`border-border hover:border-fire hover:text-fire ${
                  amount === p.toString()
                    ? "border-fire text-fire bg-fire/10"
                    : ""
                }`}
                onClick={() => setAmount(p.toString())}
              >
                <Coins className="w-3.5 h-3.5 mr-1 text-gold" />
                {formatCoin(p)}
              </Button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Custom Amount</Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background border-border focus:border-fire font-mono-gaming"
            />
          </div>

          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 inline mr-1 text-fire" />
            Mock payment simulation — funds credited instantly.
          </div>

          <Button
            className="w-full bg-fire text-primary-foreground hover:opacity-90 font-bold"
            onClick={handlePay}
            disabled={
              addFunds.isPending || !amount || Number.parseInt(amount) <= 0
            }
          >
            {addFunds.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Now — {amount ? formatCoin(Number.parseInt(amount)) : "0"}{" "}
                coins
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: transactions } = useTransactionHistory();
  const { data: tournaments } = useAllTournaments();

  if (!identity) {
    navigate({ to: "/login" });
    return null;
  }

  if (profileLoading) return <PageLoadingSkeleton />;

  if (!profile) {
    navigate({ to: "/register" });
    return null;
  }

  const myPrincipal = identity.getPrincipal();
  const joinedTournaments = (tournaments ?? []).filter(([, t]) =>
    t.participants.some(
      (p: Principal) => p.toString() === myPrincipal.toString(),
    ),
  );

  const tournamentsPlayed = joinedTournaments.length;

  const handleLogout = () => {
    clear();
    navigate({ to: "/" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-fire/20 border border-fire/40 flex items-center justify-center fire-glow-sm shrink-0">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-fire" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="font-display text-xl sm:text-2xl font-black text-foreground">
                  {profile.username}
                </h1>
                {profile.isBanned && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
                    BANNED
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  UID:{" "}
                  <span className="font-mono-gaming text-foreground">
                    {profile.freeFireUID}
                  </span>
                </span>
                <span className="text-border">|</span>
                <span>{profile.email}</span>
              </div>
              {profile.referralCode && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Gift className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs text-muted-foreground">
                    Referral:{" "}
                  </span>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-gold">
                    {profile.referralCode}
                  </code>
                </div>
              )}
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive shrink-0 self-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
            <div className="bg-background rounded-lg p-3 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Coins className="w-4 h-4 text-gold" />
              </div>
              <div className="font-mono-gaming text-lg sm:text-xl font-bold text-gold">
                {formatCoin(profile.walletBalance)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Balance
              </div>
            </div>
            <div className="bg-background rounded-lg p-3 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Trophy className="w-4 h-4 text-fire" />
              </div>
              <div className="font-mono-gaming text-lg sm:text-xl font-bold text-fire">
                {profile.totalWins.toString()}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Wins</div>
            </div>
            <div className="bg-background rounded-lg p-3 text-center border border-border">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Swords className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="font-mono-gaming text-lg sm:text-xl font-bold text-foreground">
                {tournamentsPlayed}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Played</div>
            </div>
          </div>

          {/* Wallet section */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">
                Wallet Balance
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Coins className="w-4 h-4 text-gold" />
                <span className="font-mono-gaming text-2xl font-bold text-gold">
                  {formatCoin(profile.walletBalance)}
                </span>
              </div>
            </div>
            <AddFundsModal />
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-fire" />
              Transaction History
            </h2>
            <Badge variant="outline" className="text-xs font-mono-gaming">
              {transactions?.length ?? 0} txns
            </Badge>
          </div>

          {!transactions || transactions.length === 0 ? (
            <EmptyState
              icon="revenue"
              title="No Transactions Yet"
              description="Your transaction history will appear here after you add funds or join tournaments."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs uppercase text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground text-right">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs uppercase text-muted-foreground text-right">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow
                      key={`${txn.timestamp}-${txn.amount}`}
                      className="border-border"
                    >
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {txn.transactionType === TransactionType.credit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <Badge
                            className={`text-xs border-0 ${
                              txn.transactionType === TransactionType.credit
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {txn.transactionType === TransactionType.credit
                              ? "Credit"
                              : "Debit"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                        {txn.description}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono-gaming font-semibold ${
                          txn.transactionType === TransactionType.credit
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {txn.transactionType === TransactionType.credit
                          ? "+"
                          : "-"}
                        {formatCoin(txn.amount)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(nsToDate(txn.timestamp))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Joined Tournaments */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground flex items-center gap-2">
              <Swords className="w-4 h-4 text-fire" />
              Tournament History
            </h2>
          </div>
          {joinedTournaments.length === 0 ? (
            <EmptyState
              icon="tournaments"
              title="No Tournaments Yet"
              description="Join your first tournament to start your journey."
              actionLabel="Browse Tournaments"
              actionTo="/tournaments"
            />
          ) : (
            <div className="divide-y divide-border">
              {joinedTournaments.map(([id, t]) => (
                <div
                  key={id.toString()}
                  className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm text-foreground">
                      {t.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t.mapType} • {formatDateTime(nsToDate(t.dateTime))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs bg-gold/20 text-gold border-gold/30">
                      <Trophy className="w-3 h-3 mr-1" />
                      {formatCoin(t.prizePool)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
