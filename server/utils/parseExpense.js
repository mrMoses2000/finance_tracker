export const CATEGORY_KEYWORDS = {
  housing: ['\u0430\u0440\u0435\u043d\u0434\u0430', '\u043a\u0432\u0430\u0440\u0442\u0438\u0440\u0430', '\u0436\u0438\u043b\u044c\u0435', '\u0441\u0432\u044f\u0437\u044c', '\u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442', 'rent', 'apartment', 'housing', 'utilities', 'internet'],
  transport: ['\u0442\u0430\u043a\u0441\u0438', '\u0431\u0435\u043d\u0437\u0438\u043d', '\u043f\u0440\u043e\u0435\u0437\u0434', '\u0442\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442', '\u043c\u0435\u0442\u0440\u043e', '\u0430\u0432\u0442\u043e\u0431\u0443\u0441', 'taxi', 'gas', 'fuel', 'transport', 'bus', 'metro'],
  food: ['\u0435\u0434\u0430', '\u043f\u0440\u043e\u0434\u0443\u043a\u0442\u044b', '\u043e\u0431\u0435\u0434', '\u0443\u0436\u0438\u043d', '\u0437\u0430\u0432\u0442\u0440\u0430\u043a', '\u043a\u043e\u0444\u0435', '\u0440\u0435\u0441\u0442\u043e\u0440\u0430\u043d', 'food', 'groceries', 'lunch', 'dinner', 'breakfast', 'coffee', 'restaurant'],
  entertainment: ['\u0440\u0430\u0437\u0432\u043b\u0435\u0447\u0435\u043d\u0438\u044f', '\u043a\u0438\u043d\u043e', '\u0438\u0433\u0440\u044b', 'netflix', 'spotify', 'entertainment', 'movies', 'games'],
  health: ['\u0437\u0434\u043e\u0440\u043e\u0432\u044c\u0435', '\u0430\u043f\u0442\u0435\u043a\u0430', '\u0432\u0440\u0430\u0447', '\u043b\u0435\u043a\u0430\u0440\u0441\u0442\u0432\u0430', '\u043c\u0435\u0434\u0438\u0446\u0438\u043d\u0430', 'health', 'pharmacy', 'doctor', 'medicine'],
  subscriptions: ['\u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0430', '\u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438', '\u0441\u0435\u0440\u0432\u0438\u0441', 'subscription', 'service'],
  shopping: ['\u043f\u043e\u043a\u0443\u043f\u043a\u0438', '\u043e\u0434\u0435\u0436\u0434\u0430', '\u043c\u0430\u0433\u0430\u0437\u0438\u043d', 'shopping', 'clothes', 'store'],
  salary: ['\u0437\u0430\u0440\u043f\u043b\u0430\u0442\u0430', '\u0437\u043f', 'salary', 'paycheck', 'wage'],
  freelance: ['\u0444\u0440\u0438\u043b\u0430\u043d\u0441', '\u0437\u0430\u043a\u0430\u0437', '\u043f\u0440\u043e\u0435\u043a\u0442', 'freelance', 'project', 'gig'],
};

const amountPatterns = [
  { regex: /([0-9]{1,3}(?:[\s,][0-9]{3})+)/, multiplier: 1 },
  { regex: /(\d+(?:[\.,]\d+)?)[k\u043a]/i, multiplier: 1000 },
  { regex: /(\d+(?:[\.,]\d+)?)/, multiplier: 1 },
];

const parseAmount = (text) => {
  for (const { regex, multiplier } of amountPatterns) {
    const match = text.match(regex);
    if (!match) continue;

    let value = match[1].replace(/[\s,]/g, '').replace(',', '.');
    let amount = Number.parseFloat(value);

    if (!Number.isFinite(amount)) continue;

    amount *= multiplier;

    if (amount > 0) {
      return amount;
    }
  }

  return null;
};

const extractDescription = (text) => {
  return text
    .replace(/[0-9]{1,3}(?:[\s,][0-9]{3})+/g, '')
    .replace(/\d+(?:[\.,]\d+)?[k\u043a]?/gi, '')
    .replace(/\u043f\u043e\u0442\u0440\u0430\u0442\u0438\u043b|\u043a\u0443\u043f\u0438\u043b|\u0437\u0430\u043f\u043b\u0430\u0442\u0438\u043b|\u043e\u043f\u043b\u0430\u0442\u0438\u043b|\u043f\u043e\u043b\u0443\u0447\u0438\u043b|\u043d\u0430|\u0437\u0430|spent|bought|paid|for|on/gi, '')
    .trim()
    .replace(/\s+/g, ' ')
    .trim();
};

export const parseExpenseText = (text) => {
  const amount = parseAmount(text);

  const lowerText = text.toLowerCase();
  const incomeKeywords = ['\u043f\u043e\u043b\u0443\u0447\u0438\u043b', '\u0437\u0430\u0440\u043f\u043b\u0430\u0442\u0430', '\u0434\u043e\u0445\u043e\u0434', '\u0437\u0430\u0440\u0430\u0431\u043e\u0442\u0430\u043b', '\u043f\u0440\u0438\u0448\u043b\u043e', 'received', 'earned', 'income', 'salary'];

  let type = 'expense';
  if (incomeKeywords.some((kw) => lowerText.includes(kw))) {
    type = 'income';
  }

  let matchedCategory = null;
  let maxMatches = 0;
  for (const [categoryKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter((kw) => lowerText.includes(kw.toLowerCase())).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      matchedCategory = categoryKey;
    }
  }

  let description = extractDescription(text);
  if (!description || description.length < 2) {
    description = matchedCategory || 'Expense';
  }

  return {
    amount,
    type,
    categoryKey: matchedCategory,
    description: description.charAt(0).toUpperCase() + description.slice(1),
  };
};
