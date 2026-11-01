// Toggle between mock data and real backend API
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// --- Types ---
export interface DashboardStats {
  total_workloads: number;
  active_databases: number;
  pending_recommendations: number;
  system_health: string;
  recent_alerts_count: number;
}

export interface SchemaColumn {
  name: string;
  type: string;
  key: string;
}

export interface SchemaTable {
  table_name: string;
  row_count: number;
  columns: SchemaColumn[];
}

export interface DatabaseSchema {
  database_name: string;
  tables: SchemaTable[];
}

export interface SQLWorkload {
  id: string;
  query_text: string;
  source: string;
  execution_count: number;
  avg_latency_ms: number;
  status: "Flagged" | "Optimized" | "Pending";
}

export interface SearchResult {
  workload_id: string;
  query_text: string;
  similarity_score: number;
  matched_tags: string[];
}

export interface Recommendation {
  rule_code: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  recommendation: string;
  rationale: string;
}

export interface ExplainStep {
  id: number;
  select_type: string;
  table: string;
  type: string;
  rows: number;
  extra: string;
}

export interface QueryDetails {
  id: string;
  query_text: string;
  recommendations: Recommendation[];
  explain_plan: ExplainStep[];
}

// --- Mock Data Store ---
const MOCK_STATS: DashboardStats = {
  total_workloads: 142,
  active_databases: 2,
  pending_recommendations: 18,
  system_health: "Healthy",
  recent_alerts_count: 3,
};

const MOCK_SCHEMAS: DatabaseSchema[] = [
  {
    database_name: "idop_demo_db",
    tables: [
      {
        table_name: "customers",
        row_count: 1250,
        columns: [
          { name: "customer_id", type: "INT", key: "PRI" },
          { name: "email", type: "VARCHAR(255)", key: "UNI" },
          { name: "created_at", type: "TIMESTAMP", key: "" },
        ],
      },
      {
        table_name: "orders",
        row_count: 8430,
        columns: [
          { name: "order_id", type: "INT", key: "PRI" },
          { name: "customer_id", type: "INT", key: "MUL" },
          { name: "total_amount", type: "DECIMAL(10,2)", key: "" },
        ],
      },
    ],
  },
  {
    database_name: "idop_platform_db",
    tables: [
      {
        table_name: "query_workloads",
        row_count: 142,
        columns: [
          { name: "workload_id", type: "VARCHAR(64)", key: "PRI" },
          { name: "query_text", type: "TEXT", key: "" },
        ],
      },
    ],
  },
];

const MOCK_WORKLOADS: SQLWorkload[] = [
  {
    id: "wl_001",
    query_text: "SELECT * FROM orders WHERE customer_id = 1",
    source: "E-commerce App",
    execution_count: 450,
    avg_latency_ms: 42.5,
    status: "Flagged",
  },
  {
    id: "wl_002",
    query_text: "SELECT o.order_id, c.email FROM orders o JOIN customers c ON o.customer_id = c.customer_id",
    source: "Analytics Service",
    execution_count: 1200,
    avg_latency_ms: 12.3,
    status: "Optimized",
  },
];

const MOCK_QUERY_DETAILS: Record<string, QueryDetails> = {
  wl_001: {
    id: "wl_001",
    query_text: "SELECT * FROM orders WHERE customer_id = 1",
    recommendations: [
      {
        rule_code: "SELECT_STAR",
        severity: "MEDIUM",
        recommendation: "Avoid SELECT *; specify only required columns.",
        rationale: "Reduces memory overhead and network payload size.",
      },
      {
        rule_code: "FILTER_REVIEW",
        severity: "HIGH",
        recommendation: "Verify index support for column 'customer_id'.",
        rationale: "Unindexed filter columns cause full table scans.",
      },
    ],
    explain_plan: [
      { id: 1, select_type: "SIMPLE", table: "orders", type: "ALL", rows: 8430, extra: "Using where" },
    ],
  },
};

// --- API Client Functions ---
export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) return MOCK_STATS;
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
  return res.json();
}

export async function getDatabaseSchemas(): Promise<DatabaseSchema[]> {
  if (USE_MOCK) return MOCK_SCHEMAS;
  const res = await fetch(`${API_BASE_URL}/schemas`);
  return res.json();
}

export async function getWorkloads(): Promise<SQLWorkload[]> {
  if (USE_MOCK) return MOCK_WORKLOADS;
  const res = await fetch(`${API_BASE_URL}/workloads`);
  return res.json();
}

export async function searchWorkloads(query: string): Promise<SearchResult[]> {
  if (USE_MOCK) {
    return MOCK_WORKLOADS.map((wl) => ({
      workload_id: wl.id,
      query_text: wl.query_text,
      similarity_score: 0.92,
      matched_tags: ["orders", "customer"],
    }));
  }
  const res = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return data.results;
}

export async function getQueryDetails(id: string): Promise<QueryDetails> {
  if (USE_MOCK) {
    return MOCK_QUERY_DETAILS[id] || {
      id,
      query_text: "SELECT * FROM sample_table",
      recommendations: [],
      explain_plan: [],
    };
  }
  const res = await fetch(`${API_BASE_URL}/queries/${id}`);
  return res.json();
}