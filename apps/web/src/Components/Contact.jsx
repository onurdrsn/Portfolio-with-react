import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { motion, useReducedMotion } from "motion/react";
import { Mail, Github, Linkedin, Send, CheckCircle2, ArrowUpRight } from "lucide-react";
import { apiPost } from "../lib/api";

export default function Contact() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const springTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 380, damping: 28, mass: 0.9 };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const formData = new FormData(form);
    const name = (formData.get("Name") || "").toString();
    const email = (formData.get("Email") || "").toString();
    const message = (formData.get("Message") || "").toString();

    const toastId = toast.loading(
      t("contact.toast.sending") || "Mesajınız iletiliyor..."
    );
    try {
      const res = await apiPost("/api/contact", { name, email, message });
      toast.success(
        res?.message || t("contact.toast.success") || "Mesajınız başarıyla gönderildi!",
        { id: toastId }
      );
      form.reset();
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error.message || t("contact.toast.error") || "Mesaj gönderilirken bir hata oluştu.",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-paper" id="contact">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14 pb-6 border-b border-ink-line">
        <div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-paper">
            {t("contact.title") || "Birlikte"} {t("contact.titleHighlight") || "İnşa Edelim"}
          </h2>
        </div>
        <p className="text-sm text-paper-muted max-w-sm font-normal">
          {t("contact.subtitle") ||
            "Projeniz, mimari danışmanlık veya teknik iş birlikleri için doğrudan iletişime geçin."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Reach Cards */}
        <div className="lg:col-span-5 space-y-4">
          <p className="text-sm text-paper-muted leading-relaxed font-normal">
            Doğrudan e-posta üzerinden veya teknik profillerimden irtibat kurabilirsiniz:
          </p>

          <a
            href="mailto:onurdrsn55@gmail.com"
            className="flex items-center gap-3 p-3.5 rounded-lg border border-ink-line bg-ink-raised hover:border-ink-line-strong transition-colors group"
          >
            <div className="w-9 h-9 rounded border border-ink-line bg-ink flex items-center justify-center text-paper-muted group-hover:text-paper">
              <Mail size={16} />
            </div>
            <div>
              <div className="text-xs font-code text-paper-subtle">Direct Email</div>
              <div className="text-sm font-medium text-paper">onurdrsn55@gmail.com</div>
            </div>
          </a>

          <a
            href="https://github.com/onurdrsn"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-lg border border-ink-line bg-ink-raised hover:border-ink-line-strong transition-colors group"
          >
            <div className="w-9 h-9 rounded border border-ink-line bg-ink flex items-center justify-center text-paper-muted group-hover:text-paper">
              <Github size={16} />
            </div>
            <div>
              <div className="text-xs font-code text-paper-subtle">GitHub Repository</div>
              <div className="text-sm font-medium text-paper">github.com/onurdrsn</div>
            </div>
          </a>

          <a
            href="https://linkedin.com/in/odursun"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-lg border border-ink-line bg-ink-raised hover:border-ink-line-strong transition-colors group"
          >
            <div className="w-9 h-9 rounded border border-ink-line bg-ink flex items-center justify-center text-paper-muted group-hover:text-paper">
              <Linkedin size={16} />
            </div>
            <div>
              <div className="text-xs font-code text-paper-subtle">Professional Network</div>
              <div className="text-sm font-medium text-paper">linkedin.com/in/odursun</div>
            </div>
          </a>
        </div>

        {/* Right Column: Accessible Form with Spring Micro-interaction */}
        <div className="lg:col-span-7">
          <div className="rounded-lg border border-ink-line bg-ink-raised p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full border border-signal/40 bg-signal/10 text-signal flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-paper">Mesajınız Alındı</h3>
                <p className="text-xs sm:text-sm text-paper-muted max-w-sm mx-auto">
                  Mesajınız doğrudan e-posta kutuma iletildi. En kısa sürede dönüş yapacağım.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded bg-ink border border-ink-line text-xs font-code text-paper hover:bg-ink-hover transition-colors cursor-pointer mt-2"
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-code text-paper-muted uppercase tracking-wider mb-2"
                    >
                      {t("contact.form.nameLabel") || "Adınız Soyadınız"}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="Name"
                      required
                      disabled={isSubmitting}
                      placeholder={t("contact.form.namePlaceholder") || "John Doe"}
                      className="w-full px-3.5 py-2.5 bg-ink border border-ink-line rounded-md text-xs sm:text-sm text-paper placeholder-paper-subtle focus:border-paper focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-code text-paper-muted uppercase tracking-wider mb-2"
                    >
                      {t("contact.form.emailLabel") || "E-Posta Adresiniz"}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="Email"
                      required
                      disabled={isSubmitting}
                      placeholder={t("contact.form.emailPlaceholder") || "john@example.com"}
                      className="w-full px-3.5 py-2.5 bg-ink border border-ink-line rounded-md text-xs sm:text-sm text-paper placeholder-paper-subtle focus:border-paper focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-code text-paper-muted uppercase tracking-wider mb-2"
                  >
                    {t("contact.form.messageLabel") || "Mesajınız"}
                  </label>
                  <textarea
                    id="message"
                    name="Message"
                    rows={4}
                    required
                    disabled={isSubmitting}
                    placeholder={
                      t("contact.form.messagePlaceholder") ||
                      "Tell me about your project or inquiry..."
                    }
                    className="w-full px-3.5 py-2.5 bg-ink border border-ink-line rounded-md text-xs sm:text-sm text-paper placeholder-paper-subtle focus:border-paper focus:outline-none transition-colors resize-y"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                  transition={springTransition}
                  className="w-full sm:w-auto px-6 py-2.5 rounded bg-paper text-ink font-semibold text-xs sm:text-sm hover:bg-white transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>
                    {isSubmitting
                      ? t("contact.form.sending") || "Sending..."
                      : t("contact.form.sendButton") || t("v4.contact.form.submitButton") || "Send Message"}
                  </span>
                  <Send size={14} />
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
