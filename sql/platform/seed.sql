
-- Intelligent Database Discovery and Optimization Platform
-- Platform seed data
-- Workload examples are illustrative; metrics are not fabricated.

USE idop_platform_db;

-- 1. Register the demo database being analysed.
INSERT INTO data_sources
    (source_id, source_name, db_type, host_name, database_name, description)
VALUES
    (1, 'E-commerce Demo', 'MYSQL', 'localhost', 'idop_demo_db',
     'Local fictional e-commerce database used for discovery and optimization demos.')
ON DUPLICATE KEY UPDATE
    db_type = VALUES(db_type),
    host_name = VALUES(host_name),
    description = VALUES(description);

-- 2. Record discovered tables from the demo database.
INSERT INTO schema_objects
    (object_id, source_id, schema_name, object_name, object_type, description)
VALUES
    (1, 1, 'idop_demo_db', 'customers', 'TABLE',
     'Customer profiles, email addresses and registration details.'),
    (2, 1, 'idop_demo_db', 'products', 'TABLE',
     'Product catalogue, categories, prices and stock quantities.'),
    (3, 1, 'idop_demo_db', 'orders', 'TABLE',
     'Customer orders, order statuses and stored order totals.'),
    (4, 1, 'idop_demo_db', 'order_items', 'TABLE',
     'Products, quantities and unit prices associated with orders.'),
    (5, 1, 'idop_demo_db', 'payments', 'TABLE',
     'Payment amounts, methods, transaction references and statuses.')
ON DUPLICATE KEY UPDATE
    description = VALUES(description);

-- 3. Register representative SQL workload examples.
-- Execution metrics remain NULL until measured on the actual database.
INSERT INTO query_workloads
    (workload_id, source_id, sql_text, query_label, query_type,
     execution_time_ms, rows_examined, rows_returned)
VALUES
    (1, 1,
     'SELECT * FROM orders WHERE customer_id = 1',
     'Orders by customer', 'SELECT', NULL, NULL, NULL),

    (2, 1,
     'SELECT o.order_id, c.full_name FROM orders o JOIN customers c ON o.customer_id = c.customer_id',
     'Orders joined with customers', 'SELECT', NULL, NULL, NULL),

    (3, 1,
     'SELECT category, COUNT(*) FROM products GROUP BY category',
     'Product count by category', 'SELECT', NULL, NULL, NULL),

    (4, 1,
     'SELECT * FROM orders WHERE status = ''DELIVERED''',
     'Filter delivered orders', 'SELECT', NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE
    sql_text = VALUES(sql_text),
    query_label = VALUES(query_label),
    query_type = VALUES(query_type);

-- 4. Add explainable, rule-based recommendations.
-- These are candidates for validation, not claims of proven speedup.
INSERT INTO optimization_recommendations
    (recommendation_id, workload_id, rule_code, recommendation,
     rationale, severity, status)
VALUES
    (1, 1, 'IDX_FILTER_COLUMN',
     'Inspect the execution plan and verify whether an index on orders.customer_id is useful.',
     'The query filters orders by customer_id. Check existing indexes and EXPLAIN output before recommending a new index.',
     'LOW', 'NEW'),

    (2, 2, 'JOIN_PLAN_REVIEW',
     'Inspect the join plan and confirm that the join columns are indexed appropriately.',
     'The query joins orders and customers through customer_id. Evaluate access paths using EXPLAIN.',
     'LOW', 'NEW'),

    (3, 3, 'GROUP_BY_REVIEW',
     'Inspect the grouping operation and compare the execution plan with the current product indexes.',
     'The query groups products by category. Evaluate the plan before deciding whether an index would help.',
     'INFO', 'NEW'),

    (4, 4, 'FILTER_PLAN_REVIEW',
     'Inspect the execution plan for the status filter and assess whether the existing index is appropriate.',
     'The query filters orders by status. The demo schema already has an index beginning with status; verify its use before proposing changes.',
     'INFO', 'NEW')
ON DUPLICATE KEY UPDATE
    recommendation = VALUES(recommendation),
    rationale = VALUES(rationale),
    severity = VALUES(severity);

-- 5. Verify the seeded records.
SELECT 'data_sources' AS table_name, COUNT(*) AS row_count
FROM data_sources
UNION ALL
SELECT 'schema_objects', COUNT(*) FROM schema_objects
UNION ALL
SELECT 'query_workloads', COUNT(*) FROM query_workloads
UNION ALL
SELECT 'optimization_recommendations', COUNT(*)
FROM optimization_recommendations;
