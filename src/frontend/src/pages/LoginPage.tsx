import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Flame, Shield, Swords, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

export function LoginPage() {
  const navigate = useNavigate();
  const { identity, login, isLoggingIn, isLoginSuccess } =
    useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  useEffect(() => {
    if (identity && !profileLoading) {
      if (profile) {
        navigate({ to: "/" });
      } else {
        navigate({ to: "/register" });
      }
    }
  }, [identity, profile, profileLoading, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-fire via-gold to-fire" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-fire/10 border border-fire/30 flex items-center justify-center mb-4 fire-glow">
                <img
                  src="/assets/generated/firebattle-logo-transparent.dim_200x200.png"
                  alt="FireBattle Arena"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <h1 className="font-display text-2xl font-black text-foreground mb-1">
                <span className="text-fire">Fire</span>Battle Arena
              </h1>
              <p className="text-sm text-muted-foreground text-center">
                Compete. Win. Dominate.
              </p>
            </div>

            {/* Login card */}
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Shield className="w-4 h-4 text-fire shrink-0" />
                  <span>Secure login via Internet Identity</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-gold shrink-0" />
                  <span>No password required — your key, your identity</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flame className="w-4 h-4 text-fire shrink-0" />
                  <span>One-click access to tournaments</span>
                </div>
              </div>

              <Button
                className="w-full bg-fire text-primary-foreground hover:opacity-90 fire-glow h-11 font-bold text-base"
                onClick={login}
                disabled={isLoggingIn || isLoginSuccess}
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4 mr-2" />
                    Sign In to Arena
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                New player?{" "}
                <Link to="/register" className="text-fire hover:underline">
                  Sign in and register your profile
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
