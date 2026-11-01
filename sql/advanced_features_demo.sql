-- IDOP advanced feature demonstrations.
-- These statements are intentionally separate from the definitions so that
-- demonstrations can be repeated without changing the project seed data.

USE idop_demo_db;

-- View and stored function.
SELECT * FROM v_customer_order_summary ORDER BY non_cancelled_order_value DESC;
SELECT fn_order_item_total(1) AS calculated_order_total;

-- Stored procedure. It reconciles an existing order using COMMIT.
CALL sp_reconcile_order_total(1);

-- Transaction with ROLLBACK: this temporary update is intentionally undone.
START TRANSACTION;
UPDATE orders SET status = 'CANCELLED' WHERE order_id = 8;
SELECT order_id, status FROM orders WHERE order_id = 8;
ROLLBACK;
SELECT order_id, status FROM orders WHERE order_id = 8;

USE idop_platform_db;

-- Trigger demonstration. The status change creates an audit_logs row.
START TRANSACTION;
UPDATE optimization_recommendations
   SET status = 'REVIEWED'
 WHERE recommendation_id = 1;
COMMIT;

SELECT audit_id, action, entity_type, entity_id, details, created_at
  FROM audit_logs
 WHERE action = 'RECOMMENDATION_STATUS_CHANGED'
 ORDER BY audit_id DESC
 LIMIT 1;

-- MySQL FULLTEXT search, distinct from Qdrant semantic search.
SELECT workload_id, query_label,
       MATCH(query_label, sql_text) AGAINST ('customer orders' IN NATURAL LANGUAGE MODE) AS relevance
  FROM query_workloads
 WHERE MATCH(query_label, sql_text) AGAINST ('customer orders' IN NATURAL LANGUAGE MODE)
 ORDER BY relevance DESC;
