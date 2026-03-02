import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Check, Swords, Trophy, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { NotificationType } from "../backend.d";
import { EmptyState } from "../components/shared/EmptyState";
import { PageLoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMarkNotificationRead, useNotifications } from "../hooks/useQueries";
import { formatDateTime, nsToDate } from "../utils/format";

const notifIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.matchReminder:
      return <Swords className="w-4 h-4 text-fire" />;
    case NotificationType.result:
      return <Trophy className="w-4 h-4 text-gold" />;
    case NotificationType.walletUpdate:
      return <Wallet className="w-4 h-4 text-emerald-400" />;
  }
};

const notifBadge = (type: NotificationType) => {
  switch (type) {
    case NotificationType.matchReminder:
      return (
        <Badge className="bg-fire/20 text-fire border-fire/40 text-xs">
          Match
        </Badge>
      );
    case NotificationType.result:
      return (
        <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
          Result
        </Badge>
      );
    case NotificationType.walletUpdate:
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
          Wallet
        </Badge>
      );
  }
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  if (!identity) {
    navigate({ to: "/login" });
    return null;
  }

  if (isLoading) return <PageLoadingSkeleton />;

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-black text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-fire" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {!notifications || notifications.length === 0 ? (
          <EmptyState
            icon="bell"
            title="No Notifications"
            description="You're all caught up! Match reminders and results will appear here."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notif, i) => (
              <motion.div
                key={`${notif.timestamp}-${notif.notificationType}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border rounded-xl p-4 flex gap-3 transition-all ${
                  !notif.isRead ? "border-fire/30 bg-fire/5" : "border-border"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    notif.notificationType === NotificationType.matchReminder
                      ? "bg-fire/10"
                      : notif.notificationType === NotificationType.result
                        ? "bg-gold/10"
                        : "bg-emerald-500/10"
                  }`}
                >
                  {notifIcon(notif.notificationType)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notifBadge(notif.notificationType)}
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-fire shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDateTime(nsToDate(notif.timestamp))}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Mark read */}
                {!notif.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-emerald-400 shrink-0"
                    onClick={() => markRead.mutate(BigInt(i))}
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
