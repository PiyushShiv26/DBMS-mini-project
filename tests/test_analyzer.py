
from src.analyzer import analyze_query


def test_empty_query_returns_no_recommendations():
    assert analyze_query("") == []
    assert analyze_query("   ") == []


def test_select_star_triggers_recommendation():
    results = analyze_query("SELECT * FROM orders")

    codes = {item["rule_code"] for item in results}
    assert "SELECT_STAR" in codes


def test_filter_triggers_filter_review():
    results = analyze_query(
        "SELECT order_id FROM orders WHERE customer_id = 1"
    )

    codes = {item["rule_code"] for item in results}
    assert "FILTER_REVIEW" in codes


def test_join_triggers_join_review():
    results = analyze_query(
        "SELECT o.order_id FROM orders o "
        "JOIN customers c ON o.customer_id = c.customer_id"
    )

    codes = {item["rule_code"] for item in results}
    assert "JOIN_REVIEW" in codes


def test_group_by_triggers_grouping_review():
    results = analyze_query(
        "SELECT category, COUNT(*) FROM products GROUP BY category"
    )

    codes = {item["rule_code"] for item in results}
    assert "GROUP_BY_REVIEW" in codes


def test_recommendations_have_required_fields():
    results = analyze_query("SELECT * FROM orders WHERE customer_id = 1")

    assert results
    for item in results:
        assert {
            "rule_code",
            "severity",
            "recommendation",
            "rationale",
        } <= item.keys()
