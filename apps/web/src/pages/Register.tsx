import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { Mail, User, KeyRound, ArrowRight, RefreshCw, CheckCircle2, Clock } from "lucide-react";

export default function Register() {
  const { sendPasscode, loginWithPasscode } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"info" | "code">("info");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setError("10 dakikalık parolanızın süresi doldu. Lütfen yeni bir parola talep edin.");
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRequestPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      return setError("Lütfen kullanıcı adı ve e-posta adresinizi giriniz.");
    }

    setError(null);
    setLoading(true);
    const toastId = toast.loading("Geçici parolanız oluşturuluyor...");

    try {
      const res = await sendPasscode(email.trim(), username.trim());
      toast.success("Geçici parolanız e-posta adresinize gönderildi!", { id: toastId });
      setStep("code");
      setTimeLeft(600);
      setTimerActive(true);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
    } catch (err: any) {
      toast?.dismiss?.(toastId);
      setError(err.message || "İşlem gerçekleştirilemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      return setError("Lütfen gelen 6 haneli geçici parolayı giriniz.");
    }

    setError(null);
    setLoading(true);
    const toastId = toast.loading("Giriş yapılıyor...");

    try {
      await loginWithPasscode(email.trim(), code.trim());
      toast.success("Hesabınız oluşturuldu ve giriş yapıldı!", { id: toastId });
      navigate("/blog");
    } catch (err: any) {
      toast?.dismiss?.(toastId);
      setError(err.message || "Parola geçersiz veya süresi dolmuş.");
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
              {step === "info" ? "Hesap Oluştur" : "Geçici Parolayı Girin"}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1.5 max-w-xs mx-auto">
              {step === "info"
                ? "Şifre oluşturmaya gerek yok. E-postanıza tek kullanımlık geçici parola göndereceğiz."
                : `${email} adresine gönderilen parolanızı yazın.`}
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
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="kullanici_adi"
                    minLength={2}
                    autoFocus
                    className="w-full rounded-2xl bg-gray-950/80 border border-gray-800 pl-11 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  E-Posta Adresi
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="adiniz@example.com"
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
                  <span>Gönderiliyor...</span>
                ) : (
                  <>
                    <span>Geçici Parola İle Kayıt Ol</span>
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
                  Değiştir
                </button>
              </div>

              {devCode && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center justify-between">
                  <span>Geliştirme Kodu: <strong className="font-mono font-bold text-white tracking-widest">{devCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setCode(devCode)}
                    className="underline text-[10px] text-amber-400 hover:text-amber-200"
                  >
                    Doldur
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Geçici Parola (6 Hane)
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
                  * Bu parola giriş yapılana kadar 10 dakika boyunca geçerlidir.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || timeLeft === 0}
                className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-violet-900/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Doğrulanıyor..." : "Hesabı Onayla ve Giriş Yap"}
              </button>

              <button
                type="button"
                onClick={handleRequestPasscode}
                disabled={loading}
                className="w-full py-2.5 text-xs font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} /> Yeni Parola Gönder
              </button>
            </form>
          )}

          <p className="text-center text-xs sm:text-sm text-gray-500 mt-6">
            Zaten hesabınız var mı?{" "}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
