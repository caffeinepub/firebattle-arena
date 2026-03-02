import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Gift, Hash, Mail, Phone, User, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { PageLoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRegister, useUserProfile } from "../hooks/useQueries";

export function RegisterPage() {
  const navigate = useNavigate();
  const { identity, login, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const registerMutation = useRegister();

  const [form, setForm] = useState({
    username: "",
    email: "",
    freeFireUID: "",
    phoneNumber: "",
    referralCode: "",
  });

  // If already has profile, redirect home
  useEffect(() => {
    if (profile && !profileLoading) {
      navigate({ to: "/" });
    }
  }, [profile, profileLoading, navigate]);

  if (isInitializing || profileLoading) return <PageLoadingSkeleton />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      login();
      return;
    }
    await registerMutation.mutateAsync({
      username: form.username,
      email: form.email,
      freeFireUID: form.freeFireUID,
      phoneNumber: form.phoneNumber,
      referredByCode: form.referralCode || null,
    });
    navigate({ to: "/" });
  };

  const update =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-fire via-gold to-fire" />

          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-black text-foreground mb-1">
                Create Your Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                {!identity
                  ? "Sign in first, then complete your arena profile."
                  : "One last step — set up your arena profile."}
              </p>
            </div>

            {!identity ? (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                  You need to sign in with Internet Identity before registering.
                </div>
                <Button
                  className="w-full bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm font-bold"
                  onClick={login}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Sign In First
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-medium">
                    <User className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Username <span className="text-fire">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={update("username")}
                    placeholder="YourGamertag"
                    required
                    minLength={3}
                    className="bg-background border-border focus:border-fire"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    <Mail className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Email <span className="text-fire">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    required
                    className="bg-background border-border focus:border-fire"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="freeFireUID" className="text-sm font-medium">
                    <Hash className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Free Fire UID <span className="text-fire">*</span>
                  </Label>
                  <Input
                    id="freeFireUID"
                    value={form.freeFireUID}
                    onChange={update("freeFireUID")}
                    placeholder="123456789"
                    required
                    className="bg-background border-border focus:border-fire font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    <Phone className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Phone Number <span className="text-fire">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={update("phoneNumber")}
                    placeholder="+91 9876543210"
                    required
                    className="bg-background border-border focus:border-fire"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="referral" className="text-sm font-medium">
                    <Gift className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                    Referral Code{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="referral"
                    value={form.referralCode}
                    onChange={update("referralCode")}
                    placeholder="FRIEND123"
                    className="bg-background border-border focus:border-fire"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-fire text-primary-foreground hover:opacity-90 fire-glow-sm h-11 font-bold mt-2"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Enter the Arena
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
