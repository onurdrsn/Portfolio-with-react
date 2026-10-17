import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
    ];

    const currentLanguage = languages.find(lang => (i18n.language || 'en').startsWith(lang.code)) || languages[0];

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        try {
            localStorage.setItem('i18nextLng', langCode);
        } catch (e) {
            // Storage access blocked or restricted
        }
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Globe Icon Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 border border-ink-line bg-ink-raised rounded-md text-paper-muted hover:text-paper hover:bg-ink-hover transition-colors cursor-pointer flex items-center gap-1.5"
                aria-label={`Current language: ${currentLanguage.name}. Change Language`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <Globe
                    className="w-4 h-4 text-paper-subtle"
                    strokeWidth={1.75}
                    aria-hidden="true"
                />
                <span className="font-code text-xs font-semibold text-paper">
                    {currentLanguage.code.toUpperCase()}
                </span>
            </button>

            {/* Floating Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-ink-line bg-ink-raised shadow-xl overflow-hidden z-50">
                    <div className="py-1" role="menu">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                type="button"
                                role="menuitem"
                                onClick={() => changeLanguage(language.code)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors ${
                                    i18n.language === language.code
                                        ? 'bg-ink text-paper font-semibold'
                                        : 'text-paper-muted hover:bg-ink-hover hover:text-paper'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span aria-hidden="true">{language.flag}</span>
                                    <span>{language.name}</span>
                                </span>
                                {i18n.language === language.code && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-signal" aria-hidden="true"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
