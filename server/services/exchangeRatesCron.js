import { CronJob } from 'cron';
import { updateRates, getLatestRates } from './exchangeRates.js';
import { RATES_CRON, RATES_ENABLED, RATES_TIMEZONE } from '../config/env.js';

export const startExchangeRatesCron = async () => {
  if (!RATES_ENABLED) {
    return null;
  }

  try {
    await updateRates();
  } catch (err) {
    console.warn('[Rates] Initial update failed:', err.message);
    try {
      await getLatestRates();
    } catch (innerErr) {
      console.warn('[Rates] Unable to load latest rates:', innerErr.message);
    }
  }

  const job = CronJob.from({
    cronTime: RATES_CRON,
    onTick: async () => {
      try {
        await updateRates();
        console.log('[Rates] Updated exchange rates');
      } catch (err) {
        console.error('[Rates] Update failed:', err.message);
      }
    },
    start: true,
    timeZone: RATES_TIMEZONE,
    waitForCompletion: true,
    name: 'exchange-rates',
  });

  return job;
};
