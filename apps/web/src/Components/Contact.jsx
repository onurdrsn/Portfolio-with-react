import { useState } from "react";
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, Github, Linkedin, Send, MessageSquare } from 'lucide-react';
import { apiPost } from "../lib/api";

export default function Contact() {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.target;
        const formData = new FormData(form);
        const name = (formData.get("Name") || "").toString();
        const email = (formData.get("Email") || "").toString();
        const message = (formData.get("Message") || "").toString();

        const toastId = toast.loading(t('contact.toast.sending') || "Mesajınız iletiliyor...");
        try {
            const res = await apiPost("/api/contact", { name, email, message });
            toast.success(res?.message || t('contact.toast.success') || "Mesajınız başarıyla gönderildi!", { id: toastId });
            form.reset();
        } catch (error) {
            toast.error(error.message || t('contact.toast.error') || "Mesaj gönderilirken bir hata oluştu.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto" id="contact">
            {/* Section Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-3">
                    <MessageSquare size={13} />
                    <span>{t('contact.badge') || "İletişim Kurun"}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {t('contact.title') || "Birlikte"} <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">{t('contact.titleHighlight') || "Harika İşler Yapalım"}</span>
                </h2>
                <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mt-3">
                    {t('contact.subtitle') || "Projeniz, sorularınız veya iş birliği fırsatları için mesaj bırakabilirsiniz."}
                </p>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-gray-900/90 via-gray-900/50 to-gray-950/90 backdrop-blur-2xl border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                {t('contact.form.nameLabel') || "Adınız Soyadınız"}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="Name"
                                placeholder={t('contact.form.namePlaceholder') || "John Doe"}
                                required
                                disabled={isSubmitting}
                                className="w-full p-3.5 bg-gray-950/80 border border-gray-800 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-600 text-sm transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                {t('contact.form.emailLabel') || "E-Posta Adresiniz"}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="Email"
                                placeholder={t('contact.form.emailPlaceholder') || "john@example.com"}
                                required
                                disabled={isSubmitting}
                                className="w-full p-3.5 bg-gray-950/80 border border-gray-800 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-600 text-sm transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                            {t('contact.form.messageLabel') || "Mesajınız"}
                        </label>
                        <textarea
                            id="message"
                            name="Message"
                            placeholder={t('contact.form.messagePlaceholder') || "Proje detaylarını yazabilirsiniz..."}
                            rows="5"
                            required
                            disabled={isSubmitting}
                            className="w-full p-3.5 bg-gray-950/80 border border-gray-800 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-600 text-sm transition-all resize-none"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span>{t('contact.form.sending') || "Gönderiliyor..."}</span>
                        ) : (
                            <>
                                <span>{t('contact.form.sendButton') || "Mesajı Gönder"}</span>
                                <Send size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Contact Quick Info Grid */}
                <div className="mt-10 pt-8 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a
                        href="mailto:onurdrsn55@gmail.com"
                        className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 hover:border-violet-500/40 transition-all text-center group"
                    >
                        <Mail size={20} className="mx-auto mb-2 text-violet-400 group-hover:scale-110 transition-transform" />
                        <h4 className="text-xs font-bold text-white mb-0.5">{t('contact.info.email') || "E-Posta"}</h4>
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
