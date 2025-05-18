import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getCalendarDays, 
  formatMonthYear, 
  getPreviousMonth, 
  getNextMonth, 
  getArabicDayNames,
  getLeadingEmptyCells
} from '@/lib/utils/dateUtils';
import CalendarCell from './CalendarCell';
import { BookingResponse } from '@shared/schema';
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  onDaySelect: (date: Date, bookings: BookingResponse[]) => void;
}

export default function CalendarView({ onDaySelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  
  // Day names in Arabic
  const dayNames = getArabicDayNames();
  
  // Calculate calendar days for the current month
  const calendarDays = getCalendarDays(currentMonth);
  
  // Calculate leading empty cells for the month grid
  const leadingEmptyCells = getLeadingEmptyCells(currentMonth);
  
  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery<BookingResponse[]>({
    queryKey: ['/api/bookings'],
  });
  
  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.bookingDate === dateString);
  };
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    const dateBookings = getBookingsForDate(date);
    onDaySelect(date, dateBookings);
  };

  // Prefetch next month's data when the current month changes
  useEffect(() => {
    // We don't need to prefetch as we're fetching all bookings in one go
    // In a real-world scenario with a larger dataset, this would be implemented
  }, [currentMonth, queryClient]);

  return (
    <div className="bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-5 mb-6 sm:mb-10">
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => setCurrentMonth(getPreviousMonth(currentMonth))}
          variant="outline"
          size="icon"
          className="p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition"
        >
          <i className="fas fa-chevron-right"></i>
        </Button>
        <h2 className="text-xl font-bold">{formatMonthYear(currentMonth)}</h2>
        <Button
          onClick={() => setCurrentMonth(getNextMonth(currentMonth))}
          variant="outline"
          size="icon"
          className="p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition"
        >
          <i className="fas fa-chevron-left"></i>
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 mb-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-white border border-gray-200 ml-1"></div>
          <span>متاح</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-100 border border-gray-200 ml-1"></div>
          <span>فترة واحدة</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-green-300 border border-gray-200 ml-1"></div>
          <span>الفترتين</span>
        </div>
      </div>

      {/* Calendar Days of Week Header */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center font-medium text-gray-500 text-xs sm:text-sm py-1 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Responsive for mobile */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 max-w-full overflow-x-auto">
        {/* Leading empty cells based on day of week - only for current days */}
        {calendarDays.length > 0 && Array.from({ length: leadingEmptyCells }).map((_, index) => {
          // Only show leading empty cells for the current month's first day
          const firstDayInCalendar = calendarDays[0].date;
          const firstDayIsMonthStart = firstDayInCalendar.getDate() === 1;
          
          return firstDayIsMonthStart ? (
            <div key={`empty-${index}`} className="h-16 sm:h-20 md:h-24 p-1 bg-gray-50 rounded-lg opacity-50"></div>
          ) : null;
        }).filter(Boolean)}
        
        {/* Calendar days */}
        {calendarDays.map((dayInfo, index) => {
          const dateBookings = getBookingsForDate(dayInfo.date);
          return (
            <CalendarCell
              key={`day-${index}`}
              date={dayInfo.date}
              bookings={dateBookings}
              onClick={handleDayClick}
              isPast={dayInfo.isPast}
            />
          );
        })}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
