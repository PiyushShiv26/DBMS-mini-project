# IDOP Advanced SQL Features

## What already existed

The project already had primary and foreign keys, `CHECK` constraints, ordinary
indexes, joins, grouping, aggregation, `HAVING`, subqueries, and `EXPLAIN`
workflows. It did not previously contain views, triggers, stored procedures,
stored functions, FULLTEXT indexes, or a COMMIT/ROLLBACK demonstration.

## What was added

Definitions are in `sql/advanced_features.sql`; repeatable demonstrations are
in `sql/advanced_features_demo.sql`.

- `v_customer_order_summary` is a reporting view joining customers and orders.
- `fn_order_item_total(order_id)` calculates an order total from its items.
- `sp_reconcile_order_total(order_id)` updates a stored order total inside a
  transaction and commits it.
- `trg_recommendation_status_audit` records recommendation status changes in
  the existing `idop_platform_db.audit_logs` table as JSON.
- `ft_query_workloads_text` is a MySQL FULLTEXT index over workload labels and
  SQL text. `MATCH(...) AGAINST(...)` demonstrates keyword search; it is
  different from Qdrant semantic search.
- The demo script includes a COMMIT procedure flow and a temporary update that
  is explicitly rolled back.

## Run and demonstrate

From the repository root, after both schemas and seed files have been loaded:

```bash
mysql -u root -p < sql/advanced_features.sql
mysql -u root -p < sql/advanced_features_demo.sql
```

Useful verification queries:

```sql
SHOW FULL TABLES IN idop_demo_db WHERE TABLE_TYPE = 'VIEW';
SHOW TRIGGERS FROM idop_platform_db;
SHOW PROCEDURE STATUS WHERE Db = 'idop_demo_db';
SHOW FUNCTION STATUS WHERE Db = 'idop_demo_db';
SHOW INDEX FROM idop_platform_db.query_workloads;
```

The feature definition script is additive and rerunnable. The view and
FULLTEXT index use existence-safe definitions; the routine and trigger names
are replaced with `DROP ... IF EXISTS` before being recreated. This only
replaces those explicitly named programmable objects; no tables, databases,
or seed rows are dropped or recreated.

## Verification status

The SQL was reviewed against the current MySQL schemas and uses existing table
and column names. Execution against a live MySQL server remains environment
dependent; verify by running the commands above and the `SHOW` queries.
