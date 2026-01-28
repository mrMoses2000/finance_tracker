export const toMonthStart = (monthStr) => {
  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth() + 1;

  if (monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    if (!Number.isNaN(y) && !Number.isNaN(m)) {
      year = y;
      month = m;
    }
  }

  return new Date(Date.UTC(year, month - 1, 1));
};

export const getMonthRange = (monthStart) => {
  const start = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1));
  const end = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
  return { start, end };
};

export const toMonthKey = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
