import { tasks, trips, matches } from '../db/schema';
import { sql, and, eq, notExists } from 'drizzle-orm';

/**
 * Interface for AI match result
 */
export interface MatchResult {
  taskId: string;
  tripId: string;
  matchScore: number;
  aiReasoning: string;
}

/**
 * Handler for matching tasks to a trip using Gemini (placeholder)
 * POST /match/trip/:tripId
 */
export async function matchTasksToTripHandler(db: any, tripId: string) {
  try {
    // 1. Fetch trip details
    const tripResults = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
    if (!tripResults.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Trip not found' }),
      };
    }
    const trip = tripResults[0];

    // 2. Fetch nearby pending tasks (using PostGIS for proximity)
    // For this prototype, we'll fetch all pending tasks that aren't already matched
    // In production, we'd use ST_DWithin or ST_Distance to limit the search area
    const pendingTasks = await db.select()
      .from(tasks)
      .where(and(
        eq(tasks.status, 'pending'),
        notExists(
          db.select().from(matches).where(eq(matches.taskId, tasks.id))
        )
      ));

    if (pendingTasks.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No pending tasks to match', matches: [] }),
      };
    }

    // 3. Simulated Gemini Logic for Matching
    // In a real implementation, we would send the trip's path and task locations
    // to Gemini and ask it to evaluate the best matches based on detour distance.
    const suggestedMatches = pendingTasks.map((task: any) => {
      // Mock score based on a simple logic for now
      const score = Math.random(); // Placeholder for actual proximity scoring
      return {
        taskId: task.id,
        tripId: trip.id,
        matchScore: parseFloat(score.toFixed(2)),
        aiReasoning: `Simulated Gemini analysis: Task ${task.type} is within efficient distance of the planned route for trip ${trip.id}.`,
        status: 'suggested'
      };
    });

    // 4. Filter matches (e.g., score > 0.7) and insert into database
    const highQualityMatches = suggestedMatches.filter((m: any) => m.matchScore > 0.6);

    if (highQualityMatches.length > 0) {
      await db.insert(matches).values(highQualityMatches);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Processed ${pendingTasks.length} tasks, found ${highQualityMatches.length} matches.`,
        matches: highQualityMatches,
      }),
    };
  } catch (error: any) {
    console.error('Error matching tasks to trip:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to run AI matching',
        error: error.message,
      }),
    };
  }
}

/**
 * Handler for listing matches for a trip or task
 * GET /matches?tripId=... or GET /matches?taskId=...
 */
export async function listMatchesHandler(db: any, filters: { tripId?: string; taskId?: string }) {
  try {
    let query = db.select().from(matches);

    if (filters.tripId) {
      query = query.where(eq(matches.tripId, filters.tripId));
    } else if (filters.taskId) {
      query = query.where(eq(matches.taskId, filters.taskId));
    }

    const results = await query;

    return {
      statusCode: 200,
      body: JSON.stringify({
        matches: results,
      }),
    };
  } catch (error: any) {
    console.error('Error listing matches:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to list matches',
        error: error.message,
      }),
    };
  }
}
