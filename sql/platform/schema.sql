
-- Intelligent Database Discovery and Optimization Platform
-- Platform metadata schema
-- MySQL 8.4+

USE idop_platform_db;

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'ANALYST', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_sources (
    source_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(120) NOT NULL,
    db_type ENUM('MYSQL', 'POSTGRESQL') NOT NULL DEFAULT 'MYSQL',
    host_name VARCHAR(255) NOT NULL DEFAULT 'localhost',
    database_name VARCHAR(120) NOT NULL,
    description TEXT,
    created_by BIGINT UNSIGNED,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_source_database UNIQUE (source_name, database_name),
    CONSTRAINT fk_source_creator
        FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS schema_objects (
    object_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT UNSIGNED NOT NULL,
    schema_name VARCHAR(120) NOT NULL,
    object_name VARCHAR(120) NOT NULL,
    object_type ENUM('TABLE', 'VIEW', 'INDEX') NOT NULL DEFAULT 'TABLE',
    description TEXT,
    discovered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_schema_object
        UNIQUE (source_id, schema_name, object_name, object_type),
    CONSTRAINT fk_object_source
        FOREIGN KEY (source_id) REFERENCES data_sources(source_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS query_workloads (
    workload_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source_id BIGINT UNSIGNED NOT NULL,
    sql_text TEXT NOT NULL,
    query_label VARCHAR(200) NOT NULL,
    query_type ENUM('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'OTHER')
        NOT NULL DEFAULT 'SELECT',
    execution_time_ms DECIMAL(12, 3),
    rows_examined BIGINT UNSIGNED,
    rows_returned BIGINT UNSIGNED,
    captured_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_execution_time
        CHECK (execution_time_ms IS NULL OR execution_time_ms >= 0),
    CONSTRAINT fk_workload_source
        FOREIGN KEY (source_id) REFERENCES data_sources(source_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_workload_source_time (source_id, captured_at),
    INDEX idx_workload_type (query_type)
);

CREATE TABLE IF NOT EXISTS optimization_recommendations (
    recommendation_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workload_id BIGINT UNSIGNED NOT NULL,
    rule_code VARCHAR(80) NOT NULL,
    recommendation TEXT NOT NULL,
    rationale TEXT NOT NULL,
    severity ENUM('INFO', 'LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'INFO',
    status ENUM('NEW', 'REVIEWED', 'DISMISSED', 'IMPLEMENTED')
        NOT NULL DEFAULT 'NEW',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recommendation_workload
        FOREIGN KEY (workload_id) REFERENCES query_workloads(workload_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_recommendation_status (status, severity)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id BIGINT UNSIGNED,
    details JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
);
