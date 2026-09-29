import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Mail, User, KeyRound, ArrowRight, RefreshCw, CheckCircle2, Clock } from "lucide-react";

export default function Register() {
  const { t } = useTranslation();
  const { sendPasscode, loginWithPasscode } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"info" | "code">("info");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  // Exponential backoff cooldown: starts at 30s, doubles on each resend (30s, 60s, 120s, 240s...)
  const [resendCount, setResendCount] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

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
    if (!username.trim() || !email.trim()) {
      return setError(t("auth.errors.fillAll"));
    }
    if (resendCooldown > 0) {
      return setError(t("auth.errors.cooldown", { seconds: resendCooldown }));
    }

    setError(null);
    setLoading(true);
    const toastId = toast.loading(t("auth.toasts.sending"));

    try {
      await sendPasscode(email.trim(), username.trim());
      toast.success(t("auth.toasts.sent"), { id: toastId });
      setStep("code");
      setTimeLeft(600);
      setTimerActive(true);
      setResendCooldown(30); // Initial 30s cooldown
      setResendCount(1);
    } catch (err: any) {
      toast?.dismiss?.(toastId);
      setError(err.message || t("auth.errors.general"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendPasscode = async () => {
    if (loading || resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    const toastId = toast.loading(t("auth.toasts.resending"));

    try {
      await sendPasscode(email.trim(), username.trim());
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
    if (!code.trim()) {
      return setError(t("auth.errors.enterPasscode"));
    }

    setError(null);
    setLoading(true);
    const toastId = toast.loading(t("auth.toasts.registerVerifying"));

    try {
      await loginWithPasscode(email.trim(), code.trim());
      toast.success(t("auth.toasts.registerSuccess"), { id: toastId });
      navigate("/blog");
    } catch (err: any) {
      toast?.dismiss?.(toastId);
      setError(err.message || t("auth.errors.invalidPasscode"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-950 border border-gray-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-violet-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-purple-600/20 border border-violet-500/30 mb-4 shadow-lg shadow-violet-900/20">
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {step === "info" ? t("auth.registerTitle") : t("auth.registerPasscodeTitle")}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1.5 max-w-xs mx-auto">
              {step === "info"
                ? t("auth.registerDesc")
                : t("auth.registerPasscodeDesc", { email })}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm leading-relaxed flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {step === "info" ? (
            <form onSubmit={handleRequestPasscode} className="flex flex-col gap-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  {t("auth.username")}
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={t("auth.usernamePlaceholder") || "kullanici_adi"}
                    minLength={2}
                    autoFocus
                    className="w-full rounded-2xl bg-gray-950/80 border border-gray-800 pl-11 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  {t("auth.email")}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t("auth.emailPlaceholder") || "adiniz@example.com"}
                    className="w-full rounded-2xl bg-gray-950/80 border border-gray-800 pl-11 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-violet-900/40 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span>{t("auth.registering")}</span>
                ) : (
                  <>
                    <span>{t("auth.registerButton")}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPasscode} className="flex flex-col gap-4 relative z-10">
              <div className="p-3 bg-violet-950/40 border border-violet-500/20 rounded-xl flex items-center justify-between text-xs text-violet-300">
                <span className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => { setStep("info"); setError(null); }}
                  className="text-violet-400 hover:text-white underline text-[11px] shrink-0 ml-2"
                >
                  {t("auth.changeEmail")}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {t("auth.passcode")}
                  </label>
                  <div className={`flex items-center gap-1 text-xs font-mono font-bold ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-violet-400"}`}>
                    <Clock size={13} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\s+/g, ""))}
                    required
                    placeholder="123456"
                    maxLength={10}
                    autoFocus
                    className="w-full rounded-2xl bg-gray-950/80 border border-gray-800 pl-11 pr-4 py-3.5 text-white text-base tracking-[0.3em] font-mono text-center focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-gray-600"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-2 text-center">
                  {t("auth.passcodeNotice")}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || timeLeft === 0}
                className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-violet-900/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? t("auth.verifying") : t("auth.verifyAndRegister")}
              </button>

              <button
                type="button"
                onClick={handleResendPasscode}
                disabled={loading || resendCooldown > 0}
                className="w-full py-2.5 text-xs font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock size={13} className="text-violet-400 animate-pulse" />
                    <span>{t("auth.resendCooldown", { seconds: resendCooldown })}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} />
                    <span>{t("auth.resendPasscode")}</span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold">
              {t("auth.loginLink")}
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-800/80 text-center">
            <Link
              to="/blog"
              className="text-xs text-gray-400 hover:text-violet-400 transition-colors inline-flex items-center gap-1"
            >
              <span>{t("auth.backToBlog")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
