# `idop_platform_db` Chen ER diagram

The authoritative schema is [`sql/platform/schema.sql`](../sql/platform/schema.sql).
The editable Chen notation source is [`platform_chen_erd.dot`](platform_chen_erd.dot),
and the rendered diagram is [`platform_erd.png`](platform_erd.png).

## Chen notation convention

- Rectangles represent entities.
- Ellipses represent attributes.
- Underlined attributes are primary keys.
- Attribute ellipses show names only; SQL datatypes are omitted for readability.
- `UNIQUE` is retained where it helps communicate a schema constraint.
- Diamonds represent relationships.
- Edge labels show cardinality.
- Two separate connector lines indicate total participation; one connector line indicates partial participation.

No weak entities or special attribute types are used because the schema does
not justify them.

## Entities and attributes

- **USER:** `user_id` (PK), `full_name`, `email` (UNIQUE), `password_hash`, `role`, `created_at`.
- **DATA_SOURCE:** `source_id` (PK), `source_name`, `db_type`, `host_name`, `database_name`, `description`, `created_by`, `created_at`.
- **SCHEMA_OBJECT:** `object_id` (PK), `source_id`, `schema_name`, `object_name`, `object_type`, `description`, `discovered_at`.
- **QUERY_WORKLOAD:** `workload_id` (PK), `source_id`, `sql_text`, `query_label`, `query_type`, `execution_time_ms`, `rows_examined`, `rows_returned`, `captured_at`.
- **OPTIMIZATION_RECOMMENDATION:** `recommendation_id` (PK), `workload_id`, `rule_code`, `recommendation`, `rationale`, `severity`, `status`, `created_at`.
- **AUDIT_LOG:** `audit_id` (PK), `user_id`, `action`, `entity_type`, `entity_id`, `details`, `created_at`.

## Relationships and cardinalities

Only declared foreign keys are represented:

| Relationship | Cardinality | Schema evidence |
|---|---:|---|
| USER — CREATES — DATA_SOURCE | USER 1; DATA_SOURCE N | nullable `data_sources.created_by → users.user_id` |
| DATA_SOURCE — CONTAINS — SCHEMA_OBJECT | DATA_SOURCE 1; SCHEMA_OBJECT N | `schema_objects.source_id → data_sources.source_id` |
| DATA_SOURCE — RECORDS — QUERY_WORKLOAD | DATA_SOURCE 1; QUERY_WORKLOAD N | `query_workloads.source_id → data_sources.source_id` |
| QUERY_WORKLOAD — RECEIVES — OPTIMIZATION_RECOMMENDATION | QUERY_WORKLOAD 1; RECOMMENDATION N | `optimization_recommendations.workload_id → query_workloads.workload_id` |
| USER — GENERATES — AUDIT_LOG | USER 1; AUDIT_LOG N | nullable `audit_logs.user_id → users.user_id` |

The nullable foreign keys allow optional participation on the DATA_SOURCE and
AUDIT_LOG sides, respectively. No relationship is inferred between `AUDIT_LOG` and other entities from
the generic `entity_type` and `entity_id` fields because those columns do not
declare foreign keys.

Cardinality notation follows the lecture convention: `N` means many and `1`
means exactly one. Each relationship shows a separate label at both ends,
beside the corresponding entity connector. The foreign-key structure produces
one-to-many relationships: the referenced parent side is `1`, and the referencing child side is `N`.

## Participation

- `SCHEMA_OBJECT` has total participation in `CONTAINS` because `source_id` is `NOT NULL`; `DATA_SOURCE` has partial participation.
- `QUERY_WORKLOAD` has total participation in `RECORDS` because `source_id` is `NOT NULL`; `DATA_SOURCE` has partial participation.
- `OPTIMIZATION_RECOMMENDATION` has total participation in `RECEIVES` because `workload_id` is `NOT NULL`; `QUERY_WORKLOAD` has partial participation.
- `DATA_SOURCE` has optional participation in `CREATES` because `created_by` is nullable; `USER` has partial participation.
- `AUDIT_LOG` has optional participation in `GENERATES` because `user_id` is nullable; `USER` has partial participation.

The rendered diagrams use two separate parallel connector edges on each
total-participation side. No weak entity or identifying relationship is shown
because the schema does not justify one.
