
-- Intelligent Database Discovery and Optimization Platform
-- Demo Workload Database - Seed Data
-- All records are fictional and intended for local testing.
-- Designed to be safely re-runnable.

USE idop_demo_db;

-- 1. CUSTOMERS
INSERT INTO customers
    (customer_id, full_name, email, city, registered_at)
VALUES
    (1, 'Aarav Sharma', 'aarav.sharma@example.com', 'Bengaluru', '2025-01-10 10:30:00'),
    (2, 'Ananya Rao', 'ananya.rao@example.com', 'Mysuru', '2025-02-15 12:00:00'),
    (3, 'Rohan Mehta', 'rohan.mehta@example.com', 'Mumbai', '2025-03-20 09:15:00'),
    (4, 'Isha Nair', 'isha.nair@example.com', 'Chennai', '2025-04-05 14:45:00'),
    (5, 'Kabir Verma', 'kabir.verma@example.com', 'Delhi', '2025-04-18 16:20:00'),
    (6, 'Diya Iyer', 'diya.iyer@example.com', 'Bengaluru', '2025-05-02 11:10:00'),
    (7, 'Arjun Reddy', 'arjun.reddy@example.com', 'Hyderabad', '2025-05-22 08:40:00'),
    (8, 'Meera Joshi', 'meera.joshi@example.com', 'Pune', '2025-06-12 13:25:00'),
    (9, 'Vivaan Gupta', 'vivaan.gupta@example.com', 'Mumbai', '2025-07-01 17:00:00'),
    (10, 'Saanvi Menon', 'saanvi.menon@example.com', 'Kochi', '2025-07-19 10:05:00')
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    city = VALUES(city),
    registered_at = VALUES(registered_at);

-- 2. PRODUCTS
INSERT INTO products
    (product_id, product_name, category, price, stock_quantity, created_at)
VALUES
    (1, 'Mechanical Keyboard', 'Electronics', 3499.00, 45, '2025-01-05 09:00:00'),
    (2, 'Wireless Mouse', 'Electronics', 1299.00, 80, '2025-01-08 10:00:00'),
    (3, 'USB-C Hub', 'Electronics', 2199.00, 35, '2025-01-12 11:00:00'),
    (4, 'Notebook Set', 'Stationery', 299.00, 120, '2025-02-01 12:00:00'),
    (5, 'Gel Pen Pack', 'Stationery', 149.00, 200, '2025-02-05 13:00:00'),
    (6, 'Desk Lamp', 'Home', 1599.00, 25, '2025-02-14 14:00:00'),
    (7, 'Water Bottle', 'Lifestyle', 499.00, 100, '2025-03-01 15:00:00'),
    (8, 'Laptop Stand', 'Accessories', 1899.00, 30, '2025-03-10 16:00:00')
ON DUPLICATE KEY UPDATE
    product_name = VALUES(product_name),
    category = VALUES(category),
    price = VALUES(price),
    stock_quantity = VALUES(stock_quantity),
    created_at = VALUES(created_at);

-- 3. ORDERS
INSERT INTO orders
    (order_id, customer_id, order_date, status, total_amount)
VALUES
    (1, 1, '2025-08-01 10:15:00', 'DELIVERED', 4798.00),
    (2, 2, '2025-08-03 12:30:00', 'DELIVERED', 2199.00),
    (3, 3, '2025-08-05 15:20:00', 'SHIPPED', 3499.00),
    (4, 1, '2025-08-08 09:45:00', 'DELIVERED', 748.00),
    (5, 4, '2025-08-10 17:10:00', 'CANCELLED', 1299.00),
    (6, 5, '2025-08-12 11:00:00', 'CONFIRMED', 3499.00),
    (7, 6, '2025-08-15 13:40:00', 'DELIVERED', 3798.00),
    (8, 7, '2025-08-18 16:25:00', 'PENDING', 2199.00),
    (9, 8, '2025-08-20 10:50:00', 'DELIVERED', 1599.00),
    (10, 9, '2025-08-22 14:15:00', 'SHIPPED', 2398.00),
    (11, 10, '2025-08-25 18:00:00', 'DELIVERED', 499.00),
    (12, 2, '2025-08-28 09:30:00', 'CONFIRMED', 3998.00),
    (13, 3, '2025-09-02 12:45:00', 'DELIVERED', 1599.00),
    (14, 6, '2025-09-05 15:35:00', 'CANCELLED', 1899.00),
    (15, 1, '2025-09-08 11:20:00', 'DELIVERED', 5697.00)
