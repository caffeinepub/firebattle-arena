import { Coins, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { StatCardSkeleton } from "../../components/shared/LoadingSkeleton";
import { useRevenueReport } from "../../hooks/useQueries";
import { formatCoin } from "../../utils/format";

interface RevenueCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "fire" | "gold" | "red" | "emerald";
  description: string;
}

function RevenueCard({
  title,
  value,
  icon,
  color,
  description,
}: RevenueCardProps) {
  const colors = {
    fire: {
      bg: "bg-fire/10",
      border: "border-fire/20",
      text: "text-fire",
      valueBorder: "border-l-fire",
    },
    gold: {
      bg: "bg-gold/10",
      border: "border-gold/20",
      text: "text-gold",
      valueBorder: "border-l-gold",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      valueBorder: "border-l-red-400",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      valueBorder: "border-l-emerald-400",
    },
  };

  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border ${c.border} rounded-xl overflow-hidden`}
    >
      <div className={`h-1.5 bg-current ${c.text}`} />
      <div className="p-5 sm:p-6">
        <div
          className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4`}
        >
          <span className={c.text}>{icon}</span>
        </div>
        <div
          className={`font-mono-gaming text-3xl sm:text-4xl font-black ${c.text} mb-1`}
        >
          {value}
        </div>
        <div className="font-display font-semibold text-foreground text-lg mb-1">
          {title}
        </div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </motion.div>
  );
}

export function AdminRevenuePage() {
  const { data: report, isLoading } = useRevenueReport();

  const profit = report ? report.totalCommissionProfit : BigInt(0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-fire" />
          Revenue Report
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Platform financial overview
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => `sk-${i}`).map((key) => (
            <StatCardSkeleton key={key} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RevenueCard
            title="Entry Fees Collected"
            value={formatCoin(report?.totalEntryFeesCollected ?? BigInt(0))}
            icon={<Coins className="w-6 h-6" />}
            color="fire"
            description="Total entry fees from all tournaments"
          />
          <RevenueCard
            title="Prizes Distributed"
            value={formatCoin(report?.totalPrizesDistributed ?? BigInt(0))}
            icon={<TrendingDown className="w-6 h-6" />}
            color="red"
            description="Total prizes paid out to winners"
          />
          <RevenueCard
            title="Commission Profit"
            value={formatCoin(profit)}
            icon={<TrendingUp className="w-6 h-6" />}
            color="emerald"
            description="Net platform commission earned"
          />
        </div>
      )}

      {/* Summary breakdown */}
      {!isLoading && report && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5 sm:p-6"
        >
          <h2 className="font-display font-bold text-foreground mb-4">
            Revenue Breakdown
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Total Entry Fees
              </span>
              <span className="font-mono-gaming font-bold text-fire">
                +{formatCoin(report.totalEntryFeesCollected)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-sm text-muted-foreground">
                Total Prizes Paid
              </span>
              <span className="font-mono-gaming font-bold text-red-400">
                -{formatCoin(report.totalPrizesDistributed)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-semibold text-foreground">
                Net Commission
              </span>
              <span className="font-mono-gaming font-black text-emerald-400 text-lg">
                {formatCoin(profit)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
