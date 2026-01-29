const SYMBOLS = {
  USD: '$',
  EUR: '€',
  KZT: '₸',
  RUB: '₽',
};

export const SUPPORTED_CURRENCIES = Object.keys(SYMBOLS);

export const normalizeCurrency = (currency) => {
  if (!currency) return 'USD';
  const upper = currency.toUpperCase();
  return SUPPORTED_CURRENCIES.includes(upper) ? upper : 'USD';
};

export const getCurrencySymbol = (currency) => SYMBOLS[normalizeCurrency(currency)] || '$';
