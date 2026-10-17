import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Mail, Github, Linkedin, Send, CheckCircle2 } from "lucide-react";
import { apiPost } from "../../lib/api";
import { Container, Section, SectionHeader, buttonStyles } from "./V4Primitives";

export default function V4Contact() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const formData = new FormData(form);
    const name = (formData.get("Name") || "").toString().trim();
    const email = (formData.get("Email") || "").toString().trim();
    const message = (formData.get("Message") || "").toString().trim();

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
    <Section id="contact" labelledBy="contact-title" className="bg-ink text-paper scroll-mt-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Heading + Direct Channels */}
          <div className="lg:col-span-5">
            <SectionHeader
              index="04"
              eyebrow={t("v4.contact.badge")}
              title={
                <>
                  {t("v4.contact.title")}{" "}
                  <span className="text-paper-muted">{t("v4.contact.titleHighlight")}</span>
                </>
              }
              description={t("v4.contact.description")}
              titleId="contact-title"
            />

            <div className="mt-8 pt-8 border-t border-ink-line space-y-3">
              <a
                href="mailto:onurdrsn55@gmail.com"
                className="flex items-center gap-3 p-3 rounded-md border border-ink-line bg-ink-raised hover:border-ink-line-strong transition-colors group"
              >
                <div className="w-8 h-8 rounded border border-ink-line bg-ink flex items-center justify-center text-paper-subtle group-hover:text-paper transition-colors">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-xs font-code text-paper-subtle">
                    {t("v4.contact.channels.email")}
                  </div>
                  <div className="text-sm font-medium text-paper">
                    onurdrsn55@gmail.com
                  </div>
                </div>
              </a>

              <a
                href="https://github.com/onurdrsn"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-md border border-ink-line bg-ink-raised hover:border-ink-line-strong transition-colors group"
              >
                <div className="w-8 h-8 rounded border border-ink-line bg-ink flex items-center justify-center text-paper-subtle group-hover:text-paper transition-colors">
                  <Github size={16} />
                </div>
                <div>
                  <div className="text-xs font-code text-paper-subtle">
                    {t("v4.contact.channels.github")}
                  </div>
                  <div className="text-sm font-medium text-paper">
                    github.com/onurdrsn
                  </div>
                </div>
              </a>

              <a
                href="https://linkedin.com/in/odursun"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-md border border-ink-line bg-ink-raised hover:border-ink-line-strong transition-colors group"
              >
                <div className="w-8 h-8 rounded border border-ink-line bg-ink flex items-center justify-center text-paper-subtle group-hover:text-paper transition-colors">
                  <Linkedin size={16} />
                </div>
                <div>
                  <div className="text-xs font-code text-paper-subtle">
                    {t("v4.contact.channels.linkedin")}
                  </div>
                  <div className="text-sm font-medium text-paper">
                    linkedin.com/in/odursun
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Accessible Form Card */}
          <div className="lg:col-span-7">
            <div className="rounded-lg border border-ink-line bg-ink-raised p-6 sm:p-8">
              {sentSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border border-signal/40 bg-signal/10 text-signal flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-paper tracking-tight">
                    {t("v4.contact.successTitle")}
                  </h3>
                  <p className="text-paper-muted text-sm max-w-sm mx-auto leading-relaxed">
                    {t("v4.contact.successDescription")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSentSuccess(false)}
                    className={buttonStyles.secondary + " mt-4"}
                  >
                    {t("v4.contact.sendAnother")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-code text-paper-muted uppercase tracking-wider mb-2">
                        {t("v4.contact.form.nameLabel")}
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="Name"
                        required
                        disabled={isSubmitting}
                        placeholder={t("v4.contact.form.namePlaceholder")}
                        className="w-full px-3.5 py-2.5 bg-ink border border-ink-line rounded-md text-sm text-paper placeholder-paper-subtle focus:border-paper focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-code text-paper-muted uppercase tracking-wider mb-2">
                        {t("v4.contact.form.emailLabel")}
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="Email"
                        required
                        disabled={isSubmitting}
                        placeholder={t("v4.contact.form.emailPlaceholder")}
                        className="w-full px-3.5 py-2.5 bg-ink border border-ink-line rounded-md text-sm text-paper placeholder-paper-subtle focus:border-paper focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-code text-paper-muted uppercase tracking-wider mb-2">
                      {t("v4.contact.form.messageLabel")}
                    </label>
                    <textarea
                      id="contact-message"
                      name="Message"
                      rows="5"
                      required
                      disabled={isSubmitting}
                      placeholder={t("v4.contact.form.messagePlaceholder")}
                      className="w-full px-3.5 py-2.5 bg-ink border border-ink-line rounded-md text-sm text-paper placeholder-paper-subtle focus:border-paper focus:outline-none transition-colors resize-y"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={buttonStyles.primary + " w-full sm:w-auto"}
                  >
                    {isSubmitting ? (
                      <span>{t("v4.contact.form.submitting")}</span>
                    ) : (
                      <>
                        <span>{t("v4.contact.form.submitButton")}</span>
                        <Send size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
