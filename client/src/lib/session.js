const SESSION_KEYS = [
  'token',
  'user',
  'base_currency',
  'app_currency',
  'base_currency_confirmed',
  'budget_month',
  'dashboard_view',
];

export const getToken = () => localStorage.getItem('token');

export const isAuthenticated = () => Boolean(getToken());

export const clearSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const clearSessionAndRedirect = () => {
  clearSession();
  window.location.assign('/login');
};
