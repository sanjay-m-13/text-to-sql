import { NextResponse } from "next/server"

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

export async function GET() {
  try {
    // Static schema definition - update this based on your actual database structure
    const tables: TableInfo[] = [
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
      tables,
      totalTables: tables.length,
    })
  } catch (error) {
    console.error("Error fetching schema:", error)
    return NextResponse.json({ error: "Failed to fetch database schema" }, { status: 500 })
  }
}
