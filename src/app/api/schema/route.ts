import { NextResponse } from "next/server"
import { getSchemaDetailsAPI } from "@/lib/api-utils"

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

interface SchemaRow {
  table_name: string;
  table_schema: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export async function GET() {
  try {
    // Fetch schema from external API
    const schemaData = await getSchemaDetailsAPI();

    // Transform the schema data to match our interface
    const tables: Record<string, TableInfo> = {};

    schemaData.rows.forEach((row: Record<string, unknown>) => {
      const schemaRow = row as unknown as SchemaRow;
      const key = `${schemaRow.table_schema}.${schemaRow.table_name}`;

      if (!tables[key]) {
        tables[key] = {
          schema: schemaRow.table_schema,
          name: schemaRow.table_name,
          type: "BASE TABLE",
          columns: [],
          foreignKeys: [],
        };
      }

      tables[key].columns.push({
        name: schemaRow.column_name,
        type: schemaRow.data_type,
        nullable: schemaRow.is_nullable === "YES",
        default: schemaRow.column_default,
        position: tables[key].columns.length + 1,
        isPrimaryKey: false, // You might need to enhance your API to provide this info
      });
    });

    const tableArray = Object.values(tables);

    return NextResponse.json({
      tables: tableArray,
      totalTables: tableArray.length,
    })
  } catch (error) {
    console.error("Error fetching schema:", error)

    // Fallback to static schema if API fails
    const fallbackTables: TableInfo[] = [
      {
        schema: "public",
        name: "products",
        type: "BASE TABLE",
        columns: [
          { name: "id", type: "integer", nullable: false, default: null, position: 1, isPrimaryKey: true },
          { name: "name", type: "varchar", nullable: false, default: null, position: 2, isPrimaryKey: false },
          { name: "price", type: "decimal", nullable: true, default: null, position: 3, isPrimaryKey: false },
          { name: "category", type: "varchar", nullable: true, default: null, position: 4, isPrimaryKey: false },
          { name: "created_at", type: "timestamp", nullable: true, default: "now()", position: 5, isPrimaryKey: false },
        ],
        foreignKeys: [],
      },
      {
        schema: "public",
        name: "customers",
        type: "BASE TABLE",
        columns: [
          { name: "id", type: "integer", nullable: false, default: null, position: 1, isPrimaryKey: true },
          { name: "name", type: "varchar", nullable: false, default: null, position: 2, isPrimaryKey: false },
          { name: "email", type: "varchar", nullable: true, default: null, position: 3, isPrimaryKey: false },
          { name: "phone", type: "varchar", nullable: true, default: null, position: 4, isPrimaryKey: false },
          { name: "created_at", type: "timestamp", nullable: true, default: "now()", position: 5, isPrimaryKey: false },
        ],
        foreignKeys: [],
      },
      {
        schema: "public",
        name: "orders",
        type: "BASE TABLE",
        columns: [
          { name: "id", type: "integer", nullable: false, default: null, position: 1, isPrimaryKey: true },
          { name: "customer_id", type: "integer", nullable: false, default: null, position: 2, isPrimaryKey: false },
          { name: "product_id", type: "integer", nullable: false, default: null, position: 3, isPrimaryKey: false },
          { name: "quantity", type: "integer", nullable: false, default: null, position: 4, isPrimaryKey: false },
          { name: "total_amount", type: "decimal", nullable: false, default: null, position: 5, isPrimaryKey: false },
          { name: "order_date", type: "timestamp", nullable: true, default: "now()", position: 6, isPrimaryKey: false },
        ],
        foreignKeys: [
          { column: "customer_id", referencedSchema: "public", referencedTable: "customers", referencedColumn: "id" },
          { column: "product_id", referencedSchema: "public", referencedTable: "products", referencedColumn: "id" },
        ],
      },
    ];

    return NextResponse.json({
      tables: fallbackTables,
      totalTables: fallbackTables.length,
    })
  }
}
