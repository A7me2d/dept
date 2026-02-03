export const EXPENSE_CATEGORIES_AR = [
  'طعام',
  'مواصلات',
  'تسوق',
  'فواتير',
  'صحة',
  'تعليم',
  'ترفيه',
  'منزل',
  'هدايا',
  'أخرى'
] as const;

export type ExpenseCategoryAr = (typeof EXPENSE_CATEGORIES_AR)[number];
