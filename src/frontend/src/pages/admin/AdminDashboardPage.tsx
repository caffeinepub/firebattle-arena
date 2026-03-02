import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  Swords,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { TransactionType } from "../../backend.d";
import {
  StatCardSkeleton,
  TableRowSkeleton,
} from "../../components/shared/LoadingSkeleton";
import { useDashboardStats } from "../../hooks/useQueries";
import { formatCoin, formatDateTime, nsToDate } from "../../utils/format";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: "fire" | "gold" | "emerald" | "blue";
}

function StatCard({ title, value, icon, color = "fire" }: StatCardProps) {
  const colors = {
    fire: "bg-fire/10 text-fire border-fire/20",
    gold: "bg-gold/10 text-gold border-gold/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
      <div className="font-mono-gaming text-2xl sm:text-3xl font-bold text-foreground mb-0.5">
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-fire" />
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Arena overview and stats
        </p>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 5 }, (_, i) => `sk-${i}`).map((key) => (
            <StatCardSkeleton key={key} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            title="Total Players"
            value={stats ? formatCoin(stats.totalUsers) : "0"}
            icon={<Users className="w-5 h-5" />}
            color="fire"
          />
          <StatCard
            title="Total Revenue"
            value={stats ? formatCoin(stats.totalRevenue) : "0"}
            icon={<Coins className="w-5 h-5" />}
            color="gold"
          />
          <StatCard
            title="Active Tournaments"
            value={stats ? stats.activeTournamentsCount.toString() : "0"}
            icon={<Swords className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Completed"
            value={stats ? stats.completedTournamentsCount.toString() : "0"}
            icon={<Trophy className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Commission Earned"
            value={stats ? formatCoin(stats.totalCommissionEarned) : "0"}
            icon={<TrendingUp className="w-5 h-5" />}
            color="gold"
          />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground flex items-center gap-2">
            <Coins className="w-4 h-4 text-fire" />
            Recent Transactions
          </h2>
        </div>

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
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => `sk-${i}`).map((key) => (
                  <TableRowSkeleton key={key} cols={4} />
                ))
              ) : !stats?.recentTransactions.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No recent transactions
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentTransactions.map((txn) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
