
erDiagram
    USERS o|--o{ DATA_SOURCES : creates
    USERS o|--o{ AUDIT_LOGS : generates
    DATA_SOURCES ||--o{ SCHEMA_OBJECTS : contains
    DATA_SOURCES ||--o{ QUERY_WORKLOADS : records
    QUERY_WORKLOADS ||--o{ OPTIMIZATION_RECOMMENDATIONS : receives

    USERS {
        bigint user_id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar role
        datetime created_at
    }

    DATA_SOURCES {
        bigint source_id PK
        varchar source_name
        varchar db_type
        varchar database_name
        bigint created_by FK
    }

    SCHEMA_OBJECTS {
        bigint object_id PK
        bigint source_id FK
        varchar schema_name
        varchar object_name
        varchar object_type
    }

    QUERY_WORKLOADS {
        bigint workload_id PK
        bigint source_id FK
        text sql_text
        varchar query_label
        varchar query_type
        decimal execution_time_ms
    }

    OPTIMIZATION_RECOMMENDATIONS {
        bigint recommendation_id PK
        bigint workload_id FK
        varchar rule_code
        varchar severity
        varchar status
    }

    AUDIT_LOGS {
        bigint audit_id PK
        bigint user_id FK
        varchar action
        varchar entity_type
        json details
    }
