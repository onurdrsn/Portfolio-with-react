import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Toast from "./Toast";

export default function Contact() {
    const { t } = useTranslation();
    const [toast, setToast] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target;
        const formData = new FormData(form);

        try {
            const response = await fetch("https://getform.io/f/raeqmjma", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                setToast({ message: t('contact.toast.success'), type: "success" });
                form.reset();
            } else {
                setToast({ message: t('contact.toast.error'), type: "error" });
            }
        } catch (error) {
            setToast({ message: t('contact.toast.error'), type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="py-16" id="contact">
            {/* Section Header */}
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {t('contact.title')} <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{t('contact.titleHighlight')}</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    {t('contact.subtitle')}
                </p>
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 hover:border-violet-500/50 transition-all duration-300 shadow-xl"
                >
                    {/* Name Input */}
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-gray-300 font-semibold mb-2">
                            {t('contact.form.nameLabel')}
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="Name"
                            placeholder={t('contact.form.namePlaceholder')}
                            required
                            disabled={isSubmitting}
                            className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-300 font-semibold mb-2">
                            {t('contact.form.emailLabel')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="Email"
                            placeholder={t('contact.form.emailPlaceholder')}
                            required
                            disabled={isSubmitting}
                            className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Message Textarea */}
                    <div className="mb-6">
                        <label htmlFor="message" className="block text-gray-300 font-semibold mb-2">
                            {t('contact.form.messageLabel')}
                        </label>
                        <textarea
                            id="message"
                            name="Message"
                            placeholder={t('contact.form.messagePlaceholder')}
                            rows="6"
                            required
                            disabled={isSubmitting}
                            className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-gray-500 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/50 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t('contact.form.sending')}</span>
                            </>
                        ) : (
                            <>
                                <span>{t('contact.form.sendButton')}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Contact Info */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Email Card */}
                    <a
                        href="mailto:onurdrsn55@gmail.com"
                        className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-violet-500/50 transition-all duration-300 text-center"
                    >
                        <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-500/20 transition-colors duration-300">
                            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold mb-1">{t('contact.info.email')}</h3>
                        <p className="text-gray-400 text-sm">onurdrsn55@gmail.com</p>
                    </a>

                    {/* GitHub Card */}
                    <a
                        href="https://github.com/onurdrsn"
                        target="_blank"
                        rel="noreferrer"
                        className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-violet-500/50 transition-all duration-300 text-center"
                    >
                        <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-500/20 transition-colors duration-300">
                            <svg className="w-6 h-6 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold mb-1">{t('contact.info.github')}</h3>
                        <p className="text-gray-400 text-sm">@onurdrsn</p>
                    </a>

                    {/* LinkedIn Card */}
                    <a
                        href="https://linkedin.com/in/odursun"
                        target="_blank"
                        rel="noreferrer"
                        className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-violet-500/50 transition-all duration-300 text-center"
                    >
                        <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-500/20 transition-colors duration-300">
                            <svg className="w-6 h-6 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-semibold mb-1">{t('contact.info.linkedin')}</h3>
                        <p className="text-gray-400 text-sm">@odursun</p>
                    </a>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
