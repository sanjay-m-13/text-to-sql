import { streamText, tool } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

// Types for API response
interface ApiResponse {
  rowCount: number;
  rows: Record<string, unknown>[];
}

// Types for schema response
interface DatabaseColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface DatabaseTable {
  table_name: string;
  table_schema: string;
  columns: DatabaseColumn[];
}

interface SchemaRow {
  table_name: string;
  table_schema: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

// Function to get database schema from external API
async function getDatabaseSchema(): Promise<string> {

  try {

    const result = await getSchemaAPI();

    // Group by table
    const tables: Record<string, DatabaseTable> = {};
    result.rows.forEach((row: Record<string, unknown>) => {
      const schemaRow = row as unknown as SchemaRow;
      const key = `${schemaRow.table_schema}.${schemaRow.table_name}`;
      if (!tables[key]) {
        tables[key] = {
          table_name: schemaRow.table_name,
          table_schema: schemaRow.table_schema,
          columns: []
        };
      }
      tables[key].columns.push({
        column_name: schemaRow.column_name,
        data_type: schemaRow.data_type,
        is_nullable: schemaRow.is_nullable,
        column_default: schemaRow.column_default
      });
    });

    // Format schema for AI
    let schemaDescription = "Database Schema:\n\n";
    Object.values(tables).forEach((table: DatabaseTable) => {
      const fullTableName = table.table_schema === 'public' ? table.table_name : `${table.table_schema}.${table.table_name}`;
      schemaDescription += `Table: ${fullTableName}\n`;
      schemaDescription += "Columns:\n";
      table.columns.forEach((col: DatabaseColumn) => {
        const nullable = col.is_nullable === 'YES' ? ' (nullable)' : ' (not null)';
        const defaultVal = col.column_default ? ` default: ${col.column_default}` : '';
        schemaDescription += `  - ${col.column_name}: ${col.data_type}${nullable}${defaultVal}\n`;
      });
      schemaDescription += "\n";
    });

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

const getSchemaAPI = async ()=>{
  try {
    const response = await fetch("http://localhost:8080/schema", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching schema from API:', error);
    throw error;
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