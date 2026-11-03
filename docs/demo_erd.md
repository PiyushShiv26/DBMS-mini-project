# `idop_demo_db` Chen ER diagram

The authoritative schema is [`sql/demo/schema.sql`](../sql/demo/schema.sql).
The editable Chen notation source is [`demo_chen_erd.dot`](demo_chen_erd.dot),
and the rendered diagram is [`demo_erd.png`](demo_erd.png).

## Chen notation convention

- Rectangles represent entities.
- Ellipses represent attributes.
- Underlined attributes are primary keys.
- Attribute ellipses show names only; SQL datatypes are omitted for readability.
- `UNIQUE` is retained where it helps communicate a schema constraint.
- Diamonds represent relationships.
- Edge labels show cardinality.
- Two separate connector lines indicate total participation; one connector line indicates partial participation.

No weak entity, identifying relationship, multivalued attribute, composite
attribute, or derived attribute is shown because the schema does not justify
one. `ORDER_ITEM` has its own primary key (`order_item_id`), so it is modeled
as a regular entity.

## Entities and attributes

- **CUSTOMER:** `customer_id` (PK), `full_name`, `email` (UNIQUE), `city`, `registered_at`.
- **PRODUCT:** `product_id` (PK), `product_name`, `category`, `price`, `stock_quantity`, `created_at`.
- **ORDER:** `order_id` (PK), `customer_id`, `order_date`, `status`, `total_amount`.
- **ORDER_ITEM:** `order_item_id` (PK), `order_id`, `product_id`, `quantity`, `unit_price`.
- **PAYMENT:** `payment_id` (PK), `order_id`, `amount`, `payment_method`, `status`, `transaction_reference` (UNIQUE), `created_at`.

## Relationships and cardinalities

These relationships come directly from the foreign keys:

| Relationship | Cardinality | Schema evidence |
|---|---:|---|
| CUSTOMER — PLACES — ORDER | CUSTOMER 1; ORDER N | `orders.customer_id → customers.customer_id` |
| ORDER — CONTAINS — ORDER_ITEM | ORDER 1; ORDER_ITEM N | `order_items.order_id → orders.order_id` |
| PRODUCT — INCLUDES — ORDER_ITEM | PRODUCT 1; ORDER_ITEM N | `order_items.product_id → products.product_id` |
| ORDER — HAS — PAYMENT | ORDER 1; PAYMENT N | `payments.order_id → orders.order_id` |

The diagram keeps the foreign-key attributes visible on the entities as well
as showing the relationships.

Cardinality notation follows the lecture convention: `N` means many and `1`
means exactly one. Each relationship shows a separate label at both ends,
beside the corresponding entity connector. The foreign-key structure produces
one-to-many relationships: the referenced parent side is `1`, and the referencing child side is `N`.

## Participation

- `ORDER` has total participation in `PLACES` because `orders.customer_id` is `NOT NULL`; `CUSTOMER` has partial participation.
- `ORDER_ITEM` has total participation in both `CONTAINS` and `INCLUDES` because both foreign keys are `NOT NULL`; `ORDER` and `PRODUCT` have partial participation.
- `PAYMENT` has total participation in `HAS` because `payments.order_id` is `NOT NULL`; `ORDER` has partial participation.

The rendered diagrams use two separate parallel connector edges on each
total-participation side. No weak entity or identifying relationship is shown
because the schema does not justify one.
