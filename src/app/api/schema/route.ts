import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export async function GET() {
  try {
    const client = await pool.connect()

    try {
      // Get detailed schema information
      const schemaQuery = `
        SELECT 
          t.table_schema,
          t.table_name,
          t.table_type,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          c.ordinal_position,
          CASE 
            WHEN pk.column_name IS NOT NULL THEN true 
            ELSE false 
          END as is_primary_key
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name 
          AND t.table_schema = c.table_schema
        LEFT JOIN (
          SELECT ku.table_name, ku.column_name, ku.table_schema
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku 
            ON tc.constraint_name = ku.constraint_name
            AND tc.table_schema = ku.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk ON c.table_name = pk.table_name 
          AND c.column_name = pk.column_name 
          AND c.table_schema = pk.table_schema
        WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
          AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_schema, t.table_name, c.ordinal_position
      `

      const foreignKeysQuery = `
        SELECT
          kcu.table_schema,
          kcu.table_name,
          kcu.column_name,
          ccu.table_schema AS referenced_schema,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
      `

      const [schemaResult, foreignKeysResult] = await Promise.all([
        client.query(schemaQuery),
        client.query(foreignKeysQuery),
      ])

      // Process the results
      interface TableInfo {
        schema: string;
        name: string;
        type: string;
        columns: Array<{
          name: string;
          type: string;
          nullable: boolean;
          default: string | null;
          position: number;
          isPrimaryKey: boolean;
        }>;
        foreignKeys: Array<{
          column: string;
          referencedSchema: string;
          referencedTable: string;
          referencedColumn: string;
        }>;
      }

      const tables: Record<string, TableInfo> = {}

      schemaResult.rows.forEach((row: {
        table_schema: string;
        table_name: string;
        table_type: string;
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
        ordinal_position: number;
        is_primary_key: boolean;
      }) => {
        const key = `${row.table_schema}.${row.table_name}`
        if (!tables[key]) {
          tables[key] = {
            schema: row.table_schema,
            name: row.table_name,
            type: row.table_type,
            columns: [],
            foreignKeys: [],
          }
        }
        tables[key].columns.push({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === "YES",
          default: row.column_default,
          position: row.ordinal_position,
          isPrimaryKey: row.is_primary_key,
        })
      })

      // Add foreign keys
      foreignKeysResult.rows.forEach((row: {
        table_schema: string;
        table_name: string;
        column_name: string;
        referenced_schema: string;
        referenced_table: string;
        referenced_column: string;
      }) => {
        const key = `${row.table_schema}.${row.table_name}`
        if (tables[key]) {
          tables[key].foreignKeys.push({
            column: row.column_name,
            referencedSchema: row.referenced_schema,
            referencedTable: row.referenced_table,
            referencedColumn: row.referenced_column,
          })
        }
      })

      return NextResponse.json({
        tables: Object.values(tables),
        totalTables: Object.keys(tables).length,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error fetching schema:", error)
    return NextResponse.json({ error: "Failed to fetch database schema" }, { status: 500 })
  }
}
