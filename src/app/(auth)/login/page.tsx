"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Terminal, Lock, Sliders, PieChart, ArrowRight, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const user = await authService.login(data);
      setUser(user);
      toast.success("Login successful! Redirecting...");
      
      // Delay navigation by 500ms to ensure the browser commits cookie writing
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast.error(err.response?.data?.error?.message || "Login failed");
      setIsLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setValue("email", "admin@smartstock.local", { shouldValidate: true });
    setValue("password", "admin123", { shouldValidate: true });
    toast.success("Loaded administrator credentials!");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px]">
      
      {/* Brutalist Geometric Background Objects */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 border-4 border-slate-900/5 dark:border-slate-100/5 rotate-12 pointer-events-none rounded-2xl" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-primary/5 border-4 border-slate-900/5 dark:border-slate-100/5 -rotate-45 pointer-events-none rounded-3xl" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: System Content */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="space-y-4">
            <span className="bg-primary text-primary-foreground border-[3px] border-slate-900 dark:border-slate-100 px-4 py-1.5 font-black inline-block text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              Enterprise Dashboard
            </span>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-none uppercase">
              SmartStock<span className="text-primary block sm:inline">.AI</span>
            </h1>
            <p className="text-lg font-bold text-muted-foreground max-w-xl">
              A high-contrast, AI-powered smart warehouse utility optimizing product velocity, reorder limits, and checkout flows.
            </p>
          </div>

          {/* Brutalist Bullet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card p-5 border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(241,245,249,1)]">
              <div className="p-2 bg-primary/10 border-2 border-slate-900 dark:border-slate-100 w-10 h-10 flex items-center justify-center mb-3">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wide">POS Checkout Terminal</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Scan barcode items, manage ledger payments, and tap shortcuts to compute customer change details instantly.
              </p>
            </div>

            <div className="bg-card p-5 border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(241,245,249,1)]">
              <div className="p-2 bg-primary/10 border-2 border-slate-900 dark:border-slate-100 w-10 h-10 flex items-center justify-center mb-3">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wide">AI Forecasting</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Localized machine learning forecasts compute precise reorder dates, alert limits, and stock velocity.
              </p>
            </div>

            <div className="bg-card p-5 border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(241,245,249,1)]">
              <div className="p-2 bg-primary/10 border-2 border-slate-900 dark:border-slate-100 w-10 h-10 flex items-center justify-center mb-3">
                <Sliders className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wide">Brand CRUD Schema</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Cascade-rename relationships link brand selectors to suppliers, categories, and safety-stock metrics.
              </p>
            </div>

            <div className="bg-card p-5 border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(241,245,249,1)]">
              <div className="p-2 bg-primary/10 border-2 border-slate-900 dark:border-slate-100 w-10 h-10 flex items-center justify-center mb-3">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wide">Enterprise Auth</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Role-based access controls keep catalog actions restricted to managers and administrators.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Brutalist Sign-In Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-card p-6 sm:p-8 border-[3px] border-slate-900 dark:border-slate-100 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:shadow-[8px_8px_0px_0px_rgba(241,245,249,1)] text-left relative overflow-hidden">
            
            {/* Header */}
            <div className="space-y-2 mb-6">
              <h2 className="text-3xl font-black tracking-tight uppercase">Sign In</h2>
              <div className="h-1 bg-primary w-16 border border-slate-900 dark:border-slate-100" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-black uppercase text-xs tracking-wider">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@smartstock.local"
                  className="bg-background border-2 border-slate-900 dark:border-slate-100 focus-visible:ring-0 focus-visible:border-primary focus:outline-none placeholder:text-muted-foreground/50 rounded-none h-10 font-medium"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs font-bold text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-black uppercase text-xs tracking-wider">Security Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-background border-2 border-slate-900 dark:border-slate-100 focus-visible:ring-0 focus-visible:border-primary focus:outline-none placeholder:text-muted-foreground/50 rounded-none h-10 font-medium"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs font-bold text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider py-3.5 border-[3px] border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(241,245,249,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(241,245,249,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] dark:active:shadow-[1px_1px_0px_0px_rgba(241,245,249,1)] transition-all cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed mt-4" 
                disabled={isLoading}
              >
                {isLoading ? "Validating Session..." : "Unlock Portal"}
              </Button>
            </form>
          </div>

          {/* Quick-Fill Credentials (Neo-Brutalist Callout Box) */}
          <div className="bg-amber-100 dark:bg-amber-950/40 p-5 border-[3px] border-amber-900 dark:border-amber-700 shadow-[4px_4px_0px_0px_rgba(180,83,9,1)] dark:shadow-[4px_4px_0px_0px_rgba(217,119,6,0.3)] text-left flex items-start gap-3">
            <div className="p-1.5 bg-amber-900 dark:bg-amber-700 text-amber-100 rounded-lg flex items-center justify-center mt-0.5 border-2 border-slate-900">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-950 dark:text-amber-300">Quick-Access Demo Account</h4>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-400/80 leading-relaxed font-medium">
                Click the quick-fill button below to pre-populate the administrator credentials for local evaluation.
              </p>
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="mt-2 text-[10px] font-black uppercase tracking-wider bg-amber-900 dark:bg-amber-700 text-amber-100 hover:bg-amber-800 dark:hover:bg-amber-600 px-3 py-1.5 border-2 border-slate-900 flex items-center gap-1 cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Fill Administrator
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
