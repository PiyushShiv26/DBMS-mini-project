
"""
Deterministic SQL workload analyzer.
Recommendations are rule-based candidates, not guaranteed speedups.
"""

import re


def analyze_query(sql: str) -> list[dict[str, str]]:
    normalized = re.sub(r"\s+", " ", sql.strip()).lower()
    recommendations = []

    if not normalized:
        return recommendations

    if re.search(r"\bselect\s+\*", normalized):
        recommendations.append({
            "rule_code": "SELECT_STAR",
            "severity": "LOW",
            "recommendation": (
                "Consider selecting only the columns required by the application."
            ),
            "rationale": (
                "SELECT * requests every column and may increase data transfer "
                "and processing when not all columns are needed."
            ),
        })

    if re.search(r"\bwhere\s+\w+\s*=\s*['\"]?[^'\"]+['\"]?", normalized):
        recommendations.append({
            "rule_code": "FILTER_REVIEW",
            "severity": "INFO",
            "recommendation": (
                "Inspect the execution plan and verify index support "
                "for the filtered columns."
            ),
            "rationale": (
                "The query contains a filter. Index usefulness depends on "
                "the column, existing indexes, selectivity, and query plan."
            ),
        })

    if re.search(r"\bjoin\b", normalized):
        recommendations.append({
            "rule_code": "JOIN_REVIEW",
            "severity": "INFO",
            "recommendation": (
                "Inspect the join plan and verify access paths for join columns."
            ),
            "rationale": (
                "Join performance depends on join conditions, indexes, "
                "table sizes, and optimizer choices."
            ),
        })

    if re.search(r"\bgroup\s+by\b", normalized):
        recommendations.append({
            "rule_code": "GROUP_BY_REVIEW",
            "severity": "INFO",
            "recommendation": (
                "Inspect the grouping operation in the execution plan."
            ),
            "rationale": (
                "Grouping can require additional work; the actual cost "
                "depends on data volume and the chosen execution plan."
            ),
        })

    return recommendations


if __name__ == "__main__":
    example = """
        SELECT *
        FROM orders
        WHERE customer_id = 1
    """

    print("Analyzing example query...")
    for item in analyze_query(example):
        print(f"\nRule: {item['rule_code']}")
        print(f"Severity: {item['severity']}")
        print(f"Recommendation: {item['recommendation']}")
        print(f"Why: {item['rationale']}")
