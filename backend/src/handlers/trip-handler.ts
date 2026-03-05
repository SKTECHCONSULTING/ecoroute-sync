import { trips } from '../db/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * Interface for trip input
 */
export interface CreateTripInput {
  driverId: string;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  departureTime: string; // ISO string
  availableCapacity: number;
  plannedPath?: string; // TBD: LineString or array of points
}

/**
 * Handler for creating a new trip
 * POST /trips
 */
export async function createTripHandler(db: any, input: CreateTripInput) {
  try {
    const { driverId, startLocation, endLocation, departureTime, availableCapacity, plannedPath } = input;

    // Convert lat/lng to WKT (Well-Known Text) for PostGIS
    const startWkt = `SRID=4326;POINT(${startLocation.lng} ${startLocation.lat})`;
    const endWkt = `SRID=4326;POINT(${endLocation.lng} ${endLocation.lat})`;

    // Insert trip into database
    const results = await db.insert(trips).values({
      driverId,
      startLocation: sql`ST_GeomFromEWKT(${startWkt})`,
      endLocation: sql`ST_GeomFromEWKT(${endWkt})`,
      departureTime: new Date(departureTime),
      availableCapacity,
      plannedPath,
    }).returning();

    const newTrip = results[0];

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Trip created successfully',
        trip: newTrip,
      }),
    };
  } catch (error: any) {
    console.error('Error creating trip:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to create trip',
        error: error.message,
      }),
    };
  }
}

/**
 * Handler for listing trips
 * GET /trips
 */
export async function listTripsHandler(db: any, driverId?: string) {
  try {
    let query = db.select().from(trips);

    if (driverId) {
      query = query.where(eq(trips.driverId, driverId));
    }

    const results = await query;

    return {
      statusCode: 200,
      body: JSON.stringify({
        trips: results,
      }),
    };
  } catch (error: any) {
    console.error('Error listing trips:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to list trips',
        error: error.message,
      }),
    };
  }
}
