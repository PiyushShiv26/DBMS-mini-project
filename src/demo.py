
from qdrant_client import QdrantClient
from fastembed import TextEmbedding

from db import get_connection

QDRANT_URL = "http://localhost:6333"
COLLECTION = "sql_workloads"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def get_search_results(search_text: str, limit: int = 3):
    """Find similar SQL workloads using Qdrant."""
    client = QdrantClient(url=QDRANT_URL)
    model = TextEmbedding(model_name=MODEL_NAME)

    query_vector = next(model.query_embed(search_text)).tolist()

    return client.query_points(
        collection_name=COLLECTION,
        query=query_vector,
        limit=limit,
        with_payload=True,
    ).points


def get_recommendations(workload_id: int):
    """Fetch saved optimization recommendations from MySQL."""
    connection = get_connection()

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT rule_code, severity, recommendation, rationale, status
            FROM optimization_recommendations
            WHERE workload_id = %s
            ORDER BY recommendation_id
            """,
            (workload_id,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def explain_query(sql: str):
    """Run EXPLAIN only for a read-only SELECT statement."""
    normalized = sql.strip().rstrip(";").strip()

    if not normalized.lower().startswith("select "):
        return None, "EXPLAIN skipped: only SELECT queries are supported."

    # Keep the demo limited to single SELECT statements.
    if ";" in normalized:
        return None, "EXPLAIN skipped: multiple statements are not supported."

    connection = get_connection(database="idop_demo_db")

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("EXPLAIN " + normalized)
        return cursor.fetchall(), None
    finally:
        cursor.close()
        connection.close()


def main():
    print("\n" + "=" * 68)
    print(" INTELLIGENT DATABASE DISCOVERY & OPTIMIZATION PLATFORM")
    print("=" * 68)
    print("Search SQL workloads using natural language.\n")

    search_text = input("Describe the query you want to find: ").strip()

    if not search_text:
        print("Search cannot be empty.")
        return

    try:
        results = get_search_results(search_text)
    except Exception as exc:
        print(f"Semantic search failed: {exc}")
        print("Check that Qdrant is running and workloads are indexed.")
        return

    if not results:
        print("No matching workloads found.")
        return

    print("\n--- SEMANTIC SEARCH RESULTS ---")

    for index, result in enumerate(results, start=1):
        payload = result.payload or {}
        print(
            f"\n{index}. {payload.get('query_label', 'Unnamed workload')}"
            f"\n   Similarity: {result.score:.4f}"
            f"\n   SQL: {payload.get('sql_text', 'Unavailable')}"
        )

    choice = input("\nSelect a result number (or Enter to exit): ").strip()

    if not choice:
        print("Demo finished.")
        return

    if not choice.isdigit() or not 1 <= int(choice) <= len(results):
        print("Invalid selection.")
        return

    selected = results[int(choice) - 1]
    payload = selected.payload or {}
    workload_id = payload.get("workload_id")
    sql = payload.get("sql_text", "")

    if workload_id is None or not sql:
        print("The selected result is missing its workload ID or SQL.")
        return

    print("\n--- SELECTED WORKLOAD ---")
    print(f"ID: {workload_id}")
    print(f"Label: {payload.get('query_label', 'Unnamed workload')}")
    print(f"SQL: {sql}")

    print("\n--- STORED OPTIMIZATION RECOMMENDATIONS ---")
    try:
        recommendations = get_recommendations(int(workload_id))

        if not recommendations:
            print("No recommendations stored for this workload.")
        else:
            for item in recommendations:
                print(
                    f"\n[{item['severity']}] {item['rule_code']}"
                    f" | Status: {item['status']}"
                )
                print(f"Suggestion: {item['recommendation']}")
                print(f"Rationale: {item['rationale']}")
    except Exception as exc:
        print(f"Could not retrieve recommendations: {exc}")
        return

    print("\n--- MYSQL EXPLAIN PLAN ---")
    try:
        plan, error = explain_query(sql)

        if error:
            print(error)
        elif not plan:
            print("No plan details returned.")
        else:
            for row in plan:
                for key, value in row.items():
                    print(f"{key}: {value}")
                print("-" * 40)

            print(
                "Note: EXPLAIN provides optimizer estimates, "
                "not measured execution-time improvements."
            )
    except Exception as exc:
        print(f"Could not retrieve EXPLAIN plan: {exc}")


if __name__ == "__main__":
    main()
