import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUiVersion } from "../contexts/UiVersionContext";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import toast from "react-hot-toast";
import {
  Mail,
  KeyRound,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Lock,
  Terminal,
  Monitor,
  Sparkles,
  Layers,
} from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const { sendPasscode, loginWithPasscode } = useAuth();
  const { uiVersion } = useUiVersion();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  // Step 1: 'email', Step 2: 'code'
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 10 minutes countdown (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  // Exponential backoff cooldown: starts at 30s, doubles on each resend (30s, 60s, 120s, 240s...)
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 5 Failed attempts lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(0);
  const isAccountLocked = lockoutRemainingSec > 0;

  // Restore lockout from localStorage when email changes
  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    try {
      const storedLock = localStorage.getItem(`auth_locked_until_${cleanEmail}`);
      if (storedLock) {
        const lockUntil = Number(storedLock);
        const diffSec = Math.ceil((lockUntil - Date.now()) / 1000);
        if (diffSec > 0) {
          setLockoutRemainingSec(diffSec);
          setFailedAttempts(5);
        } else {
          localStorage.removeItem(`auth_locked_until_${cleanEmail}`);
          setLockoutRemainingSec(0);
        }
      }
    } catch {}
  }, [email]);

  // Lockout countdown timer
  useEffect(() => {
    let interval: any = null;
    if (lockoutRemainingSec > 0) {
      interval = setInterval(() => {
        setLockoutRemainingSec((prev) => {
          if (prev <= 1) {
            const cleanEmail = email.trim().toLowerCase();
            if (cleanEmail) localStorage.removeItem(`auth_locked_until_${cleanEmail}`);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutRemainingSec, email]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setError(t("auth.errors.expired"));
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, t]);

  useEffect(() => {
    let interval: any = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRequestPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError(t("auth.errors.emptyEmail"));
    if (isAccountLocked) {
      return setError(
        t("auth.errors.accountLocked", {
          time: formatTime(lockoutRemainingSec),
        }) || "Hesap kilitli! Lütfen sürenin bitmesini bekleyin."
      );
    }
    if (resendCooldown > 0) {
      return setError(t("auth.errors.cooldown", { seconds: resendCooldown }));
    }

    setError(null);
    setLoading(true);
    const toastId = toast.loading(t("auth.toasts.sending"));

    try {
      await sendPasscode(email.trim());
      toast.success(t("auth.toasts.sent"), { id: toastId });
      setStep("code");
      setTimeLeft(600);
      setTimerActive(true);
      setResendCooldown(30);
      setResendCount(1);
    } catch (err: any) {
      toast?.dismiss?.(toastId);
      setError(err.message || t("auth.errors.general"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendPasscode = async () => {
    if (loading || resendCooldown > 0 || isAccountLocked) return;
    setError(null);
    setLoading(true);
    const toastId = toast.loading(t("auth.toasts.resending"));

    try {
      await sendPasscode(email.trim());
      toast.success(t("auth.toasts.resent"), { id: toastId });
      setTimeLeft(600);
      setTimerActive(true);
      const nextCooldown = Math.min(30 * Math.pow(2, resendCount), 3600);
      setResendCooldown(nextCooldown);
      setResendCount((prev) => prev + 1);
    } catch (err: any) {
      toast?.dismiss?.(toastId);
      setError(err.message || t("auth.errors.general"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAccountLocked) {
      return setError(
        t("auth.errors.accountLocked", {
          time: formatTime(lockoutRemainingSec),
        }) || "Hesap kilitli! Lütfen sürenin bitmesini bekleyin."
      );
    }
    if (!code.trim()) return setError(t("auth.errors.emptyCode"));
    if (timeLeft === 0) return setError(t("auth.errors.expired"));

    setError(null);
    setLoading(true);
    const toastId = toast.loading(t("auth.toasts.verifying"));

    try {
      await loginWithPasscode(email.trim(), code.trim());
      toast.success(t("auth.toasts.loginSuccess"), { id: toastId });
      setFailedAttempts(0);
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail) localStorage.removeItem(`auth_locked_until_${cleanEmail}`);
      navigate("/blog");
    } catch (err: any) {
      toast?.dismiss?.(toastId);
      const newAttempts = err.failedAttempts ?? failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (err.locked || err.status === 423 || newAttempts >= 5) {
        const lockDuration = err.remainingSec || 15 * 60;
        setLockoutRemainingSec(lockDuration);
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail) {
          try {
            localStorage.setItem(
              `auth_locked_until_${cleanEmail}`,
              String(Date.now() + lockDuration * 1000)
            );
          } catch {}
        }
        setError(
          err.message ||
            "5 kez hatalı şifre girdiniz! Güvenlik sebebiyle şifre girme kilitlendi. Lütfen 15 dakika bekleyiniz."
        );
      } else {
        setError(err.message || t("auth.errors.invalidPasscode"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Theme configurations based on uiVersion
  const theme = {
    v1: {
      bg: "bg-ink",
      card: "border-ink-line bg-ink-raised shadow-2xl",
      eyebrow: "text-paper-muted",
      accentDot: "bg-signal",
      badge: "Editorial Swiss Minimal (v1)",
      inputBg: "bg-ink border-ink-line focus:border-paper text-paper placeholder-paper-subtle",
      btnPrimary: "bg-paper text-ink hover:bg-white",
      btnOutline: "border-ink-line text-paper hover:bg-ink-hover",
    },
    v2: {
      bg: "bg-[#0f141c]",
      card: "border-[#2a3441] bg-[#1a2332]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md rounded-lg",
      eyebrow: "text-blue-300 font-mono",
      accentDot: "bg-blue-400",
      badge: "Desktop OS Environment (v2)",
      inputBg: "bg-[#0b1017] border-[#2a3441] focus:border-blue-400 text-slate-100 placeholder-slate-500 font-mono",
      btnPrimary: "bg-blue-600 text-white hover:bg-blue-500 shadow-md",
      btnOutline: "border-[#2a3441] text-slate-300 hover:bg-[#253347]",
    },
    v3: {
      bg: "bg-black",
      card: "border-cyan-500/40 bg-black/90 shadow-[0_0_35px_rgba(6,182,212,0.18)] backdrop-blur-md font-mono rounded-none relative overflow-hidden",
      eyebrow: "text-cyan-400 font-mono",
      accentDot: "bg-cyan-400 animate-ping",
      badge: "CyberDeck HUD Terminal (v3)",
      inputBg: "bg-black/90 border-cyan-500/50 focus:border-cyan-300 text-cyan-200 placeholder-cyan-800 font-mono",
      btnPrimary: "bg-cyan-500 text-black hover:bg-cyan-400 font-bold tracking-wider",
      btnOutline: "border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40",
    },
    v4: {
      bg: "bg-[#07090e]",
      card: "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-xl rounded-2xl",
      eyebrow: "text-violet-400 font-code",
      accentDot: "bg-gradient-to-r from-violet-500 to-emerald-400",
      badge: "Cyber-Modern Bento Glass (v4)",
      inputBg: "bg-black/40 border-white/10 focus:border-violet-400/80 text-paper placeholder-paper-subtle",
      btnPrimary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25",
      btnOutline: "border-white/10 text-paper-muted hover:text-paper hover:bg-white/[0.04]",
    },
  }[uiVersion] || {
    bg: "bg-ink",
    card: "border-ink-line bg-ink-raised shadow-2xl",
    eyebrow: "text-paper-muted",
    accentDot: "bg-signal",
    badge: "Editorial Swiss Minimal (v1)",
    inputBg: "bg-ink border-ink-line focus:border-paper text-paper placeholder-paper-subtle",
    btnPrimary: "bg-paper text-ink hover:bg-white",
    btnOutline: "border-ink-line text-paper hover:bg-ink-hover",
  };

  return (
    <div className={`min-h-screen ${theme.bg} text-paper flex items-center justify-center px-4 py-16 transition-colors duration-500 relative`}>
      {/* Background Ambience / Grid Overlay for v3 and v4 */}
      {uiVersion === "v3" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] [background-size:24px_24px] opacity-60"
        />
      )}
      {uiVersion === "v4" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]"
        />
      )}

      <div className="w-full max-w-md relative z-10">
        {/* Version Pill Indicator */}
        <div className="flex items-center justify-between mb-3 px-1 text-[11px] font-code">
          <span className="flex items-center gap-1.5 text-paper-muted">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.accentDot}`} />
            <span>UI: <strong className="text-paper">{theme.badge}</strong></span>
          </span>
          <span className="text-paper-subtle uppercase tracking-wider text-[10px]">AUTH-GATEWAY</span>
        </div>

        {/* Linux Desktop Window Header Decoration (v2 only) */}
        {uiVersion === "v2" && (
          <div className="bg-[#242f3d] border-t border-x border-[#3b4859] rounded-t-lg px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-black/20" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-black/20" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-black/20" />
            </div>
            <span className="text-xs font-mono text-slate-300">auth_session.sh — login</span>
            <span className="text-xs font-mono text-slate-500">bash</span>
          </div>
        )}

        {/* Cyberdeck Corner Accents (v3 only) */}
        {uiVersion === "v3" && (
          <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border-t border-x border-cyan-500/60 px-3 py-1">
            <span>[PORT: 0x443_SECURE_VERIFY]</span>
            <span className="animate-pulse">● LIVE_FEED</span>
          </div>
        )}

        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, transform: "translateY(16px)" }}
          animate={{ opacity: 1, transform: "translateY(0)" }}
          transition={springTransition}
          className={`border ${theme.card} p-8 sm:p-10 text-paper ${
            uiVersion === "v2" ? "rounded-b-lg rounded-t-none border-t-0" : ""
          } ${uiVersion === "v3" ? "border-t-0" : ""}`}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.accentDot}`}></span>
              <span className={`text-xs font-code tracking-widest uppercase ${theme.eyebrow}`}>
                {uiVersion === "v3" ? "ROOT // ACCESS_VERIFICATION" : "Authentication"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-paper">
              {step === "email" ? t("auth.loginTitle") || "Giriş Yap" : t("auth.loginPasscodeTitle") || "Doğrulama Kodu"}
            </h1>
            <p className="text-xs sm:text-sm text-paper-muted mt-2 leading-relaxed">
              {step === "email"
                ? t("auth.loginDesc") || "Şifresiz, tek kullanımlık geçici parola (OTP) ile güvenli giriş yapın."
                : t("auth.loginPasscodeDesc", { email }) || `${email} adresine iletilen 6 haneli kodu giriniz.`}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded border border-danger/40 bg-danger/10 text-danger text-xs font-code leading-relaxed flex items-start gap-2"
            >
              <span className="shrink-0 font-bold">[!]</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Email Input */}
          {step === "email" ? (
            <form onSubmit={handleRequestPasscode} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-code text-paper-muted uppercase tracking-wider mb-2"
                >
                  {t("auth.email") || "E-Posta Adresi"}
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-subtle pointer-events-none"
                  />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t("auth.emailPlaceholder") || "adiniz@example.com"}
                    autoFocus
                    className={`w-full pl-10 pr-4 py-3 rounded-md text-xs sm:text-sm focus:outline-none transition-colors ${theme.inputBg}`}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                transition={springTransition}
                className={`w-full py-3 rounded-md font-semibold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50 ${theme.btnPrimary}`}
              >
                {loading ? (
                  <span>{t("auth.sendingPasscode") || "Parola Gönderiliyor..."}</span>
                ) : (
                  <>
                    <span>{t("auth.sendPasscode") || "Giriş Parolası Gönder"}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            /* STEP 2: Temporary Code Input (OTP) */
            <form onSubmit={handleVerifyPasscode} className="space-y-5">
              {/* Sent Status Badge */}
              <div className="p-3 bg-ink border border-ink-line rounded-md flex items-center justify-between text-xs font-code text-paper-muted">
                <span className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 size={14} className="text-signal shrink-0" />
                  <span className="truncate">{email}</span>
                </span>
                <button
                  type="button"
                  disabled={isAccountLocked}
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                  className="text-paper hover:underline text-[11px] shrink-0 ml-2 disabled:opacity-40 cursor-pointer"
                >
                  {t("auth.changeEmail") || "Değiştir"}
                </button>
              </div>

              {/* 5-Attempt Security Lockout Banner */}
              {isAccountLocked ? (
                <div className="p-4 rounded border border-danger/40 bg-danger/10 text-danger flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold font-code text-xs">
                    <ShieldAlert size={16} className="shrink-0 text-danger" />
                    <span>{t("auth.lockoutTitle") || "Giriş Kilitlendi"}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-danger/90">
                    {t("auth.lockoutDesc") || "Çok sayıda hatalı giriş denemesi nedeniyle hesap geçici olarak kilitlendi."}
                  </p>
                  <div className="flex items-center gap-1.5 font-code text-xs text-danger">
                    <Clock size={13} />
                    <span>{t("auth.remainingLockout", { time: formatTime(lockoutRemainingSec) })}</span>
                  </div>
                </div>
              ) : null}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="login-passcode"
                    className="block text-xs font-code text-paper-muted uppercase tracking-wider"
                  >
                    {t("auth.passcode") || "Doğrulama Kodu"}
                  </label>
                  <div
                    className={`flex items-center gap-1 text-xs font-code font-bold ${
                      timeLeft < 60 ? "text-danger animate-pulse" : "text-signal"
                    }`}
                  >
                    <Clock size={13} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                <div className="relative">
                  <KeyRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper-subtle pointer-events-none"
                  />
                  <input
                    id="login-passcode"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\s+/g, ""))}
                    required
                    disabled={loading || isAccountLocked || timeLeft === 0}
                    placeholder="123456"
                    maxLength={10}
                    autoFocus
                    className={`w-full pl-10 pr-4 py-3 rounded-md text-base tracking-[0.35em] text-center focus:outline-none transition-colors placeholder:tracking-normal placeholder:font-sans disabled:opacity-40 ${theme.inputBg}`}
                  />
                </div>

                {failedAttempts > 0 && !isAccountLocked ? (
                  <p className="text-[11px] font-code text-amber-400 mt-2 text-center">
                    ⚠️ {t("auth.remainingAttempts", { count: Math.max(0, 5 - failedAttempts) })}
                  </p>
                ) : (
                  <p className="text-[11px] font-code text-paper-subtle mt-2 text-center">
                    {t("auth.passcodeNotice") || "* Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir."}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading || timeLeft === 0 || isAccountLocked}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                transition={springTransition}
                className={`w-full py-3 rounded-md font-semibold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50 ${theme.btnPrimary}`}
              >
                {loading
                  ? t("auth.verifying") || "Doğrulanıyor..."
                  : t("auth.verifyAndLogin") || "Giriş Yap"}
              </motion.button>

              <button
                type="button"
                onClick={handleResendPasscode}
                disabled={loading || resendCooldown > 0 || isAccountLocked}
                className="w-full py-2 text-xs font-code text-paper-muted hover:text-paper transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock size={13} className="text-paper-muted animate-pulse" />
                    <span>{t("auth.resendCooldown", { seconds: resendCooldown })}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} />
                    <span>{t("auth.resendPasscode") || "Yeni Kod Gönder"}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Link */}
          <p className="text-center text-xs text-paper-muted mt-8">
            {t("auth.noAccount") || "Hesabınız yok mu?"}{" "}
            <Link to="/register" className="text-paper font-semibold hover:underline">
              {t("auth.registerLink") || "Kayıt Olun"}
            </Link>
          </p>

          {/* Footer Back Link */}
          <div className="mt-6 pt-6 border-t border-ink-line text-center">
            <Link
              to="/blog"
              className="text-xs font-code text-paper-muted hover:text-paper transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>{t("auth.backToBlog") || "Blog'a Geri Dön"}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
