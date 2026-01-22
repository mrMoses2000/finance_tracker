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
            debts: 'Debts & Loans',
            schedule: 'Schedule',
            logout: 'Logout'
        },
        modes: {
            standard: 'Standard',
            february: 'February'
        },
        month: {
            prev: 'Previous month',
            next: 'Next month',
            picker: 'Pick month'
        },
        kpi: {
            expenses: 'Actual Expenses',
            income: 'Planned Income',
            deficit: 'Remaining Balance'
        },
        chart: {
            title: 'Expense Structure (Tremor)',
            no_data: 'No data'
        },
        category: {
            title: 'Category Breakdown',
            planned: 'Planned',
            actual: 'Actual'
        },
        calendar: {
            title: 'Payment Calendar',
            planned: 'Planned',
            paid: 'Paid'
        },
        common: {
            items: 'items',
            total: 'Total'
        },
        auth: {
            welcome: 'Welcome Back',
            login_subtitle: 'Login to your financial dashboard',
            create_account: 'Create Account',
            join_platform: 'Join the professional financial platform',
            name: 'Full Name',
            email: 'Email',
            password: 'Password',
            login_btn: 'Login',
            register_btn: 'Create Account',
            no_account: "Don't have an account?",
            has_account: 'Already have an account?',
            register_link: 'Register',
            login_link: 'Login',
            placeholder_name: 'Elon Musk',
            placeholder_email: 'you@example.com',
            placeholder_password: '••••••••'
        },
        budget_plan: {
            title: 'Budget Plan',
            subtitle: 'Set monthly limits for your expense categories.',
            monthly_limit: 'Monthly Limit',
            save_changes: 'Save Changes',
            income_title: 'Planned Income',
            income_subtitle: 'Set the monthly target for income.',
            default_limit: 'Default'
        },
        transactions: {
            title: 'Transactions',
            subtitle: 'Manage your financial records.',
            add: 'Add Transaction',
            search: 'Search by description or category...',
            empty: 'No transactions found matching your search.',
            filters: {
                all: 'All',
                expense: 'Expenses',
                income: 'Income'
            },
            fields: {
                description: 'Description',
                description_placeholder: 'Lunch, Taxi, etc.',
                type: 'Type',
                amount: 'Amount ($)',
                date: 'Date',
                category: 'Category',
                category_placeholder: 'Select Category'
            },
            actions: {
                cancel: 'Cancel',
                save: 'Save Changes',
                add: 'Add Transaction',
                label: 'Actions'
            }
        },
        debts: {
            title: 'Debts & Loans',
            subtitle: 'Track obligations and incoming repayments.',
            add: 'Add Obligation',
            edit: 'Edit Obligation',
            empty: 'No obligations yet.',
            summary: {
                owed: 'Total Owed',
                receivable: 'Receivable',
                active: 'Active Items'
            },
            table: {
                name: 'Name',
                type: 'Type',
                balance: 'Balance',
                next: 'Next Payment',
                actions: 'Actions',
                none: '—'
            },
            types: {
                debt: 'Debt',
                loan: 'Loan'
            },
            fields: {
                name: 'Name',
                name_placeholder: 'Kaspi Loan',
                type: 'Type',
                principal: 'Principal',
                balance: 'Balance',
                rate: 'Interest %',
                start: 'Start Date',
                term: 'Term (months)',
                next: 'Next Payment Date',
                payment: 'Monthly Payment',
                category: 'Category',
                category_placeholder: 'Select Category'
            },
            actions: {
                cancel: 'Cancel',
                save: 'Save Changes',
                add: 'Add'
            }
        },
        schedule: {
            title: 'Payment Schedule',
            subtitle: 'Upcoming obligations and recurring payments.',
            add: 'Add Schedule Item',
            edit: 'Edit Schedule',
            empty: 'No scheduled items for this period.',
            filters: {
                all: 'All',
                pending: 'Pending',
                paid: 'Paid'
            },
            table: {
                date: 'Date',
                title: 'Title',
                type: 'Type',
                amount: 'Amount',
                status: 'Status',
                actions: 'Actions'
            },
            fields: {
                title: 'Title',
                title_placeholder: 'Rent payment',
                amount: 'Amount ($)',
                due: 'Due Date',
                type: 'Type',
                recurrence: 'Recurrence',
                status: 'Status',
                category: 'Category',
                category_placeholder: 'Select Category'
            },
            recurrence: {
                once: 'Once',
                monthly: 'Monthly'
            },
            actions: {
                cancel: 'Cancel',
                save: 'Save Changes',
                add: 'Add'
            }
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
            debts: 'Долги и Кредиты',
            schedule: 'График',
            logout: 'Выйти'
        },
        modes: {
            standard: 'Стандарт',
            february: 'Февраль'
        },
        month: {
            prev: 'Пред. месяц',
            next: 'След. месяц',
            picker: 'Выбрать месяц'
        },
        kpi: {
            expenses: 'Факт Расходов',
            income: 'План Дохода',
            deficit: 'Остаток'
        },
        chart: {
            title: 'Структура Расходов (Tremor)',
            no_data: 'Нет данных'
        },
        category: {
            title: 'Категории',
            planned: 'План',
            actual: 'Факт'
        },
        calendar: {
            title: 'Календарь Платежей',
            planned: 'План',
            paid: 'Оплачено'
        },
        common: {
            items: 'поз.',
            total: 'Итого'
        },
        auth: {
            welcome: 'С Возвращением',
            login_subtitle: 'Войдите в ваш финансовый дашборд',
            create_account: 'Создать Аккаунт',
            join_platform: 'Присоединяйтесь к профессиональной платформе',
            name: 'Полное Имя',
            email: 'Email',
            password: 'Пароль',
            login_btn: 'Войти',
            register_btn: 'Создать Аккаунт',
            no_account: "Нет аккаунта?",
            has_account: 'Уже есть аккаунт?',
            register_link: 'Регистрация',
            login_link: 'Войти',
            placeholder_name: 'Иван Иванов',
            placeholder_email: 'you@example.com',
            placeholder_password: '••••••••'
        },
        budget_plan: {
            title: 'Планирование Бюджета',
            subtitle: 'Установите месячные лимиты по категориям расходов.',
            monthly_limit: 'Месячный Лимит',
            save_changes: 'Сохранить',
            income_title: 'План Дохода',
            income_subtitle: 'Установите цель дохода на месяц.',
            default_limit: 'База'
        },
        transactions: {
            title: 'Транзакции',
            subtitle: 'Управляйте доходами и расходами.',
            add: 'Добавить транзакцию',
            search: 'Поиск по описанию или категории...',
            empty: 'Нет транзакций по этому запросу.',
            filters: {
                all: 'Все',
                expense: 'Расходы',
                income: 'Доходы'
            },
            fields: {
                description: 'Описание',
                description_placeholder: 'Обед, такси...',
                type: 'Тип',
                amount: 'Сумма ($)',
                date: 'Дата',
                category: 'Категория',
                category_placeholder: 'Выберите категорию'
            },
            actions: {
                cancel: 'Отмена',
                save: 'Сохранить',
                add: 'Добавить',
                label: 'Действия'
            }
        },
        debts: {
            title: 'Долги и Кредиты',
            subtitle: 'Контроль обязательств и возвратов.',
            add: 'Добавить обязательство',
            edit: 'Редактировать обязательство',
            empty: 'Пока нет обязательств.',
            summary: {
                owed: 'Всего Долгов',
                receivable: 'К Получению',
                active: 'Активных'
            },
            table: {
                name: 'Название',
                type: 'Тип',
                balance: 'Остаток',
                next: 'След. платеж',
                actions: 'Действия',
                none: '—'
            },
            types: {
                debt: 'Долг',
                loan: 'Заем'
            },
            fields: {
                name: 'Название',
                name_placeholder: 'Kaspi кредит',
                type: 'Тип',
                principal: 'Сумма',
                balance: 'Остаток',
                rate: 'Ставка %',
                start: 'Дата старта',
                term: 'Срок (мес.)',
                next: 'След. платеж',
                payment: 'Ежемес. платеж',
                category: 'Категория',
                category_placeholder: 'Выберите категорию'
            },
            actions: {
                cancel: 'Отмена',
                save: 'Сохранить',
                add: 'Добавить'
            }
        },
        schedule: {
            title: 'График Платежей',
            subtitle: 'Будущие обязательства и регулярные платежи.',
            add: 'Добавить платеж',
            edit: 'Редактировать платеж',
            empty: 'Нет платежей на этот период.',
            filters: {
                all: 'Все',
                pending: 'Ожидается',
                paid: 'Оплачено'
            },
            table: {
                date: 'Дата',
                title: 'Название',
                type: 'Тип',
                amount: 'Сумма',
                status: 'Статус',
                actions: 'Действия'
            },
            fields: {
                title: 'Название',
                title_placeholder: 'Аренда',
                amount: 'Сумма ($)',
                due: 'Дата',
                type: 'Тип',
                recurrence: 'Повтор',
                status: 'Статус',
                category: 'Категория',
                category_placeholder: 'Выберите категорию'
            },
            recurrence: {
                once: 'Один раз',
                monthly: 'Ежемесячно'
            },
            actions: {
                cancel: 'Отмена',
                save: 'Сохранить',
                add: 'Добавить'
            }
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
            debts: 'Schulden & Kredite',
            schedule: 'Zeitplan',
            logout: 'Abmelden'
        },
        modes: {
            standard: 'Standard',
            february: 'Februar'
        },
        month: {
            prev: 'Vorheriger Monat',
            next: 'Nächster Monat',
            picker: 'Monat wählen'
        },
        kpi: {
            expenses: 'Ausgaben (Ist)',
            income: 'Geplantes Einkommen',
            deficit: 'Restbetrag'
        },
        chart: {
            title: 'Ausgabenstruktur (Tremor)',
            no_data: 'Keine Daten'
        },
        category: {
            title: 'Kategorieübersicht',
            planned: 'Plan',
            actual: 'Ist'
        },
        calendar: {
            title: 'Zahlungskalender',
            planned: 'Geplant',
            paid: 'Bezahlt'
        },
        common: {
            items: 'Pos.',
            total: 'Gesamt'
        },
        auth: {
            welcome: 'Willkommen zurück',
            login_subtitle: 'Login in Ihr Finanz-Dashboard',
            create_account: 'Konto erstellen',
            join_platform: 'Treten Sie der professionellen Plattform bei',
            name: 'Vollständiger Name',
            email: 'E-Mail',
            password: 'Passwort',
            login_btn: 'Anmelden',
            register_btn: 'Konto erstellen',
            no_account: "Kein Konto?",
            has_account: 'Bereits ein Konto?',
            register_link: 'Registrieren',
            login_link: 'Anmelden',
            placeholder_name: 'Max Mustermann',
            placeholder_email: 'sie@beispiel.de',
            placeholder_password: '••••••••'
        },
        budget_plan: {
            title: 'Budgetplanung',
            subtitle: 'Monatliche Limits für Ihre Ausgabenkategorien festlegen.',
            monthly_limit: 'Monatliches Limit',
            save_changes: 'Änderungen speichern',
            income_title: 'Geplantes Einkommen',
            income_subtitle: 'Monatliches Einkommensziel festlegen.',
            default_limit: 'Standard'
        },
        transactions: {
            title: 'Transaktionen',
            subtitle: 'Verwalten Sie Einnahmen und Ausgaben.',
            add: 'Transaktion hinzufügen',
            search: 'Suche nach Beschreibung oder Kategorie...',
            empty: 'Keine passenden Transaktionen gefunden.',
            filters: {
                all: 'Alle',
                expense: 'Ausgaben',
                income: 'Einnahmen'
            },
            fields: {
                description: 'Beschreibung',
                description_placeholder: 'Mittagessen, Taxi...',
                type: 'Typ',
                amount: 'Betrag ($)',
                date: 'Datum',
                category: 'Kategorie',
                category_placeholder: 'Kategorie wählen'
            },
            actions: {
                cancel: 'Abbrechen',
                save: 'Speichern',
                add: 'Hinzufügen',
                label: 'Aktionen'
            }
        },
        debts: {
            title: 'Schulden & Kredite',
            subtitle: 'Verpflichtungen und Rückzahlungen im Blick.',
            add: 'Verpflichtung hinzufügen',
            edit: 'Verpflichtung bearbeiten',
            empty: 'Noch keine Verpflichtungen.',
            summary: {
                owed: 'Gesamt Schulden',
                receivable: 'Forderungen',
                active: 'Aktiv'
            },
            table: {
                name: 'Name',
                type: 'Typ',
                balance: 'Saldo',
                next: 'Nächste Zahlung',
                actions: 'Aktionen',
                none: '—'
            },
            types: {
                debt: 'Schuld',
                loan: 'Darlehen'
            },
            fields: {
                name: 'Name',
                name_placeholder: 'Kaspi Kredit',
                type: 'Typ',
                principal: 'Hauptbetrag',
                balance: 'Saldo',
                rate: 'Zins %',
                start: 'Startdatum',
                term: 'Laufzeit (Monate)',
                next: 'Nächste Zahlung',
                payment: 'Monatliche Zahlung',
                category: 'Kategorie',
                category_placeholder: 'Kategorie wählen'
            },
            actions: {
                cancel: 'Abbrechen',
                save: 'Speichern',
                add: 'Hinzufügen'
            }
        },
        schedule: {
            title: 'Zahlungsplan',
            subtitle: 'Bevorstehende Verpflichtungen und regelmäßige Zahlungen.',
            add: 'Eintrag hinzufügen',
            edit: 'Eintrag bearbeiten',
            empty: 'Keine Einträge für diesen Zeitraum.',
            filters: {
                all: 'Alle',
                pending: 'Offen',
                paid: 'Bezahlt'
            },
            table: {
                date: 'Datum',
                title: 'Titel',
                type: 'Typ',
                amount: 'Betrag',
                status: 'Status',
                actions: 'Aktionen'
            },
            fields: {
                title: 'Titel',
                title_placeholder: 'Miete',
                amount: 'Betrag ($)',
                due: 'Fällig am',
                type: 'Typ',
                recurrence: 'Wiederholung',
                status: 'Status',
                category: 'Kategorie',
                category_placeholder: 'Kategorie wählen'
            },
            recurrence: {
                once: 'Einmalig',
                monthly: 'Monatlich'
            },
            actions: {
                cancel: 'Abbrechen',
                save: 'Speichern',
                add: 'Hinzufügen'
            }
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
