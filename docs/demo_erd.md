
erDiagram
    CUSTOMERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : appears_in
    ORDERS ||--o{ PAYMENTS : has

    CUSTOMERS {
        bigint customer_id PK
        varchar full_name
        varchar email UK
        varchar city
        datetime registered_at
    }

    PRODUCTS {
        bigint product_id PK
        varchar product_name
        varchar category
        decimal price
        int stock_quantity
        datetime created_at
    }

    ORDERS {
        bigint order_id PK
        bigint customer_id FK
        datetime order_date
        enum status
        decimal total_amount
    }

    ORDER_ITEMS {
        bigint order_item_id PK
        bigint order_id FK
        bigint product_id FK
        int quantity
        decimal unit_price
    }

    PAYMENTS {
        bigint payment_id PK
        bigint order_id FK
        decimal amount
        enum payment_method
        enum status
        varchar transaction_reference UK
        datetime created_at
    }
