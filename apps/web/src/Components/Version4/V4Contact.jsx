import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Mail, Github, Linkedin, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { apiPost } from "../../lib/api";

export default function V4Contact() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const formData = new FormData(form);
    const name = (formData.get("Name") || "").toString();
    const email = (formData.get("Email") || "").toString();
    const message = (formData.get("Message") || "").toString();

    const toastId = toast.loading(t("v4.contact.toast.sending"));
    try {
      const res = await apiPost("/api/contact", { name, email, message });
      toast.success(res?.message || t("v4.contact.toast.success"), { id: toastId });
      setSentSuccess(true);
      form.reset();
      setTimeout(() => setSentSuccess(false), 8000);
    } catch (error) {
      toast.error(error.message || t("v4.contact.toast.error"), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 relative" id="contact">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <MessageSquare size={13} className="text-violet-400" />
          <span>{t("v4.contact.badge")}</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          {t("v4.contact.title")}{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            {t("v4.contact.titleHighlight")}
          </span>
        </h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto mt-3 font-normal leading-relaxed">
          {t("v4.contact.description")}
        </p>
      </div>

      {/* Glass Card (Morphism Style) */}
      <div className="relative bg-gradient-to-br from-violet-950/40 via-gray-950/80 to-purple-950/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_12px_48px_0_rgba(139,92,246,0.18)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-400/40 before:to-transparent">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {sentSuccess ? (
          <div className="py-12 text-center space-y-4 animate-fadeIn relative z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl shadow-[0_0_25px_rgba(16,185,129,0.3)] backdrop-blur-md">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {t("v4.contact.successTitle")}
            </h3>
            <p className="text-gray-300 text-sm max-w-md mx-auto font-normal leading-relaxed">
              {t("v4.contact.successDescription")}
            </p>
            <button
              onClick={() => setSentSuccess(false)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {t("v4.contact.sendAnother")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  {t("v4.contact.form.nameLabel")}
                </label>
                <input
                  type="text"
                  name="Name"
                  required
                  disabled={isSubmitting}
                  placeholder={t("v4.contact.form.namePlaceholder")}
                  className="w-full p-4 bg-white/[0.04] border border-white/10 rounded-2xl focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-500 text-sm transition-all backdrop-blur-md"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  {t("v4.contact.form.emailLabel")}
                </label>
                <input
                  type="email"
                  name="Email"
                  required
                  disabled={isSubmitting}
                  placeholder={t("v4.contact.form.emailPlaceholder")}
                  className="w-full p-4 bg-white/[0.04] border border-white/10 rounded-2xl focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-500 text-sm transition-all backdrop-blur-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                {t("v4.contact.form.messageLabel")}
              </label>
              <textarea
                name="Message"
                rows="5"
                required
                disabled={isSubmitting}
                placeholder={t("v4.contact.form.messagePlaceholder")}
                className="w-full p-4 bg-white/[0.04] border border-white/10 rounded-2xl focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-500 text-sm transition-all backdrop-blur-md resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm sm:text-base py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-violet-900/40 hover:shadow-violet-600/30 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border border-violet-400/30"
            >
              {isSubmitting ? (
                <span>{t("v4.contact.form.submitting")}</span>
              ) : (
                <>
                  <span>{t("v4.contact.form.submitButton")}</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Contacts (Morphism Cards) */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          <a
            href="mailto:onurdrsn55@gmail.com"
            className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-violet-400/50 hover:bg-white/[0.07] transition-all text-center group backdrop-blur-md shadow-sm hover:scale-[1.02]"
          >
            <Mail size={20} className="mx-auto mb-2 text-violet-400 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white mb-0.5">{t("v4.contact.channels.email")}</h4>
            <p className="text-[11px] text-gray-400 truncate">onurdrsn55@gmail.com</p>
          </a>

          <a
            href="https://github.com/onurdrsn"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-violet-400/50 hover:bg-white/[0.07] transition-all text-center group backdrop-blur-md shadow-sm hover:scale-[1.02]"
          >
            <Github size={20} className="mx-auto mb-2 text-violet-400 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white mb-0.5">{t("v4.contact.channels.github")}</h4>
            <p className="text-[11px] text-gray-400">@onurdrsn</p>
          </a>

          <a
            href="https://linkedin.com/in/odursun"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-violet-400/50 hover:bg-white/[0.07] transition-all text-center group backdrop-blur-md shadow-sm hover:scale-[1.02]"
          >
            <Linkedin size={20} className="mx-auto mb-2 text-violet-400 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white mb-0.5">{t("v4.contact.channels.linkedin")}</h4>
            <p className="text-[11px] text-gray-400">@odursun</p>
          </a>
        </div>
      </div>
    </section>
  );
}
