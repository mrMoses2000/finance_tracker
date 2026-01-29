import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CURRENCY, DEFAULT_RATES, SUPPORTED_CURRENCIES, SYMBOLS } from '../data/currency';

const CurrencyContext = createContext();

const getLocale = (lang) => {
  if (lang === 'ru') return 'ru-RU';
  if (lang === 'de') return 'de-DE';
  return 'en-US';
};

export const CurrencyProvider = ({ children }) => {
  const [baseCurrency, setBaseCurrency] = useState(() => localStorage.getItem('base_currency') || DEFAULT_CURRENCY);
  const [currency, setCurrency] = useState(() => localStorage.getItem('app_currency') || baseCurrency);
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [ratesBase, setRatesBase] = useState('EUR');

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('base_currency', baseCurrency);
    if (!localStorage.getItem('app_currency')) {
      setCurrency(baseCurrency);
    }
  }, [baseCurrency]);

  useEffect(() => {
    const handleAuth = () => {
      const storedBase = localStorage.getItem('base_currency');
      const storedDisplay = localStorage.getItem('app_currency');
      if (storedBase && storedBase !== baseCurrency) {
        setBaseCurrency(storedBase);
      }
      if (storedDisplay && storedDisplay !== currency) {
        setCurrency(storedDisplay);
      }
    };
    window.addEventListener('app:auth', handleAuth);
    return () => window.removeEventListener('app:auth', handleAuth);
  }, [baseCurrency, currency]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.currency && SUPPORTED_CURRENCIES.includes(data.currency)) {
          setBaseCurrency(data.currency);
          if (!localStorage.getItem('app_currency')) {
            setCurrency(data.currency);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/rates/latest')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.rates) {
          setRates(data.rates);
          setRatesBase(data.base || 'EUR');
        }
      })
      .catch(() => {});
  }, []);

  const value = useMemo(() => {
    const convertAmount = (amount, fromCurrency, toCurrency) => {
      const from = fromCurrency || ratesBase;
      const to = toCurrency || ratesBase;
      if (from === to) return Number(amount || 0);
      const rateFrom = from === ratesBase ? 1 : rates[from];
      const rateTo = to === ratesBase ? 1 : rates[to];
      if (!rateFrom || !rateTo) return Number(amount || 0);
      return (Number(amount || 0) / rateFrom) * rateTo;
    };

    const convert = (amountBase) => {
      return Math.round(convertAmount(amountBase, baseCurrency, currency));
    };

    const toBase = (amountLocal) => {
      return convertAmount(amountLocal, currency, baseCurrency);
    };

    const formatMoney = (amountBase, lang = 'en') => {
      const locale = getLocale(lang);
      const value = convert(amountBase);
      return `${new Intl.NumberFormat(locale).format(value)} ${SYMBOLS[currency]}`;
    };

    return { currency, baseCurrency, setCurrency, setBaseCurrency, convert, toBase, formatMoney, rates, ratesBase };
  }, [currency, baseCurrency, rates, ratesBase]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
