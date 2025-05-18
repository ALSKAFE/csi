import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import CalendarView from "@/components/CalendarView";
import BookingForm from "@/components/BookingForm";
import BookingDetails from "@/components/BookingDetails";
import type { BookingResponse } from '@shared/schema';
import { useLocation } from "wouter";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateBookings, setDateBookings] = useState<BookingResponse[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'evening' | 'both' | null>(null);
  const [, setLocation] = useLocation();
  
  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [setLocation]);
  
  // Handle day selection from the calendar
  const handleDaySelect = (date: Date, bookings: BookingResponse[]) => {
    setSelectedDate(date);
    setDateBookings(bookings);
    
    // Always show details for this day, even if there are no bookings
    setShowBookingDetails(true);
  };
  
  // Handle booking a specific period
  const handleBookPeriod = (period: 'morning' | 'evening' | 'both') => {
    setSelectedPeriod(period);
    setShowBookingDetails(false);
    setShowBookingForm(true);
  };
  
  // Handle edit booking
  const handleEditBooking = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setSelectedPeriod(booking.period as 'morning' | 'evening' | 'both');
    setShowBookingDetails(false);
    setShowBookingForm(true);
  };
  
  // Handle form close
  const handleFormClose = () => {
    setShowBookingForm(false);
    setSelectedBooking(null);
    setSelectedPeriod(null);
    if (selectedDate) {
      setShowBookingDetails(true);
    }
  };
  
  // Handle details close
  const handleDetailsClose = () => {
    setShowBookingDetails(false);
    setSelectedBooking(null);
    setSelectedDate(null);
  };
  
  return (
    <div className="bg-gray-100 min-h-screen font-cairo text-gray-800" dir="rtl">
      {/* Header Section */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600">تقويم حجز الشاليه</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Calendar Section */}
        <div className="mx-auto w-full max-w-full sm:max-w-3xl overflow-hidden">
          <CalendarView onDaySelect={handleDaySelect} />
        </div>
      </main>
      
      {/* Booking Form Modal */}
      <BookingForm 
        isOpen={showBookingForm} 
        onClose={handleFormClose} 
        selectedDate={selectedDate}
        editBooking={selectedBooking}
        existingBookings={dateBookings}
        initialPeriod={selectedPeriod}
      />
      
      {/* Booking Details Modal */}
      <BookingDetails 
        isOpen={showBookingDetails} 
        onClose={handleDetailsClose} 
        date={selectedDate}
        bookings={dateBookings}
        onEdit={handleEditBooking}
        onBookPeriod={handleBookPeriod}
      />
    </div>
  );
}
