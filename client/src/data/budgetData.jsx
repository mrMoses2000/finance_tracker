import React from 'react';
import {
    Wallet, TrendingDown, AlertCircle, Calendar, CreditCard,
    Home, Coffee, Heart, Activity, Wifi, Monitor, Scissors,
    MapPin, Car, Briefcase, PieChart as PieIcon, Landmark, User,
    Utensils
} from 'lucide-react';

export const RATES = {
    USD: 1,
    KZT: 505,
    RUB: 96,
};

export const SYMBOLS = {
    USD: '$',
    KZT: '₸',
    RUB: '₽',
};

// Added Utensils as fallback for food if needed, though Wallet was used in original
export const CATEGORY_CONFIG = {
    housing: { label: 'Жилье и Связь', color: '#0d9488' },      // Teal (Квартира, Инет)
    loans_kz: { label: 'Кредиты (KZ)', color: '#16a34a' },     // Green (Kaspi, Solvo)
    loans_ru: { label: 'Кредиты (РФ)', color: '#e11d48' },     // Rose (Sber, T-Bank)
    debt_private: { label: 'Долги Людям', color: '#f59e0b' },  // Amber (Частный долг)
    admin: { label: 'Налоги и Сервисы', color: '#64748b' },    // Slate (Налоги, Подписки)
    living: { label: 'Жизнь (Еда, Проезд)', color: '#ea580c' },// Orange (Продукты, Транспорт)
    giving: { label: 'Благотворительность', color: '#7c3aed' },// Violet (Десятина, Помощь)
    lifestyle: { label: 'Досуг и Кофе', color: '#3b82f6' },    // Blue (Кафе)
    trip: { label: 'Поездка (Алматы)', color: '#db2777' },     // Pink (Только февраль)
};

const COMMON_EXPENSES = [
    { id: 'sub', name: 'Сервисы и подписки', day: 7, amountUSD: 12, category: 'admin', icon: <Monitor size={16} /> },
    { id: 'kaspi', name: 'Kaspi Bank (Кредит KZ)', day: 9, amountUSD: 146, category: 'loans_kz', icon: <CreditCard size={16} /> },
    { id: 'sber', name: 'Сбербанк (11к RUB)', day: 10, amountUSD: 113, category: 'loans_ru', icon: <Landmark size={16} /> },
    { id: 'private', name: 'Частный долг (1/4)', day: 10, amountUSD: 58, category: 'debt_private', icon: <User size={16} /> },
    { id: 'rent', name: 'Аренда квартиры', day: 15, amountUSD: 129, category: 'housing', icon: <Home size={16} /> },
    { id: 'tax', name: 'Налоги (ИП/Соц)', day: 25, amountUSD: 64, category: 'admin', icon: <Activity size={16} /> },
    { id: 'solvo', name: 'Solvo Bank', day: 28, amountUSD: 40, category: 'loans_kz', icon: <CreditCard size={16} /> },
    { id: 'net', name: 'Интернет (Дом)', day: 29, amountUSD: 14, category: 'housing', icon: <Wifi size={16} /> },
];

export const STANDARD_DATA = [
    ...COMMON_EXPENSES,
    { id: 'tbank', name: 'Т-Банк (4к RUB)', day: 19, amountUSD: 41, category: 'loans_ru', icon: <AlertCircle size={16} /> },
    { id: 'food', name: 'Продукты + Быт', amountUSD: 238, category: 'living', icon: <Wallet size={16} /> },
    { id: 'transport', name: 'Транспорт (город)', amountUSD: 79, category: 'living', icon: <Car size={16} /> },
    { id: 'meds', name: 'Медицина', amountUSD: 20, category: 'living', icon: <Activity size={16} /> },
    { id: 'hygiene', name: 'Гигиена/Стрижка', amountUSD: 30, category: 'living', icon: <Scissors size={16} /> },
    { id: 'tithe', name: 'Десятина (Целевая)', amountUSD: 120, category: 'giving', icon: <Heart size={16} /> },
    { id: 'coffee', name: 'Кафе / Кофе', amountUSD: 59, category: 'lifestyle', icon: <Coffee size={16} /> },
    { id: 'charity', name: 'Помощь / Благо', amountUSD: 50, category: 'giving', icon: <Heart size={16} /> },
];

export const FEBRUARY_DATA = [
    ...COMMON_EXPENSES,
    { id: 'tbank_double', name: 'Т-Банк (Двойной)', day: 19, amountUSD: 82, category: 'loans_ru', note: '8к RUB (долг)', icon: <AlertCircle size={16} /> },
    { id: 'trip_road', name: 'Дорога (Алматы)', amountUSD: 95, category: 'trip', icon: <MapPin size={16} /> },
    { id: 'trip_conf', name: 'Конференц-взнос', amountUSD: 30, category: 'trip', icon: <Briefcase size={16} /> },
    { id: 'food_alma', name: 'Продукты (Алматы)', amountUSD: 300, category: 'living', icon: <Wallet size={16} /> },
    { id: 'transport_alma', name: 'Транспорт (Алматы)', amountUSD: 120, category: 'living', icon: <Car size={16} /> },
    { id: 'meds_hygiene_alma', name: 'Медицина/Гигиена', amountUSD: 51, category: 'living', icon: <Activity size={16} /> },
    { id: 'tithe_feb', name: 'Десятина (Пересчет)', amountUSD: 145, category: 'giving', icon: <Heart size={16} /> },
    { id: 'var_feb', name: 'Кафе / Помощь', amountUSD: 109, category: 'lifestyle', icon: <Coffee size={16} /> },
];

export const INCOME_USD = 59;