ON DUPLICATE KEY UPDATE
    customer_id = VALUES(customer_id),
    order_date = VALUES(order_date),
    status = VALUES(status),
    total_amount = VALUES(total_amount);

-- 4. ORDER ITEMS
INSERT INTO order_items
    (order_item_id, order_id, product_id, quantity, unit_price)
VALUES
    (1, 1, 1, 1, 3499.00),
    (2, 1, 2, 1, 1299.00),
    (3, 2, 3, 1, 2199.00),
    (4, 3, 1, 1, 3499.00),
    (5, 4, 4, 2, 299.00),
    (6, 4, 5, 1, 150.00),
    (7, 5, 2, 1, 1299.00),
    (8, 6, 1, 1, 3499.00),
    (9, 7, 8, 2, 1899.00),
    (10, 8, 3, 1, 2199.00),
    (11, 9, 6, 1, 1599.00),
    (12, 10, 7, 1, 499.00),
    (13, 10, 8, 1, 1899.00),
    (14, 11, 7, 1, 499.00),
    (15, 12, 8, 2, 1899.00),
    (16, 12, 4, 1, 200.00),
    (17, 13, 6, 1, 1599.00),
    (18, 14, 8, 1, 1899.00),
    (19, 15, 1, 1, 3499.00),
    (20, 15, 3, 1, 2198.00)
ON DUPLICATE KEY UPDATE
    product_id = VALUES(product_id),
    quantity = VALUES(quantity),
    unit_price = VALUES(unit_price);

-- 5. PAYMENTS
INSERT INTO payments
    (payment_id, order_id, amount, payment_method, status, transaction_reference, created_at)
VALUES
    (1, 1, 4798.00, 'UPI', 'SUCCESS', 'TXN-DEMO-001', '2025-08-01 10:16:00'),
    (2, 2, 2199.00, 'CARD', 'SUCCESS', 'TXN-DEMO-002', '2025-08-03 12:31:00'),
    (3, 3, 3499.00, 'UPI', 'SUCCESS', 'TXN-DEMO-003', '2025-08-05 15:21:00'),
    (4, 4, 748.00, 'WALLET', 'SUCCESS', 'TXN-DEMO-004', '2025-08-08 09:46:00'),
    (5, 5, 1299.00, 'CARD', 'REFUNDED', 'TXN-DEMO-005', '2025-08-10 17:11:00'),
    (6, 6, 3499.00, 'NET_BANKING', 'SUCCESS', 'TXN-DEMO-006', '2025-08-12 11:01:00'),
    (7, 7, 3798.00, 'UPI', 'SUCCESS', 'TXN-DEMO-007', '2025-08-15 13:41:00'),
    (8, 8, 2199.00, 'CARD', 'INITIATED', 'TXN-DEMO-008', '2025-08-18 16:26:00'),
    (9, 9, 1599.00, 'UPI', 'SUCCESS', 'TXN-DEMO-009', '2025-08-20 10:51:00'),
    (10, 10, 2398.00, 'WALLET', 'SUCCESS', 'TXN-DEMO-010', '2025-08-22 14:16:00'),
    (11, 11, 499.00, 'UPI', 'SUCCESS', 'TXN-DEMO-011', '2025-08-25 18:01:00'),
    (12, 12, 3998.00, 'CARD', 'SUCCESS', 'TXN-DEMO-012', '2025-08-28 09:31:00'),
    (13, 13, 1599.00, 'NET_BANKING', 'SUCCESS', 'TXN-DEMO-013', '2025-09-02 12:46:00'),
    (14, 14, 1899.00, 'UPI', 'REFUNDED', 'TXN-DEMO-014', '2025-09-05 15:36:00'),
    (15, 15, 5697.00, 'CARD', 'SUCCESS', 'TXN-DEMO-015', '2025-09-08 11:21:00')
ON DUPLICATE KEY UPDATE
    order_id = VALUES(order_id),
    amount = VALUES(amount),
    payment_method = VALUES(payment_method),
    status = VALUES(status),
    created_at = VALUES(created_at);

-- Verify seed counts after execution.
SELECT 'customers' AS table_name, COUNT(*) AS row_count FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
