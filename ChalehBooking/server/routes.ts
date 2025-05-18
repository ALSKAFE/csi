import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, bookingResponseSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for bookings
  
  // Get all bookings
  app.get("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getAllBookings();
      
      // Convert dates to ISO strings for JSON serialization
      const formattedBookings = bookings.map(booking => ({
        ...booking,
        bookingDate: booking.bookingDate instanceof Date ? 
          booking.bookingDate.toISOString().split('T')[0] : booking.bookingDate,
        createdAt: booking.createdAt instanceof Date ? 
          booking.createdAt.toISOString() : booking.createdAt
      }));
      
      res.json(formattedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get bookings by date
  app.get("/api/bookings/date/:date", async (req: Request, res: Response) => {
    try {
      const dateParam = req.params.date;
      const date = new Date(dateParam);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const bookings = await storage.getBookingsByDate(date);
      
      // Convert dates to ISO strings for JSON serialization
      const formattedBookings = bookings.map(booking => ({
        ...booking,
        bookingDate: booking.bookingDate instanceof Date ? 
          booking.bookingDate.toISOString().split('T')[0] : booking.bookingDate,
        createdAt: booking.createdAt instanceof Date ? 
          booking.createdAt.toISOString() : booking.createdAt
      }));
      
      res.json(formattedBookings);
    } catch (error) {
      console.error("Error fetching bookings by date:", error);
      res.status(500).json({ message: "Failed to fetch bookings by date" });
    }
  });

  // Get a single booking by ID
  app.get("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Convert dates to ISO strings for JSON serialization
      const formattedBooking = {
        ...booking,
        bookingDate: booking.bookingDate instanceof Date ? 
          booking.bookingDate.toISOString().split('T')[0] : booking.bookingDate,
        createdAt: booking.createdAt instanceof Date ? 
          booking.createdAt.toISOString() : booking.createdAt
      };
      
      res.json(formattedBooking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = insertBookingSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: validationError.details 
        });
      }
      
      // Get date string from request - storage will handle conversion
      const bookingData = {
        ...result.data
      };
      
      // Check if there are conflicting bookings for the same date and period
      const bookingDate = new Date(result.data.bookingDate);
      const existingBookings = await storage.getBookingsByDate(bookingDate);
      
      // Check for conflicts
      const hasConflict = existingBookings.some(existing => {
        // If booking for both periods, it conflicts with any other booking
        if (existing.period === 'both' || bookingData.period === 'both') {
          return true;
        }
        
        // If existing and new booking are for the same period
        return existing.period === bookingData.period;
      });
      
      if (hasConflict) {
        return res.status(409).json({ message: "There's already a booking for this date and period" });
      }
      
      // Create the booking
      const newBooking = await storage.createBooking(bookingData);
      
      // Format for response
      const response = {
        ...newBooking,
        bookingDate: typeof newBooking.bookingDate === 'object' ? 
          newBooking.bookingDate.toISOString().split('T')[0] : newBooking.bookingDate,
        createdAt: typeof newBooking.createdAt === 'object' ? 
          newBooking.createdAt.toISOString() : newBooking.createdAt
      };
      
      // Validate response format
      const validatedResponse = bookingResponseSchema.parse(response);
      
      res.status(201).json(validatedResponse);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Update a booking
  app.patch("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      // Get existing booking
      const existingBooking = await storage.getBooking(id);
      
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Partial validation
      const updateData = req.body;
      
      // If bookingDate or period changed, check for conflicts
      if (updateData.bookingDate || updateData.period) {
        const bookingDate = updateData.bookingDate ? 
          new Date(updateData.bookingDate) : existingBooking.bookingDate;
        const period = updateData.period || existingBooking.period;
        
        // Get bookings for this date
        const dateBookings = await storage.getBookingsByDate(bookingDate);
        
        // Check for conflicts excluding the current booking
        const hasConflict = dateBookings.some(booking => {
          if (booking.id === id) return false; // Skip current booking
          
          // If booking for both periods, it conflicts with any other booking
          if (booking.period === 'both' || period === 'both') {
            return true;
          }
          
          // If existing and new booking are for the same period
          return booking.period === period;
        });
        
        if (hasConflict) {
          return res.status(409).json({ message: "There's already a booking for this date and period" });
        }
        
        // Convert bookingDate to Date if it's being updated
        if (updateData.bookingDate) {
          updateData.bookingDate = bookingDate;
        }
      }
      
      // Update the booking
      const updatedBooking = await storage.updateBooking(id, updateData);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Format for response
      const response = {
        ...updatedBooking,
        bookingDate: typeof updatedBooking.bookingDate === 'object' ? 
          updatedBooking.bookingDate.toISOString().split('T')[0] : updatedBooking.bookingDate,
        createdAt: typeof updatedBooking.createdAt === 'object' ? 
          updatedBooking.createdAt.toISOString() : updatedBooking.createdAt
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Delete a booking
  app.delete("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      const success = await storage.deleteBooking(id);
      
      if (!success) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
