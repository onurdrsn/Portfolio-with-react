import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Mail, Github, Linkedin, Send, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";
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

    const toastId = toast.loading("Mesajınız iletiliyor...");
    try {
      const res = await apiPost("/api/contact", { name, email, message });
      toast.success(res?.message || "Mesajınız başarıyla gönderildi!", { id: toastId });
      setSentSuccess(true);
      form.reset();
      setTimeout(() => setSentSuccess(false), 8000);
    } catch (error) {
      toast.error(error.message || "Mesaj gönderilirken bir hata oluştu.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6" id="contact">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-3">
          <MessageSquare size={13} />
          <span>İletişim & İş Birliği</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Birlikte <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">Geleceği İnşa Edelim</span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto mt-3">
          Proje fikirleriniz, mimari danışmanlık veya sorularınız için doğrudan mesaj gönderebilirsiniz.
        </p>
      </div>

      {/* Glass Card */}
      <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-900/60 to-gray-950/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {sentSuccess ? (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white">Mesajınız Alındı!</h3>
            <p className="text-gray-300 text-sm max-w-md mx-auto">
              Mesajınız doğrudan e-posta adresime iletildi. En kısa sürede size geri dönüş yapacağım.
            </p>
            <button
              onClick={() => setSentSuccess(false)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
            >
              Yeni Mesaj Gönder
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Adınız Soyadınız *
                </label>
                <input
                  type="text"
                  name="Name"
                  required
                  disabled={isSubmitting}
                  placeholder="John Doe"
                  className="w-full p-4 bg-gray-950/80 border border-gray-800 rounded-2xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-600 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  E-Posta Adresiniz *
                </label>
                <input
                  type="email"
                  name="Email"
                  required
                  disabled={isSubmitting}
                  placeholder="john@example.com"
                  className="w-full p-4 bg-gray-950/80 border border-gray-800 rounded-2xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-600 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Mesajınız *
              </label>
              <textarea
                name="Message"
                rows="5"
                required
                disabled={isSubmitting}
                placeholder="Projeniz veya sorunuz hakkında detayları yazın..."
                className="w-full p-4 bg-gray-950/80 border border-gray-800 rounded-2xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-600 text-sm transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm sm:text-base py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl shadow-violet-900/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>İletiliyor...</span>
              ) : (
                <>
                  <span>Mesajı İlet</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Contacts */}
        <div className="mt-10 pt-8 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="mailto:onurdrsn55@gmail.com"
            className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 hover:border-violet-500/40 transition-all text-center group"
          >
            <Mail size={20} className="mx-auto mb-2 text-violet-400 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white mb-0.5">E-Posta</h4>
            <p className="text-[11px] text-gray-400 truncate">onurdrsn55@gmail.com</p>
          </a>

          <a
            href="https://github.com/onurdrsn"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 hover:border-violet-500/40 transition-all text-center group"
          >
            <Github size={20} className="mx-auto mb-2 text-violet-400 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white mb-0.5">GitHub</h4>
            <p className="text-[11px] text-gray-400">@onurdrsn</p>
          </a>

          <a
            href="https://linkedin.com/in/odursun"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 hover:border-violet-500/40 transition-all text-center group"
          >
            <Linkedin size={20} className="mx-auto mb-2 text-violet-400 group-hover:scale-110 transition-transform" />
            <h4 className="text-xs font-bold text-white mb-0.5">LinkedIn</h4>
            <p className="text-[11px] text-gray-400">@odursun</p>
          </a>
        </div>
      </div>
    </section>
  );
}
