import { users, type User, type InsertUser, bookings, type Booking, type InsertBooking } from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";

// Extend the interface with CRUD methods for bookings
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Booking methods
  getAllBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByDate(date: Date): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async getBookingsByDate(date: Date): Promise<Booking[]> {
    const dateStr = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    
    // In PostgreSQL, we can query the date part directly
    const result = await db.select().from(bookings).where(
      sql`CAST(${bookings.bookingDate} AS TEXT) = ${dateStr}`
    );
    
    return result;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const bookingData = {
      ...insertBooking,
      createdAt: new Date()
    };
    
    const result = await db.insert(bookings).values(bookingData).returning();
    return result[0];
  }

  async updateBooking(id: number, bookingUpdate: Partial<InsertBooking>): Promise<Booking | undefined> {
    const result = await db
      .update(bookings)
      .set(bookingUpdate)
      .where(eq(bookings.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
