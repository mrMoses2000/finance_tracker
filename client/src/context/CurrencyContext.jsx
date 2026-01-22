import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CURRENCY, RATES, SYMBOLS } from '../data/currency';

const CurrencyContext = createContext();

const getLocale = (lang) => {
  if (lang === 'ru') return 'ru-RU';
  if (lang === 'de') return 'de-DE';
  return 'en-US';
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('app_currency') || DEFAULT_CURRENCY);

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  const value = useMemo(() => {
    const convert = (amountUSD) => {
      const rate = RATES[currency] || 1;
      return Math.round((Number(amountUSD) || 0) * rate);
    };

    const toUSD = (amountLocal) => {
      const rate = RATES[currency] || 1;
      if (!rate) return 0;
      return Number(amountLocal || 0) / rate;
    };

    const formatMoney = (amountUSD, lang = 'en') => {
      const locale = getLocale(lang);
      const value = convert(amountUSD);
      return `${new Intl.NumberFormat(locale).format(value)} ${SYMBOLS[currency]}`;
    };

    return { currency, setCurrency, convert, toUSD, formatMoney };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
