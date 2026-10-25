
cat > docs/sql_reports.md <<'EOF'
# SQL Analytics Reports

**Project:** Intelligent Database Discovery and Optimization Platform  
**Database:** `idop_demo_db`  
**DBMS:** MySQL 8.4.11

This document records four analytics queries executed against the seeded
e-commerce demo database. The results below are from the execution performed
on 25 October 2026.

## 1. Customer Spending Report

### Purpose
Summarize each customer's total order count and the value of their
non-cancelled orders. Customers without orders are retained using a LEFT JOIN.

### SQL
```sql
SELECT
    c.customer_id,
    c.full_name,
    COUNT(o.order_id) AS order_count,
    COALESCE(
        SUM(CASE
            WHEN o.status <> 'CANCELLED' THEN o.total_amount
            ELSE 0
        END), 0
    ) AS non_cancelled_order_value
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.full_name
ORDER BY non_cancelled_order_value DESC;
```

### Observed results

| Customer | Order count | Non-cancelled order value |
|---|---:|---:|
| Aarav Sharma | 3 | 11,243.00 |
| Ananya Rao | 2 | 6,197.00 |
| Rohan Mehta | 2 | 5,098.00 |
| Diya Iyer | 2 | 3,798.00 |
| Kabir Verma | 1 | 3,499.00 |
| Vivaan Gupta | 1 | 2,398.00 |
| Arjun Reddy | 1 | 2,199.00 |
| Meera Joshi | 1 | 1,599.00 |
| Saanvi Menon | 1 | 499.00 |
| Isha Nair | 1 | 0.00 |

**Result:** 10 customers returned. Aarav Sharma has the highest
non-cancelled order value. `COUNT(o.order_id)` counts all associated orders,
including cancelled orders; the monetary total excludes cancelled orders.

## 2. Product Sales Report

### Purpose
Calculate units sold and item value per product, excluding items belonging
to cancelled orders. LEFT JOINs preserve products with no qualifying sales.

### SQL
```sql
SELECT
    p.product_name,
    COALESCE(SUM(
        CASE WHEN o.status <> 'CANCELLED'
             THEN oi.quantity ELSE 0 END
    ), 0) AS units_sold,
    COALESCE(SUM(
        CASE WHEN o.status <> 'CANCELLED'
             THEN oi.quantity * oi.unit_price ELSE 0 END
    ), 0) AS item_value
FROM products p
LEFT JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.order_id
GROUP BY p.product_id, p.product_name
ORDER BY item_value DESC;
```

### Observed results

| Product | Units sold | Item value |
|---|---:|---:|
| Mechanical Keyboard | 4 | 13,996.00 |
| Laptop Stand | 5 | 9,495.00 |
| USB-C Hub | 3 | 6,596.00 |
| Desk Lamp | 2 | 3,198.00 |
| Wireless Mouse | 1 | 1,299.00 |
| Water Bottle | 2 | 998.00 |
| Notebook Set | 3 | 798.00 |
| Gel Pen Pack | 1 | 150.00 |

**Result:** 8 products returned. Mechanical Keyboard has the highest item
value in this result set.

## 3. Above-Average Orders

### Purpose
Use a scalar subquery to calculate the average order amount, then return
orders whose total amount is greater than that average.

### SQL
```sql
SELECT
    order_id,
    customer_id,
    order_date,
    total_amount,
    status
FROM orders
WHERE total_amount > (
    SELECT AVG(total_amount)
    FROM orders
)
ORDER BY total_amount DESC;
```

### Observed results

| Order ID | Customer ID | Order date | Amount | Status |
|---:|---:|---|---:|---|
| 15 | 1 | 2025-09-08 11:20:00 | 5,697.00 | DELIVERED |
| 1 | 1 | 2025-08-01 10:15:00 | 4,798.00 | DELIVERED |
| 12 | 2 | 2025-08-28 09:30:00 | 3,998.00 | CONFIRMED |
| 7 | 6 | 2025-08-15 13:40:00 | 3,798.00 | DELIVERED |
| 3 | 3 | 2025-08-05 15:20:00 | 3,499.00 | SHIPPED |
| 6 | 5 | 2025-08-12 11:00:00 | 3,499.00 | CONFIRMED |

**Result:** 6 orders returned. The average is calculated across all rows in
`orders`; this query does not exclude cancelled orders from the average.

## 4. Category Performance

### Purpose
Aggregate item values by product category, count distinct associated orders,
and retain categories whose item value exceeds 3,000 using HAVING.

### SQL
```sql
SELECT
    p.category,
    COUNT(DISTINCT o.order_id) AS order_count,
    SUM(oi.quantity * oi.unit_price) AS item_value
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status <> 'CANCELLED'
GROUP BY p.category
HAVING SUM(oi.quantity * oi.unit_price) > 3000
ORDER BY item_value DESC;
```

### Observed results

| Category | Distinct order count | Item value |
|---|---:|---:|
| Electronics | 6 | 21,891.00 |
| Accessories | 3 | 9,495.00 |
| Home | 2 | 3,198.00 |

**Result:** 3 categories passed the HAVING condition. Categories with item
values of 3,000 or less are excluded from the output.

## Interpretation and Limitations

- The reports use joins, aggregate functions, conditional aggregation,
  a scalar subquery, GROUP BY, HAVING, and ORDER BY.
- Product and category item values include non-cancelled orders regardless
  of payment status. They must not be described as collected revenue.
- The customer order count includes cancelled orders, while its value
  excludes them.
- The above-average query includes every order when calculating its average,
  including cancelled orders.
- These reports describe the seeded demo dataset; they are not evidence of
  production-scale performance.
EOF
