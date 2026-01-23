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
            transactions: 'Operations',
            budget: 'Budget Plan',
            debts: 'Debts & Loans',
            schedule: 'Schedule',
            logout: 'Logout',
            theme_light: 'Light Mode',
            theme_dark: 'Dark Mode'
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
        dashboard: {
            tabs: {
                actual: 'Actual',
                plan: 'Plan'
            },
            plan_hint: 'Edit limits in the Budget tab to shape this view.',
            budget_usage: 'Budget Usage',
            budget_usage_detail: 'Used {percent}% of plan',
            budget_warning: 'You are close to exceeding the limit in:',
            variance: 'Variance'
        },
        kpi: {
            actual_expenses: 'Actual Expenses',
            actual_income: 'Actual Income',
            planned_expenses: 'Planned Expenses',
            planned_income: 'Planned Income',
            balance: 'Balance',
            planned_balance: 'Planned Balance'
        },
        chart: {
            title: 'Expense Structure (Tremor)',
            title_actual: 'Actual Expense Structure',
            title_plan: 'Planned Expense Structure',
            no_data: 'No data',
            total_label: 'Total'
        },
        category: {
            title: 'Category Breakdown',
            planned_title: 'Planned Allocation',
            planned: 'Planned',
            actual: 'Actual'
        },
        category_manager: {
            title: 'Manage Categories',
            title_short: 'Categories',
            subtitle: 'Add, edit, or remove categories for planning and operations.',
            name: 'Category name',
            name_placeholder: 'Food, Rent, Salary',
            type: 'Type',
            limit: 'Default limit',
            color: 'Color',
            add: 'Add Category',
            save: 'Save',
            cancel: 'Cancel',
            close: 'Close',
            empty: 'No categories yet.',
            error_required: 'Name is required',
            error_duplicate: 'Category already exists',
            error_in_use: 'Category is in use'
        },
        calendar: {
            title: 'Payment Calendar',
            title_plan: 'Planned Payment Calendar',
            list_title: 'Details for',
            empty: 'No items for this day.',
            uncategorized: 'Uncategorized',
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
            default_limit: 'Default',
            summary_title: 'Plan Summary',
            summary_subtitle: 'Total planned expenses',
            balance: 'Balance',
            balance_warning: 'Planned expenses exceed income.',
            limits_title: 'Monthly Limits',
            remove: 'Remove'
        },
        transactions: {
            title: 'Operations',
            subtitle: 'Track expenses and income regardless of payment method.',
            add: 'Add Operation',
            search: 'Search by description or category...',
            empty: 'No operations found matching your search.',
            filters: {
                all: 'All',
                expense: 'Expenses',
                income: 'Income'
            },
            fields: {
                description: 'Description',
                description_placeholder: 'Lunch, Taxi, etc.',
                type: 'Type',
                amount: 'Amount',
                date: 'Date',
                category: 'Category',
                category_placeholder: 'Select Category'
            },
            actions: {
                cancel: 'Cancel',
                save: 'Save Changes',
                add: 'Add Operation',
                label: 'Actions'
            }
        },
        debts: {
            title: 'Debts & Loans',
            subtitle: 'Track obligations and incoming repayments.',
            add: 'Add Obligation',
            edit: 'Edit Obligation',
            empty: 'No obligations yet.',
            loan_help_title: 'What is a loan to a client?',
            loan_help: 'This is money you issued and expect to receive back. It appears on the receivable side.',
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
                loan: 'Issued Loan'
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
            drag_hint: 'Drag to reschedule payments',
            list_title: 'Payments for',
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
                amount: 'Amount',
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
            transactions: 'Операции',
            budget: 'Бюджет',
            debts: 'Долги и Кредиты',
            schedule: 'График',
            logout: 'Выйти',
            theme_light: 'Светлая тема',
            theme_dark: 'Темная тема'
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
        dashboard: {
            tabs: {
                actual: 'Факт',
                plan: 'План'
            },
            plan_hint: 'Редактируйте лимиты на вкладке «Бюджет».',
            budget_usage: 'Использование бюджета',
            budget_usage_detail: 'Использовано {percent}% плана',
            budget_warning: 'Вы близки к лимиту по:',
            variance: 'Отклонение от плана'
        },
        kpi: {
            actual_expenses: 'Фактические расходы',
            actual_income: 'Фактические доходы',
            planned_expenses: 'План расходов',
            planned_income: 'План доходов',
            balance: 'Остаток',
            planned_balance: 'Плановый остаток'
        },
        chart: {
            title: 'Структура Расходов (Tremor)',
            title_actual: 'Структура фактических расходов',
            title_plan: 'Структура плановых расходов',
            no_data: 'Нет данных',
            total_label: 'Итого'
        },
        category: {
            title: 'Категории',
            planned_title: 'План по категориям',
            planned: 'План',
            actual: 'Факт'
        },
        category_manager: {
            title: 'Управление категориями',
            title_short: 'Категории',
            subtitle: 'Добавляйте, редактируйте и удаляйте категории для бюджета и операций.',
            name: 'Название категории',
            name_placeholder: 'Еда, Аренда, Зарплата',
            type: 'Тип',
            limit: 'Базовый лимит',
            color: 'Цвет',
            add: 'Добавить категорию',
            save: 'Сохранить',
            cancel: 'Отмена',
            close: 'Закрыть',
            empty: 'Категорий пока нет.',
            error_required: 'Название обязательно',
            error_duplicate: 'Категория уже существует',
            error_in_use: 'Категория используется'
        },
        calendar: {
            title: 'Календарь Платежей',
            title_plan: 'Плановый календарь',
            list_title: 'Список на',
            empty: 'Нет записей на эту дату.',
            uncategorized: 'Без категории',
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
            default_limit: 'База',
            summary_title: 'Сводка плана',
            summary_subtitle: 'Итого запланированные расходы',
            balance: 'Остаток',
            balance_warning: 'План превышает доход.',
            limits_title: 'Месячные лимиты',
            remove: 'Удалить'
        },
        transactions: {
            title: 'Операции',
            subtitle: 'Учет расходов и доходов (карта, наличные, переводы).',
            add: 'Добавить операцию',
            search: 'Поиск по описанию или категории...',
            empty: 'Нет операций по этому запросу.',
            filters: {
                all: 'Все',
                expense: 'Расходы',
                income: 'Доходы'
            },
            fields: {
                description: 'Описание',
                description_placeholder: 'Обед, такси...',
                type: 'Тип',
                amount: 'Сумма',
                date: 'Дата',
                category: 'Категория',
                category_placeholder: 'Выберите категорию'
            },
            actions: {
                cancel: 'Отмена',
                save: 'Сохранить',
                add: 'Добавить операцию',
                label: 'Действия'
            }
        },
        debts: {
            title: 'Долги и Кредиты',
            subtitle: 'Контроль обязательств и возвратов.',
            add: 'Добавить обязательство',
            edit: 'Редактировать обязательство',
            empty: 'Пока нет обязательств.',
            loan_help_title: 'Что такое выданный займ?',
            loan_help: 'Это деньги, которые вы дали и ожидаете вернуть. Они попадают в блок «К получению».',
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
                loan: 'Выданный займ'
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
            drag_hint: 'Перетаскивайте, чтобы изменить дату',
            list_title: 'Платежи на',
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
                amount: 'Сумма',
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
            transactions: 'Operationen',
            budget: 'Budget',
            debts: 'Schulden & Kredite',
            schedule: 'Zeitplan',
            logout: 'Abmelden',
            theme_light: 'Heller Modus',
            theme_dark: 'Dunkler Modus'
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
        dashboard: {
            tabs: {
                actual: 'Ist',
                plan: 'Plan'
            },
            plan_hint: 'Limits im Budget-Tab anpassen.',
            budget_usage: 'Budgetnutzung',
            budget_usage_detail: '{percent}% des Plans verbraucht',
            budget_warning: 'Nahe am Limit in:',
            variance: 'Abweichung'
        },
        kpi: {
            actual_expenses: 'Ausgaben (Ist)',
            actual_income: 'Einnahmen (Ist)',
            planned_expenses: 'Geplante Ausgaben',
            planned_income: 'Geplantes Einkommen',
            balance: 'Saldo',
            planned_balance: 'Geplanter Saldo'
        },
        chart: {
            title: 'Ausgabenstruktur (Tremor)',
            title_actual: 'Ist-Ausgabenstruktur',
            title_plan: 'Plan-Ausgabenstruktur',
            no_data: 'Keine Daten',
            total_label: 'Gesamt'
        },
        category: {
            title: 'Kategorieübersicht',
            planned_title: 'Geplante Verteilung',
            planned: 'Plan',
            actual: 'Ist'
        },
        category_manager: {
            title: 'Kategorien verwalten',
            title_short: 'Kategorien',
            subtitle: 'Kategorien für Planung und Operationen hinzufügen, bearbeiten oder löschen.',
            name: 'Kategoriename',
            name_placeholder: 'Essen, Miete, Gehalt',
            type: 'Typ',
            limit: 'Standardlimit',
            color: 'Farbe',
            add: 'Kategorie hinzufügen',
            save: 'Speichern',
            cancel: 'Abbrechen',
            close: 'Schließen',
            empty: 'Noch keine Kategorien.',
            error_required: 'Name ist erforderlich',
            error_duplicate: 'Kategorie existiert bereits',
            error_in_use: 'Kategorie wird verwendet'
        },
        calendar: {
            title: 'Zahlungskalender',
            title_plan: 'Plan-Zahlungskalender',
            list_title: 'Details für',
            empty: 'Keine Einträge für diesen Tag.',
            uncategorized: 'Ohne Kategorie',
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
            default_limit: 'Standard',
            summary_title: 'Planübersicht',
            summary_subtitle: 'Geplante Gesamtausgaben',
            balance: 'Saldo',
            balance_warning: 'Geplante Ausgaben übersteigen das Einkommen.',
            limits_title: 'Monatliche Limits',
            remove: 'Entfernen'
        },
        transactions: {
            title: 'Operationen',
            subtitle: 'Ausgaben und Einnahmen unabhängig von der Zahlungsmethode.',
            add: 'Operation hinzufügen',
            search: 'Suche nach Beschreibung oder Kategorie...',
            empty: 'Keine passenden Operationen gefunden.',
            filters: {
                all: 'Alle',
                expense: 'Ausgaben',
                income: 'Einnahmen'
            },
            fields: {
                description: 'Beschreibung',
                description_placeholder: 'Mittagessen, Taxi...',
                type: 'Typ',
                amount: 'Betrag',
                date: 'Datum',
                category: 'Kategorie',
                category_placeholder: 'Kategorie wählen'
            },
            actions: {
                cancel: 'Abbrechen',
                save: 'Speichern',
                add: 'Operation hinzufügen',
                label: 'Aktionen'
            }
        },
        debts: {
            title: 'Schulden & Kredite',
            subtitle: 'Verpflichtungen und Rückzahlungen im Blick.',
            add: 'Verpflichtung hinzufügen',
            edit: 'Verpflichtung bearbeiten',
            empty: 'Noch keine Verpflichtungen.',
            loan_help_title: 'Was ist ein ausgegebener Kredit?',
            loan_help: 'Geld, das Sie verliehen haben und zurückerwarten. Es erscheint unter Forderungen.',
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
                loan: 'Ausgegebener Kredit'
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
            drag_hint: 'Ziehen, um das Datum zu ändern',
            list_title: 'Zahlungen für',
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
                amount: 'Betrag',
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
