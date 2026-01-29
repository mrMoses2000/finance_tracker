import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getLatestRates, convertAmount } from '../services/exchangeRates.js';
import { normalizeCurrency, SUPPORTED_CURRENCIES } from '../utils/currency.js';

const router = Router();

router.get('/rates/latest', asyncHandler(async (req, res) => {
  const base = normalizeCurrency(req.query.base || 'EUR');
  const symbolsParam = (req.query.symbols || '').trim();
  const symbols = symbolsParam
    ? symbolsParam.split(',').map((c) => normalizeCurrency(c)).filter(Boolean)
    : SUPPORTED_CURRENCIES;

  const ratesData = await getLatestRates();
  const rates = {};

  symbols.forEach((symbol) => {
    if (symbol === base) {
      rates[symbol] = 1;
      return;
    }
    const converted = convertAmount(1, base, symbol, ratesData);
    rates[symbol] = converted.amount;
  });

  return res.json({
    base,
    asOfDate: ratesData.asOfDate,
    source: ratesData.source,
    rates,
  });
}));

export default router;
