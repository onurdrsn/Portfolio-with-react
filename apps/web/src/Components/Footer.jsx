import React from "react";
import { useTranslation } from "react-i18next";
import { Container } from "./Version4/V4Primitives";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="py-12 border-t border-ink-line bg-ink text-paper-muted">
            <Container>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-code">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-signal" aria-hidden="true"></span>
                        <span className="text-paper font-medium">{t('footer.tagline') || 'Onur Dursun Portfolio Systems'}</span>
                    </div>
                    <p className="text-paper-subtle">
                        &copy; {new Date().getFullYear()} {t('footer.rights') || 'Onur Dursun. All rights reserved.'}
                    </p>
                    <div className="flex items-center gap-5 text-paper-subtle">
                        <a href="#projects" className="hover:text-paper transition-colors">{t('nav.projects') || 'Projeler'}</a>
                        <a href="#experience" className="hover:text-paper transition-colors">{t('nav.experience') || 'Deneyim'}</a>
                        <a href="/blog" className="hover:text-paper transition-colors">{t('nav.blog') || 'Blog'}</a>
                    </div>
                </div>
            </Container>
        </footer>
    );
}