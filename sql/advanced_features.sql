-- IDOP advanced DBMS features
-- Run after sql/demo/schema.sql and sql/platform/schema.sql.
-- This script creates only new named objects; it does not drop or recreate data.

USE idop_demo_db;

-- 1. View: reusable customer order summary for dashboard/reporting queries.
CREATE OR REPLACE VIEW v_customer_order_summary AS
SELECT
    c.customer_id,
    c.full_name,
    c.email,
    COUNT(o.order_id) AS order_count,
    COALESCE(SUM(CASE WHEN o.status <> 'CANCELLED' THEN o.total_amount ELSE 0 END), 0) AS non_cancelled_order_value,
    MAX(o.order_date) AS last_order_date
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.full_name, c.email;

-- 2. Stored function: calculate an order's item total without changing data.
DROP FUNCTION IF EXISTS fn_order_item_total;
DELIMITER $$
CREATE FUNCTION fn_order_item_total(p_order_id BIGINT UNSIGNED)
RETURNS DECIMAL(14, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(14, 2);
    SELECT COALESCE(SUM(quantity * unit_price), 0)
      INTO v_total
      FROM order_items
     WHERE order_id = p_order_id;
    RETURN v_total;
END$$

-- 3. Stored procedure: reconcile one stored order total in a transaction.
DROP PROCEDURE IF EXISTS sp_reconcile_order_total;
CREATE PROCEDURE sp_reconcile_order_total(IN p_order_id BIGINT UNSIGNED)
MODIFIES SQL DATA
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    SELECT COUNT(*) INTO v_exists FROM orders WHERE order_id = p_order_id;
    IF v_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order does not exist';
    END IF;
    START TRANSACTION;
    UPDATE orders
       SET total_amount = fn_order_item_total(p_order_id)
     WHERE order_id = p_order_id;
    COMMIT;
END$$
DELIMITER ;

USE idop_platform_db;

-- 4. Trigger: audit recommendation status changes for explainable governance.
DROP TRIGGER IF EXISTS trg_recommendation_status_audit;
DELIMITER $$
CREATE TRIGGER trg_recommendation_status_audit
AFTER UPDATE ON optimization_recommendations
FOR EACH ROW
BEGIN
    IF NOT (OLD.status <=> NEW.status) THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
        VALUES (
            NULL,
            'RECOMMENDATION_STATUS_CHANGED',
            'optimization_recommendations',
            NEW.recommendation_id,
            JSON_OBJECT('old_status', OLD.status, 'new_status', NEW.status, 'rule_code', NEW.rule_code)
        );
    END IF;
END$$
DELIMITER ;

-- 5. FULLTEXT index: keyword search over workload labels and SQL text.
-- The conditional dynamic statement keeps this safe to run when the index exists.
SET @fulltext_index_exists := (
    SELECT COUNT(*)
      FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = 'idop_platform_db'
       AND TABLE_NAME = 'query_workloads'
       AND INDEX_NAME = 'ft_query_workloads_text'
);
SET @fulltext_sql := IF(
    @fulltext_index_exists = 0,
    'ALTER TABLE idop_platform_db.query_workloads ADD FULLTEXT INDEX ft_query_workloads_text (query_label, sql_text)',
    'SELECT 1'
);
PREPARE fulltext_stmt FROM @fulltext_sql;
EXECUTE fulltext_stmt;
DEALLOCATE PREPARE fulltext_stmt;
