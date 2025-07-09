import { streamText, tool } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

// Types for API response
interface ApiResponse {
  rowCount: number;
  rows: Record<string, unknown>[];
}

// Function to get database schema from external API
async function getDatabaseSchema(): Promise<string> {
  try {
    // You can either hardcode the schema or fetch it from your API
    // For now, I'll provide a basic schema - you can update this based on your actual database
    const schemaDescription = `Database Schema:

Table: products
Columns:
  - id: integer (not null)
  - name: varchar (not null)
  - price: decimal (nullable)
  - category: varchar (nullable)
  - created_at: timestamp (nullable)

Table: customers
Columns:
  - id: integer (not null)
  - name: varchar (not null)
  - email: varchar (nullable)
  - phone: varchar (nullable)
  - created_at: timestamp (nullable)

Table: orders
Columns:
  - id: integer (not null)
  - customer_id: integer (not null)
  - product_id: integer (not null)
  - quantity: integer (not null)
  - total_amount: decimal (not null)
  - order_date: timestamp (nullable)

`;

    return schemaDescription;
  } catch (error) {
    console.error('Error getting database schema:', error);
    return "Database schema not available";
  }
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    // Get database schema
    const databaseSchema = await getDatabaseSchema();

    const result = await streamText({
      model: groq('llama3-70b-8192'),
      messages,
      system: `You are a PostgreSQL expert assistant. Help users convert natural language queries to SQL and execute them.

${databaseSchema}

Guidelines:
- Only generate SELECT queries for data retrieval
- Use proper PostgreSQL syntax
- Include appropriate WHERE clauses, JOINs, and ORDER BY when needed
- Limit results to reasonable amounts (use LIMIT)
- Always explain what the query does
- Use the executeQuery tool to run queries and show results`,
      tools: {
        executeQuery: tool({
          description: 'Execute a PostgreSQL SELECT query and return both the SQL and results',
          parameters: z.object({
            sql: z.string().describe('The SQL SELECT query to execute'),
            explanation: z.string().describe('Explanation of what the query does'),
            summary: z.string().describe('Summary of the results').optional()
          }),
          execute: async ({ sql, explanation, summary }) => {
            try {
              // Safety check - only allow SELECT queries
              if (!sql.trim().toLowerCase().startsWith('select')) {
                return {
                  success: false,
                  sql,
                  explanation,
                  error: 'Only SELECT queries are allowed'
                };
              }

              const queryResult: ApiResponse = await getDBDataFromQuery(sql);
              return {
                success: true,
                sql,
                explanation,
                summary,
                data: queryResult.rows,
                rowCount: queryResult.rowCount
              };
            } catch (error) {
              return {
                success: false,
                sql,
                explanation,
                error: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          }
        })
      }
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response('Error processing request', { status: 500 });
  }
}

const getDBDataFromQuery = async (payload: string): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost:8080/run-sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: payload
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    console.log("data", data);
    return data;

  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw error;
  }
}