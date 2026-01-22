import {
  Activity,
  Briefcase,
  Car,
  Coffee,
  CreditCard,
  Heart,
  Home,
  Landmark,
  MapPin,
  Monitor,
  PiggyBank,
  Scissors,
  User,
  Utensils,
  Wallet,
  Wifi,
} from 'lucide-react';

const ICON_RULES = [
  { match: ['жиль', 'rent', 'дом'], icon: Home },
  { match: ['связ', 'интернет', 'wifi', 'net'], icon: Wifi },
  { match: ['кредит', 'loan', 'bank'], icon: CreditCard },
  { match: ['долг', 'debt'], icon: User },
  { match: ['налог', 'сервис', 'tax', 'sub'], icon: Monitor },
  { match: ['еда', 'food', 'продукт', 'кухн'], icon: Utensils },
  { match: ['транспорт', 'car', 'такси'], icon: Car },
  { match: ['мед', 'health'], icon: Activity },
  { match: ['гигиен', 'стри', 'hair'], icon: Scissors },
  { match: ['кофе', 'cafe', 'досуг'], icon: Coffee },
  { match: ['помощ', 'благотвор', 'charity'], icon: Heart },
  { match: ['поезд', 'trip', 'travel', 'алмат'], icon: MapPin },
  { match: ['конфер', 'work', 'freelance', 'фрил'], icon: Briefcase },
  { match: ['зарплат', 'salary', 'income'], icon: Wallet },
  { match: ['kaspi', 'sber', 't-bank'], icon: Landmark },
  { match: ['накоп', 'saving'], icon: PiggyBank },
];

export const getCategoryIcon = (label, type) => {
  if (type === 'income') return Wallet;
  if (!label) return Wallet;
  const lower = label.toLowerCase();
  const match = ICON_RULES.find((rule) => rule.match.some((token) => lower.includes(token)));
  return match ? match.icon : Wallet;
};
