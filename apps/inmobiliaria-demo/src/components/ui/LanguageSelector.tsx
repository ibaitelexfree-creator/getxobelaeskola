'use client';

import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh-CN', name: '中文' },
    { code: 'fr', name: 'Français' },
];

export default function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState(languages[0]);

    useEffect(() => {
        // Add Google Translate Script
        const addGoogleTranslateScript = () => {
            // Check if script is already present
            if (document.getElementById('google-translate-script')) return;

            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,es,ar,ru,zh-CN,fr',
                        autoDisplay: false,
                    },
                    'google_translate_element'
                );
            };
        };

        addGoogleTranslateScript();

        // Check for existing language in cookie (googtrans)
        const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
        if (match) {
            const gLang = match[2].split('/')[2];
            const foundLang = languages.find((l) => l.code === gLang);
            if (foundLang) {
                setCurrentLang(foundLang);
            }
        }
    }, []);

    const changeLanguage = (lang: typeof languages[0]) => {
        setCurrentLang(lang);
        setIsOpen(false);

        // Set google translate cookie
        document.cookie = `googtrans=/en/${lang.code}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=/en/${lang.code}; path=/`;

        // Force reload to apply language cleanly without React hydration issues
        window.location.reload();
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Hidden google translate element container needed for the script to attach to */}
            <div id="google_translate_element" style={{ display: 'none' }}></div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease',
                }}
                className="hover:border-[var(--gold-400)] hover:text-[var(--gold-400)]"
            >
                <Globe size={16} />
                {currentLang.code.toUpperCase()}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        minWidth: '120px',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    }}
                >
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                textAlign: 'left',
                                background: currentLang.code === lang.code ? 'var(--bg-primary)' : 'transparent',
                                border: 'none',
                                color: currentLang.code === lang.code ? 'var(--gold-400)' : 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease',
                            }}
                            className="hover:bg-[var(--bg-primary)] hover:text-[var(--gold-400)]"
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Add these to global window object
declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}
