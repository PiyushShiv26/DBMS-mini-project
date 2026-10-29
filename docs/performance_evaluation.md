# Performance Evaluation Report
**Project:** Intelligent Database Discovery and Optimization Platform  
**Target Database:** MySQL 8.0 (`idop_demo_db`)  

## Overview
This report evaluates the execution plans (`EXPLAIN`) of core SQL workloads seeded in the platform. The objective is to analyze access paths, index usage, and optimizer behavior across single-table lookups, aggregations, joins, and filtered queries.

---

## 1. Filter by Customer ID (`SELECT_STAR` & Index Lookup)
* **Query:**
  ```sql
  SELECT * FROM orders WHERE customer_id = 1;
EXPLAIN Output:
+----+-------------+--------+------------+------+--------------------------+--------------------------+---------+-------+------+----------+-------+
| id | select_type | table  | partitions | type | possible_keys            | key                      | key_len | ref   | rows | filtered | Extra |
+----+-------------+--------+------------+------+--------------------------+--------------------------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | orders | NULL       | ref  | idx_orders_customer_date | idx_orders_customer_date | 8       | const |    3 |   100.00 | NULL  |
+----+-------------+--------+------------+------+--------------------------+--------------------------+---------+-------+------+----------+-------+

Analysis & Rules Triggered:

Access Type: ref via idx_orders_customer_date, successfully avoiding full table scans.

Rules Triggered: SELECT_STAR (Low severity request for all columns) and FILTER_REVIEW (Info).


## 2. Orders Joined with Customers (JOIN_REVIEW)
* **Query:**
  ```sql
  SELECT o.order_id, c.full_name FROM orders o JOIN customers c ON o.customer_id = c.customer_id;
EXPLAIN Output:
+----+-------------+-------+------------+------+--------------------------+--------------------------+---------+----------------------------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys            | key                      | key_len | ref                        | rows | filtered | Extra       |
+----+-------------+-------+------------+------+--------------------------+--------------------------+---------+----------------------------+------+----------+-------------+
|  1 | SIMPLE      | c     | NULL       | ALL  | PRIMARY                  | NULL                     | NULL    | NULL                       |   10 |   100.00 | NULL        |
|  1 | SIMPLE      | o     | NULL       | ref  | idx_orders_customer_date | idx_orders_customer_date | 8       | idop_demo_db.c.customer_id |    1 |   100.00 | Using index |
+----+-------------+-------+------------+------+--------------------------+--------------------------+---------+----------------------------+------+----------+-------------+

Analysis & Rules Triggered:

Access Type: Uses a nested loop starting with the customers table (ALL due to small dataset size) and efficiently probing orders using idx_orders_customer_date.

Rules Triggered: JOIN_REVIEW (Info).


## 3. Product Count by Category (GROUP_BY_REVIEW)
* **Query:**
  ```sql
  SELECT category, COUNT(*) FROM products GROUP BY category;
EXPLAIN Output:
+----+-------------+----------+------------+-------+-----------------------+-----------------------+---------+------+------+----------+-------------+
| id | select_type | table    | partitions | type  | possible_keys         | key                   | key_len | ref  | rows | filtered | Extra       |
+----+-------------+----------+------------+-------+-----------------------+-----------------------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | products | NULL       | index | idx_products_category | idx_products_category | 322     | NULL |    8 |   100.00 | Using index |
+----+-------------+----------+------------+-------+-----------------------+-----------------------+---------+------+------+----------+-------------+

Analysis & Rules Triggered:

Access Type: index utilizing idx_products_category to cover the grouping operation directly.

Rules Triggered: GROUP_BY_REVIEW (Info).


## 4. Filter Delivered Orders (SELECT_STAR & Status Filter)
* **Query:**
  ```sql
  SELECT * FROM orders WHERE status = 'DELIVERED';
EXPLAIN Output:
+----+-------------+--------+------------+------+------------------------+------------------------+---------+-------+------+----------+-----------------------+
| id | select_type | table  | partitions | type | possible_keys          | key                    | key_len | ref   | rows | filtered | Extra                 |
+----+-------------+--------+------------+------+------------------------+------------------------+---------+-------+------+----------+-----------------------+
|  1 | SIMPLE      | orders | NULL       | ref  | idx_orders_status_date | idx_orders_status_date | 1       | const |    8 |   100.00 | Using index condition |
+----+-------------+--------+------------+------+------------------------+------------------------+---------+-------+------+----------+-----------------------+

Analysis & Rules Triggered:

Access Type: ref utilizing idx_orders_status_date with index condition pushdown (ICP).

Rules Triggered: SELECT_STAR (Low), FILTER_REVIEW (Info).