import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    en: {
        brand: 'BudgetFlow',
        login: 'Login',
        get_started: 'Get Started',
        hero_title: 'Master Your Money',
        hero_subtitle: 'Without the Stress.',
        hero_desc: 'Financial Compass & Planning',
        cta: 'Start Your Journey',
        footer: '© 2026 BudgetFlow. Built for the Hackathon.',
        preview_label: 'Interactive Dashboard Preview',
        features: {
            analytics: 'Smart Analytics',
            analytics_desc: 'Visualize your spending with professional Tremor charts and real-time insights.',
            security: 'Bank-Grade Security',
            security_desc: 'Your data is encrypted and secure. Built with modern JWT authentication.',
            multi_device: 'Multi-Device',
            multi_device_desc: 'Access your finances from anywhere. Fully responsive design for mobile and desktop.'
        },
        nav: {
            dashboard: 'Dashboard',
            transactions: 'Transactions',
            budget: 'Budget Plan',
            logout: 'Logout'
        },
        modes: {
            standard: 'Standard',
            february: 'February'
        },
        kpi: {
            expenses: 'Total Expenses',
            income: 'Guaranteed Income',
            deficit: 'Budget Deficit'
        },
        chart: {
            title: 'Expense Structure (Tremor)',
            no_data: 'No data'
        },
        calendar: {
            title: 'Payment Calendar'
        },
        common: {
            items: 'items',
            total: 'Total'
        }
    },
    ru: {
        brand: 'Личный Бюджет',
        login: 'Войти',
        get_started: 'Начать сейчас',
        hero_title: 'Управляй Финансами',
        hero_subtitle: 'Без Стресса.',
        hero_desc: 'Финансовый компас и планирование',
        cta: 'Начать',
        footer: '© 2026 BudgetFlow. Сделано для Хакатона.',
        preview_label: 'Интерактивный предпросмотр',
        features: {
            analytics: 'Умная Аналитика',
            analytics_desc: 'Визуализируйте расходы с помощью диаграмм Tremor и инсайтов в реальном времени.',
            security: 'Банковская Защита',
            security_desc: 'Ваши данные зашифрованы. Современная JWT аутентификация.',
            multi_device: 'Мультиплатформа',
            multi_device_desc: 'Доступ к финансам отовсюду. Полная адаптация под мобильные и десктопы.'
        },
        nav: {
            dashboard: 'Дашборд',
            transactions: 'Транзакции',
            budget: 'Бюджет',
            logout: 'Выйти'
        },
        modes: {
            standard: 'Стандарт',
            february: 'Февраль'
        },
        kpi: {
            expenses: 'Всего Расходов',
            income: 'Гарантированный Доход',
            deficit: 'Дефицит Бюджета'
        },
        chart: {
            title: 'Структура Расходов (Tremor)',
            no_data: 'Нет данных'
        },
        calendar: {
            title: 'Календарь Платежей'
        },
        common: {
            items: 'поз.',
            total: 'Итого'
        }
    },
    de: {
        brand: 'BudgetFlow',
        login: 'Einloggen',
        get_started: 'Loslegen',
        hero_title: 'Meistere dein Geld',
        hero_subtitle: 'Ohne Stress.',
        hero_desc: 'Finanzkompass & Planung',
        cta: 'Starten',
        footer: '© 2026 BudgetFlow. Gebaut für den Hackathon.',
        preview_label: 'Interaktive Dashboard-Vorschau',
        features: {
            analytics: 'Smarte Analytik',
            analytics_desc: 'Visualisieren Sie Ihre Ausgaben mit professionellen Tremor-Diagrammen und Echtzeit-Einblicken.',
            security: 'Bank-Sicherheit',
            security_desc: 'Ihre Daten sind verschlüsselt und sicher. Gebaut mit moderner JWT-Authentifizierung.',
            multi_device: 'Multi-Gerät',
            multi_device_desc: 'Greifen Sie von überall auf Ihre Finanzen zu. Vollständig responsives Design.',
        },
        nav: {
            dashboard: 'Übersicht',
            transactions: 'Transaktionen',
            budget: 'Budget',
            logout: 'Abmelden'
        },
        modes: {
            standard: 'Standard',
            february: 'Februar'
        },
        kpi: {
            expenses: 'Gesamtausgaben',
            income: 'Garantiertes Einkommen',
            deficit: 'Haushaltsdefizit'
        },
        chart: {
            title: 'Ausgabenstruktur (Tremor)',
            no_data: 'Keine Daten'
        },
        calendar: {
            title: 'Zahlungskalender'
        },
        common: {
            items: 'Pos.',
            total: 'Gesamt'
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('ru'); // Default to Russian as requested

    useEffect(() => {
        const saved = localStorage.getItem('language');
        if (saved && translations[saved]) {
            setLang(saved);
        }
    }, []);

    const switchLang = (l) => {
        setLang(l);
        localStorage.setItem('language', l);
    };

    return (
        <LanguageContext.Provider value={{ lang, t: translations[lang], switchLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
