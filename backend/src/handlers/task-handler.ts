import { tasks } from '../db/schema';
import { sql } from 'drizzle-orm';

/**
 * Interface for task input
 */
export interface CreateTaskInput {
  requesterId: string;
  type: 'pickup' | 'drop-off';
  location: { lat: number; lng: number };
  description?: string;
}

/**
 * Handler for creating a new logistics task
 * POST /tasks
 */
export async function createTaskHandler(db: any, input: CreateTaskInput) {
  try {
    const { requesterId, type, location, description } = input;

    // Convert lat/lng to WKT (Well-Known Text) for PostGIS
    const locationWkt = `SRID=4326;POINT(${location.lng} ${location.lat})`;

    // Insert task into database
    const results = await db.insert(tasks).values({
      requesterId,
      type,
      location: sql`ST_GeomFromEWKT(${locationWkt})`,
      description,
      status: 'pending',
    }).returning();

    const newTask = results[0];

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Task created successfully',
        task: newTask,
      }),
    };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to create task',
        error: error.message,
      }),
    };
  }
}
