
from db import get_connection
from analyzer import analyze_query


def process_workloads():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT workload_id, query_label, sql_text
            FROM query_workloads
            ORDER BY workload_id
        """)
        workloads = cursor.fetchall()
        inserted = 0

        print("\n" + "=" * 65)
        print(" INTELLIGENT DATABASE DISCOVERY & OPTIMIZATION PLATFORM")
        print("=" * 65)

        for workload in workloads:
            recommendations = analyze_query(workload["sql_text"])

            print(f"\n[{workload['workload_id']}] {workload['query_label']}")
            print(f"SQL: {workload['sql_text']}")

            if not recommendations:
                print("No rule-based suggestions generated.")
                continue

            for item in recommendations:
                cursor.execute("""
                    SELECT recommendation_id
                    FROM optimization_recommendations
                    WHERE workload_id = %s AND rule_code = %s
                    LIMIT 1
                """, (workload["workload_id"], item["rule_code"]))

                existing = cursor.fetchone()

                if not existing:
                    cursor.execute("""
                        INSERT INTO optimization_recommendations
                            (workload_id, rule_code, recommendation,
                             rationale, severity, status)
                        VALUES (%s, %s, %s, %s, %s, 'NEW')
                    """, (
                        workload["workload_id"],
                        item["rule_code"],
                        item["recommendation"],
                        item["rationale"],
                        item["severity"],
                    ))
                    inserted += 1

                print(f"\n  Rule: {item['rule_code']} ({item['severity']})")
                print(f"  Suggestion: {item['recommendation']}")
                print(f"  Rationale: {item['rationale']}")

        connection.commit()
        print("\n" + "-" * 65)
        print(f"Workloads processed: {len(workloads)}")
        print(f"New recommendations saved: {inserted}")
        print("=" * 65)

    except Exception:
        connection.rollback()
        raise
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    process_workloads()
