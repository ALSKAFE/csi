import { formatDay } from '@/lib/utils/dateUtils';
import type { BookingResponse } from '@shared/schema';

interface CalendarCellProps {
  date: Date;
  bookings: BookingResponse[];
  onClick: (date: Date) => void;
  isPast?: boolean;
}

export default function CalendarCell({ date, bookings, onClick, isPast = false }: CalendarCellProps) {
  // Determine booking status and cell background color
  const hasBooking = bookings.length > 0;
  
  // Find morning and evening bookings
  const morningBooking = bookings.find(booking => booking.period === 'morning' || booking.period === 'both');
  const eveningBooking = bookings.find(booking => booking.period === 'evening' || booking.period === 'both');
  const bothBooking = bookings.find(booking => booking.period === 'both');
  
  const hasMorningBooking = !!morningBooking;
  const hasEveningBooking = !!eveningBooking;
  const hasFullDayBooking = hasMorningBooking && hasEveningBooking;
  
  // Determine background color based on booking status and if the date is in the past
  let bgColor = "bg-white";
  if (isPast) {
    bgColor = "bg-red-100"; // light red for past dates
  } else if (hasFullDayBooking || bothBooking) {
    bgColor = "bg-green-300"; // dark green for both periods
  } else if (hasMorningBooking || hasEveningBooking) {
    bgColor = "bg-green-100"; // light green for one period
  }
  
  // Just click the whole cell to see both periods, but only if not in the past
  const handleClick = () => {
    if (!isPast) {
      onClick(date);
    }
  };
  
  // Calculate today's date to highlight current day
  const today = new Date();
  const isToday = 
    date.getDate() === today.getDate() && 
    date.getMonth() === today.getMonth() && 
    date.getFullYear() === today.getFullYear();
  
  // Apply styles for today and past days
  let cellBorderClass = "border border-gray-200";
  let cursorClass = "cursor-pointer";
  
  if (isToday) {
    cellBorderClass = "border-2 border-blue-500";
  }
  
  if (isPast) {
    cursorClass = "cursor-not-allowed"; 
  }
  
  return (
    <div 
      className={`h-16 sm:h-20 md:h-24 p-1 ${bgColor} ${cellBorderClass} rounded-lg ${isPast ? "" : "hover:border-blue-300"} ${cursorClass} transition`}
      onClick={handleClick}
    >
      <div className={`text-right font-bold ${isToday ? 'text-blue-600' : ''}`}>
        {formatDay(date)}
      </div>
      
      {!hasBooking && !isPast && (
        <div className="text-center mt-1 sm:mt-2 text-xs text-gray-600">
          <span className="hidden sm:inline">متاح للحجز</span>
          <span className="sm:hidden">متاح</span>
        </div>
      )}
      
      {isPast && (
        <div className="text-center mt-1 sm:mt-2 text-xs text-red-600">
          <span className="hidden sm:inline">تاريخ سابق</span>
          <span className="sm:hidden">سابق</span>
        </div>
      )}
      
      {hasBooking && (
        <div className="flex flex-col items-center mt-1">
          {hasMorningBooking && (
            <div className="text-xs font-medium bg-white rounded px-1 py-1 mb-1 w-full text-center truncate">
              <i className="fas fa-sun text-amber-500 ml-1"></i>
              <span className="hidden sm:inline">محجوز (صباحي)</span>
              <span className="sm:hidden">صباحي</span>
            </div>
          )}
          
          {!hasMorningBooking && (
            <div className="text-xs text-gray-600 mb-1 truncate">
              <span className="hidden sm:inline">متاح (صباحي)</span>
              <span className="sm:hidden">ص ✓</span>
            </div>
          )}
          
          {hasEveningBooking && (
            <div className="text-xs font-medium bg-white rounded px-1 py-1 w-full text-center truncate">
              <i className="fas fa-moon text-indigo-500 ml-1"></i>
              <span className="hidden sm:inline">محجوز (مسائي)</span>
              <span className="sm:hidden">مسائي</span>
            </div>
          )}
          
          {!hasEveningBooking && (
            <div className="text-xs text-gray-600 truncate">
              <span className="hidden sm:inline">متاح (مسائي)</span>
              <span className="sm:hidden">م ✓</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
