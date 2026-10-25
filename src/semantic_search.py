
from qdrant_client import QdrantClient, models
from fastembed import TextEmbedding

from db import get_connection

COLLECTION = "sql_workloads"
QDRANT_URL = "http://localhost:6333"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def main():
    # 1. Read real workload records from MySQL.
    connection = get_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT workload_id, query_label, sql_text
            FROM query_workloads
            ORDER BY workload_id
        """)
        workloads = cursor.fetchall()
        cursor.close()
    finally:
        connection.close()

    if not workloads:
        print("No workloads found in MySQL.")
        return

    # 2. Connect to Qdrant.
    client = QdrantClient(url=QDRANT_URL)
    client.get_collections()

    # 3. Load a local embedding model.
    print("Loading embedding model...")
    embedding_model = TextEmbedding(model_name=MODEL_NAME)

    # Index the query label and SQL text together.
    documents = [
        f"Query: {w['query_label']}. SQL: {w['sql_text']}"
        for w in workloads
    ]
    vectors = [v.tolist() for v in embedding_model.embed(documents)]
    vector_size = len(vectors[0])

    # 4. Create the collection if it does not exist.
    if not client.collection_exists(COLLECTION):
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=models.VectorParams(
                size=vector_size,
                distance=models.Distance.COSINE,
            ),
        )

    # 5. Upsert workloads using stable MySQL IDs.
    client.upsert(
        collection_name=COLLECTION,
        points=[
            models.PointStruct(
                id=w["workload_id"],
                vector=vector,
                payload={
                    "workload_id": w["workload_id"],
                    "query_label": w["query_label"],
                    "sql_text": w["sql_text"],
                    "description": document,
                },
            )
            for w, vector, document in zip(workloads, vectors, documents)
        ],
        wait=True,
    )

    print(f"Indexed {len(workloads)} workloads in Qdrant.")

    # 6. Search by meaning.
    search_text = input(
        "\nDescribe the kind of SQL query you want to find: "
    ).strip()

    if not search_text:
        print("Search text cannot be empty.")
        return

    query_vector = next(
        embedding_model.query_embed(search_text)
    ).tolist()

    results = client.query_points(
        collection_name=COLLECTION,
        query=query_vector,
        limit=3,
        with_payload=True,
    ).points

    print("\nSemantic search results")
    print("=" * 60)

    for result in results:
        payload = result.payload
        print(f"\nQuery: {payload['query_label']}")
        print(f"Similarity score: {result.score:.4f}")
        print(f"SQL: {payload['sql_text']}")


if __name__ == "__main__":
    main()
