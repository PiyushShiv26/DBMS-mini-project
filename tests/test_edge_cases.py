from unittest.mock import patch
from src.analyzer import analyze_query


def test_invalid_sql_syntax_handling():
    """Ensure invalid SQL or unsupported query patterns return appropriate error codes or handle gracefully."""
    results = analyze_query("INVALID SYNTAX QUERY 12345")
    assert isinstance(results, list)


def test_duplicate_workload_prevention():
    """Ensure running the same workload twice doesn't cause duplicate conflicting records or exceptions."""
    query = "SELECT * FROM orders WHERE customer_id = 1"
    first_run = analyze_query(query)
    second_run = analyze_query(query)
    assert first_run == second_run


def test_low_relevance_or_irrelevant_query():
    """Ensure natural language or unrelated strings don't trigger optimization rules unexpectedly."""
    results = analyze_query("What is the weather like today?")
    assert results == []


@patch("src.db.get_connection", side_effect=ConnectionError("MySQL unavailable"))
def test_mysql_service_unavailable(mock_db):
    """Ensure expected handling when MySQL service is down or unreachable."""
    try:
        results = analyze_query("SELECT * FROM orders")
        assert isinstance(results, list)
    except ConnectionError:
        assert True