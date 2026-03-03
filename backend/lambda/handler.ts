import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { z } from 'zod';

const dynamo = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

// Schema validation to prevent injection/mass assignment
const PlanSchema = z.object({
  destination: z.string().min(1).max(100),
  ecoMode: z.boolean().default(true),
  groupSize: z.number().int().positive().max(50).optional(),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, path, body, requestContext } = event;
    
    // Auth Check: Ensure user is authenticated via Cognito
    const userId = requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

    if (httpMethod === 'POST' && path === '/plans') {
      const result = PlanSchema.safeParse(JSON.parse(body || '{}'));
      if (!result.success) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid input', details: result.error.format() }) };
      }

      const id = Math.random().toString(36).substring(7);
      const plan = {
        id,
        ownerId: userId, // Record ownership
        ...result.data,
        createdAt: new Date().toISOString()
      };
      
      await dynamo.put({
        TableName: TABLE_NAME,
        Item: plan
      }).promise();

      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Plan created successfully', id }),
      };
    }

    if (httpMethod === 'GET' && path.startsWith('/plans/')) {
      const id = path.split('/')[2];
      const result = await dynamo.get({
        TableName: TABLE_NAME,
        Key: { id }
      }).promise();

      if (!result.Item) {
        return { statusCode: 404, body: JSON.stringify({ message: 'Plan not found' }) };
      }

      // Authorization: Only owner can view (for now)
      if (result.Item.ownerId !== userId) {
        return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
      }

      return { statusCode: 200, body: JSON.stringify(result.Item) };
    }

    return { statusCode: 404, body: JSON.stringify({ message: 'Route not found' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};
