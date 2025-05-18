import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ar } from 'date-fns/locale';

// Get an array of dates for a month including all days, marking past days
export function getCalendarDays(date: Date): { date: Date; isCurrentMonth: boolean; isPast: boolean }[] {
  // Get the start and end of the month
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all dates in the month
  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  });
  
  // Format the days into objects with date, isCurrentMonth flag, and isPast flag
  return daysInMonth.map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isPast: day.getTime() < today.getTime()
  }));
}

// Navigate to the previous month
export function getPreviousMonth(date: Date): Date {
  return addMonths(date, -1);
}

// Navigate to the next month
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

// Format a date to display the day number
export function formatDay(date: Date): string {
  return format(date, 'd');
}

// Format a date to display the month and year
export function formatMonthYear(date: Date): string {
  return `شهر ${date.getMonth() + 1} - ${date.getFullYear()}`;
}

// Format a date to ISO format (YYYY-MM-DD) for API calls
export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Format a date to a more readable format for display
export function formatDisplayDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return format(date, 'd MMMM yyyy', { locale: ar });
}

// Get the day names in Arabic
export function getArabicDayNames(): string[] {
  return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
}

// Calculate the number of empty cells needed at the start of the calendar
export function getLeadingEmptyCells(date: Date): number {
  // Get the first day of the month
  const firstDayOfMonth = startOfMonth(date);
  
  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  return firstDayOfMonth.getDay();
}
