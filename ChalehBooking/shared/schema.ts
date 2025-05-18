import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Booking schema for the chalet booking system
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingDate: date("booking_date").notNull(),
  period: text("period").notNull(), // 'morning', 'evening', or 'both'
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  amountPaid: integer("amount_paid").notNull(),
  amountRemaining: integer("amount_remaining").notNull(),
  peopleCount: integer("people_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const bookingResponseSchema = z.object({
  id: z.number(),
  bookingDate: z.string(), // ISO date string
  period: z.enum(['morning', 'evening', 'both']),
  customerName: z.string(),
  customerPhone: z.string(),
  amountPaid: z.number(),
  amountRemaining: z.number(),
  peopleCount: z.number(),
  createdAt: z.string().optional() // ISO date string
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type BookingResponse = z.infer<typeof bookingResponseSchema>;
