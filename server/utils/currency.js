const RATES = {
  USD: 1,
  EUR: 0.92,
  KZT: 505,
  RUB: 96,
};

const SYMBOLS = {
  USD: '$',
  EUR: 'EUR',
  KZT: 'KZT',
  RUB: 'RUB',
};

export const normalizeCurrency = (currency) => {
  if (!currency) return 'USD';
  const upper = currency.toUpperCase();
  return RATES[upper] ? upper : 'USD';
};

export const convertToUSD = (amount, currency) => {
  const code = normalizeCurrency(currency);
  const rate = RATES[code] || 1;
  const value = Number(amount || 0);
  if (!rate) return 0;
  return value / rate;
};

export const convertFromUSD = (amountUSD, currency) => {
  const code = normalizeCurrency(currency);
  const rate = RATES[code] || 1;
  const value = Number(amountUSD || 0);
  return value * rate;
};

export const getCurrencySymbol = (currency) => SYMBOLS[normalizeCurrency(currency)] || '$';
