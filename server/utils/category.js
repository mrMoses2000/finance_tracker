import { CATEGORY_COLORS } from '../data/defaultCategories.js';

export const pickCategoryColor = (existingColors = []) => {
  const available = CATEGORY_COLORS.filter((color) => !existingColors.includes(color));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)] || '#10b981';
};
