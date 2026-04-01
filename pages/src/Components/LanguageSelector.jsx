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

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
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
                onClick={() => setIsOpen(!isOpen)}
                className="group relative p-2.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl hover:border-violet-500/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-violet-500/20"
                aria-label="Change Language"
            >
                <Globe
                    className="w-5 h-5 text-gray-400 group-hover:text-violet-400 transition-colors duration-300"
                    strokeWidth={2}
                />
                {/* Active Language Indicator */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg">
                    {currentLanguage.code.toUpperCase()}
                </span>
            </button>

            {/* Floating Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 animate-slideIn origin-top-right">
                    <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-violet-500/20 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-700/50">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Select Language
                            </p>
                        </div>

                        {/* Language Options */}
                        <div className="py-2">
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    onClick={() => changeLanguage(language.code)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group ${i18n.language === language.code
                                            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-white'
                                            : 'text-gray-300 hover:bg-gray-700/30'
                                        }`}
                                >
                                    {/* Flag */}
                                    <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200">
                                        {language.flag}
                                    </span>

                                    {/* Language Name */}
                                    <span className={`flex-1 font-medium ${i18n.language === language.code ? 'text-violet-300' : ''
                                        }`}>
                                        {language.name}
                                    </span>

                                    {/* Active Indicator */}
                                    {i18n.language === language.code && (
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                                            <svg className="w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
