import { sql } from 'drizzle-orm';
import { pgTable, uuid, varchar, timestamp, text, integer, doublePrecision, customType } from 'drizzle-orm/pg-core';

// Helper for PostGIS Geometry type in Drizzle
const geometry = customType<{ data: string; driverData: string }>({
	dataType() {
		return 'geometry(Point, 4326)';
	},
});

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  cognitoSub: varchar('cognito_sub', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tasks Table
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  requesterId: uuid('requester_id', { mode: 'string' }).references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // 'pickup' | 'drop-off'
  location: geometry('location').notNull(), // Point(4326)
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Trips Table
export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  driverId: uuid('driver_id', { mode: 'string' }).references(() => users.id),
  startLocation: geometry('start_location').notNull(),
  endLocation: geometry('end_location').notNull(),
  plannedPath: text('planned_path'), // Could also be a custom geometry(LineString, 4326) type
  departureTime: timestamp('departure_time').notNull(),
  availableCapacity: integer('available_capacity').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Matches Table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  taskId: uuid('task_id', { mode: 'string' }).references(() => tasks.id),
  tripId: uuid('trip_id', { mode: 'string' }).references(() => trips.id),
  matchScore: doublePrecision('match_score'),
  aiReasoning: text('ai_reasoning'),
  status: varchar('status', { length: 50 }).default('suggested'),
  createdAt: timestamp('created_at').defaultNow(),
});
