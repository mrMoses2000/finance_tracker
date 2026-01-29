import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { XMLParser } from 'fast-xml-parser';
import prisma from '../db/prisma.js';
import { toNumber, toDecimal } from '../utils/money.js';
import { normalizeCurrency, SUPPORTED_CURRENCIES } from '../utils/currency.js';
import { RATES_SOURCE, RATES_BASE, RATES_FALLBACK } from '../config/env.js';

const ECB_DAILY_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
const CBR_DAILY_URL = 'https://www.cbr.ru/scripts/XML_daily.asp';
const execFileAsync = promisify(execFile);

const fetchWithCurl = async (url) => {
  try {
    const { stdout } = await execFileAsync(
      'curl',
      ['-fsSL', '--connect-timeout', '10', '--max-time', '30', url],
      { maxBuffer: 5 * 1024 * 1024 },
    );
    return stdout;
  } catch (err) {
    const details = err?.stderr ? String(err.stderr).trim() : err?.message;
    throw new Error(`curl failed${details ? `: ${details}` : ''}`);
  }
};

const parseEcbXml = (xml) => {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml);
  const envelope = parsed['gesmes:Envelope'] || parsed.Envelope || parsed;
  const cubeRoot = envelope?.Cube?.Cube || envelope?.Cube || null;
  const timeNode = Array.isArray(cubeRoot) ? cubeRoot[0] : cubeRoot;
  const asOf = timeNode?.['@_time'] || null;
  const rateNodes = timeNode?.Cube || [];
  const nodes = Array.isArray(rateNodes) ? rateNodes : [rateNodes];

  const rates = { EUR: 1 };
  nodes.forEach((node) => {
    const code = node?.['@_currency'];
    const rate = node?.['@_rate'];
    if (!code || !rate) return;
    rates[code.toUpperCase()] = Number.parseFloat(rate);
  });

  return { asOf, rates };
};

export const fetchRatesFromEcb = async () => {
  const xml = await fetchWithCurl(ECB_DAILY_URL);
  const { asOf, rates } = parseEcbXml(xml);
  if (!asOf || !rates || Object.keys(rates).length === 0) {
    throw new Error('ECB parse failed: no rates');
  }
  return { asOfDate: new Date(asOf), rates, source: 'ecb', base: 'EUR' };
};

const parseCbrXml = (xml) => {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const parsed = parser.parse(xml);
  const root = parsed.ValCurs || parsed;
  const asOf = root?.['@_Date'] || null;
  const nodes = root?.Valute || [];
  const list = Array.isArray(nodes) ? nodes : [nodes];

  const rates = { RUB: 1 };
  list.forEach((node) => {
    const code = node?.CharCode;
    const nominal = Number.parseFloat(String(node?.Nominal || '1').replace(',', '.'));
    const value = Number.parseFloat(String(node?.Value || '').replace(',', '.'));
    if (!code || !Number.isFinite(value) || !Number.isFinite(nominal) || nominal <= 0) return;
    const rubPerUnit = value / nominal;
    if (rubPerUnit <= 0) return;
    rates[code.toUpperCase()] = 1 / rubPerUnit;
  });

  return { asOf, rates };
};

export const fetchRatesFromCbr = async () => {
  const xml = await fetchWithCurl(CBR_DAILY_URL);
  const { asOf, rates } = parseCbrXml(xml);
  if (!asOf || !rates || Object.keys(rates).length === 0) {
    throw new Error('CBR parse failed: no rates');
  }
  const [day, month, year] = asOf.split('.');
  const asOfDate = year && month && day ? new Date(`${year}-${month}-${day}`) : new Date();
  return { asOfDate, rates, source: 'cbr', base: 'RUB' };
};

export const storeRates = async ({ asOfDate, rates, source, base }) => {
  const rows = Object.entries(rates).map(([quoteCurrency, rate]) => ({
    id: crypto.randomUUID(),
    baseCurrency: base,
    quoteCurrency,
    rate: new Prisma.Decimal(String(rate)),
    asOfDate,
    source,
  }));

  await prisma.exchangeRate.createMany({
    data: rows,
    skipDuplicates: true,
  });
};

export const updateRates = async () => {
  let data;
  if (RATES_SOURCE === 'ecb') {
    data = await fetchRatesFromEcb();
  } else if (RATES_SOURCE === 'cbr') {
    data = await fetchRatesFromCbr();
  } else {
    throw new Error(`Unsupported rates source: ${RATES_SOURCE}`);
  }
  await storeRates(data);
  return data;
};

const fallbackRates = () => {
  const fallback = RATES_FALLBACK || { [RATES_BASE]: 1 };
  return { base: RATES_BASE, asOfDate: new Date(), rates: { ...fallback, [RATES_BASE]: 1 }, source: 'fallback' };
};

export const getLatestRates = async () => {
  const baseFilter = RATES_BASE ? { baseCurrency: RATES_BASE } : undefined;
  let latest = await prisma.exchangeRate.findFirst({
    where: baseFilter,
    orderBy: { asOfDate: 'desc' },
  });

  if (!latest) {
    latest = await prisma.exchangeRate.findFirst({ orderBy: { asOfDate: 'desc' } });
  }

  if (!latest) {
    return fallbackRates();
  }

  const rows = await prisma.exchangeRate.findMany({
    where: { baseCurrency: latest.baseCurrency, asOfDate: latest.asOfDate, source: latest.source },
  });

  const rates = { [latest.baseCurrency]: 1 };
  rows.forEach((row) => {
    rates[row.quoteCurrency] = toNumber(row.rate, 0);
  });

  return {
    base: latest.baseCurrency,
    asOfDate: latest.asOfDate,
    rates,
    source: latest.source,
  };
};

export const convertAmount = (amount, fromCurrency, toCurrency, ratesData) => {
  const base = ratesData.base || RATES_BASE;
  const rates = ratesData.rates || {};
  const from = normalizeCurrency(fromCurrency || base);
  const to = normalizeCurrency(toCurrency || base);
  const parsed = toNumber(amount, 0);
  if (!Number.isFinite(parsed)) {
    return { amount: 0, rate: 1 };
  }
  if (from === to) {
    return { amount: parsed, rate: 1 };
  }

  const rateFrom = from === base ? 1 : rates[from];
  const rateTo = to === base ? 1 : rates[to];

  if (!rateFrom || !rateTo) {
    return { amount: parsed, rate: 1 };
  }

  const amountInBase = parsed / rateFrom;
  const converted = amountInBase * rateTo;
  const rate = converted / parsed;

  return { amount: converted, rate };
};

export const convertAmountToBase = async (amount, currency, baseCurrency) => {
  const ratesData = await getLatestRates();
  const result = convertAmount(amount, currency, baseCurrency, ratesData);
  return {
    amount: toDecimal(result.amount),
    rate: result.rate,
    base: normalizeCurrency(baseCurrency || ratesData.base),
    asOfDate: ratesData.asOfDate,
    source: ratesData.source,
  };
};

export const listSupportedCurrencies = () => SUPPORTED_CURRENCIES;
