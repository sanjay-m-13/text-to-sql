import { streamText, tool } from 'ai';
import { groq } from '@ai-sdk/groq';
import { Pool } from 'pg';
import { z } from 'zod';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Types for database schema
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

// Function to get database schema
async function getDatabaseSchema(): Promise<string> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        t.table_name,
        t.table_schema,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
        AND t.table_schema = c.table_schema
      WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_schema, t.table_name, c.ordinal_position
    `;

    const result = await client.query(query);

    // Group by table
    const tables: Record<string, DatabaseTable> = {};
    result.rows.forEach((row: SchemaRow) => {
      const key = `${row.table_schema}.${row.table_name}`;
      if (!tables[key]) {
        tables[key] = {
          table_name: row.table_name,
          table_schema: row.table_schema,
          columns: []
        };
      }
      tables[key].columns.push({
        column_name: row.column_name,
        data_type: row.data_type,
        is_nullable: row.is_nullable,
        column_default: row.column_default
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
  } finally {
    client.release();
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
            explanation: z.string().describe('Explanation of what the query does')
          }),
          execute: async ({ sql, explanation }) => {
            try {
              // Safety check - only allow SELECT queries
              const trimmedSql = sql.trim().toLowerCase();
              if (!trimmedSql.startsWith('select')) {
                throw new Error('Only SELECT queries are allowed for security reasons');
              }

              // Execute the query
              const client = await pool.connect();
              try {
                const queryResult = await client.query(sql);
                return {
                  success: true,
                  sql,
                  explanation,
                  data: queryResult.rows,
                  rowCount: queryResult.rowCount,
                  columns: queryResult.fields?.map(field => ({
                    name: field.name,
                    dataType: field.dataTypeID
                  })) || []
                };
              } finally {
                client.release();
              }
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
