"""REST API for the Intelligent Database Discovery platform."""

import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Any
from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from fastembed import TextEmbedding

from src.db import get_connection

app = FastAPI(title="IDOP API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer = HTTPBearer(auto_error=False)
TOKEN_SECRET = os.getenv("API_TOKEN_SECRET", "change-this-local-secret").encode()
QDRANT = QdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))
EMBEDDING_MODEL = TextEmbedding(model_name=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"))


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


class StatusRequest(BaseModel):
    status: str


class SearchRequest(BaseModel):
    query: str = Field(min_length=2)


class ProvisionRequest(RegisterRequest):
    role: str = Field(pattern="^(ADMIN|ANALYST|VIEWER)$")
    provisioning_key: str


def _hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return f"pbkdf2_sha256$120000${salt.hex()}${digest.hex()}"


def _check_password(password: str, stored: str) -> bool:
    try:
        _, rounds, salt_hex, digest_hex = stored.split("$")
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), int(rounds))
        return hmac.compare_digest(actual.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def _token(user: dict[str, Any]) -> str:
    payload = {"user_id": user["user_id"], "email": user["email"], "role": user["role"], "exp": int(time.time()) + 86_400}
    body = json.dumps(payload, separators=(",", ":")).encode().hex()
    signature = hmac.new(TOKEN_SECRET, body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{signature}"


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict[str, Any]:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        body, signature = credentials.credentials.split(".", 1)
        expected = hmac.new(TOKEN_SECRET, body.encode(), hashlib.sha256).hexdigest()
        payload = json.loads(bytes.fromhex(body))
        if not hmac.compare_digest(signature, expected) or payload["exp"] < time.time():
            raise ValueError
        return payload
    except (ValueError, KeyError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_roles(*roles: str):
    def dependency(user: dict[str, Any] = Depends(current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dependency


def _query(sql: str, params: tuple = (), database: str = "idop_platform_db") -> list[dict[str, Any]]:
    connection = get_connection(database)
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(sql, params)
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest):
    role = "VIEWER"
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("INSERT INTO users (full_name, email, password_hash, role) VALUES (%s, %s, %s, %s)", (request.full_name, request.email.lower(), _hash_password(request.password), role))
        connection.commit()
        user_id = cursor.lastrowid
        user = {"user_id": user_id, "email": request.email.lower(), "role": role}
        return {"user": user, "token": _token(user)}
    except Exception as exc:
        connection.rollback()
        if "Duplicate" in str(exc):
            raise HTTPException(409, "Email is already registered")
        raise
    finally:
        cursor.close()
        connection.close()


@app.post("/api/auth/provision", status_code=status.HTTP_201_CREATED)
def provision(request: ProvisionRequest, credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    configured_key = os.getenv("ADMIN_PROVISIONING_KEY", "").strip()
    if not configured_key or not request.provisioning_key or not hmac.compare_digest(request.provisioning_key, configured_key):
        raise HTTPException(403, "Invalid provisioning key")
    existing_admins = _query("SELECT COUNT(*) AS count FROM users WHERE role = 'ADMIN'")[0]["count"]
    if existing_admins and request.role == "ADMIN":
        raise HTTPException(403, "Additional ADMIN accounts must be provisioned through an explicit administrative policy")
    if existing_admins and not credentials:
        raise HTTPException(401, "An existing admin login is required to provision users")
    if credentials:
        user = current_user(credentials)
        if user.get("role") != "ADMIN":
            raise HTTPException(403, "Admin access required")
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("INSERT INTO users (full_name, email, password_hash, role) VALUES (%s, %s, %s, %s)", (request.full_name, request.email.lower(), _hash_password(request.password), request.role))
        connection.commit()
        user_record = {"user_id": cursor.lastrowid, "email": request.email.lower(), "role": request.role}
        return {"user": user_record, "token": _token(user_record)}
    except Exception as exc:
        connection.rollback()
        if "Duplicate" in str(exc):
            raise HTTPException(409, "Email is already registered")
        raise
    finally:
        cursor.close()
        connection.close()


@app.post("/api/auth/login")
def login(request: LoginRequest):
    rows = _query("SELECT user_id, email, password_hash, role FROM users WHERE email = %s", (request.email.lower(),))
    if not rows or not _check_password(request.password, rows[0]["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    user = {k: rows[0][k] for k in ("user_id", "email", "role")}
    return {"user": user, "token": _token(user)}


@app.get("/api/workloads")
def workloads(_: dict = Depends(current_user)):
    return _query("SELECT workload_id, query_label, sql_text, query_type, execution_time_ms, rows_examined, rows_returned, captured_at FROM query_workloads ORDER BY captured_at DESC, workload_id DESC")


@app.get("/api/dashboard/stats")
def dashboard_stats(_: dict = Depends(current_user)):
    counts = _query("SELECT (SELECT COUNT(*) FROM query_workloads) AS total_workloads, (SELECT COUNT(*) FROM data_sources) AS active_databases, (SELECT COUNT(*) FROM optimization_recommendations WHERE status = 'NEW') AS pending_recommendations")
    return {**counts[0], "system_health": "Healthy", "recent_alerts_count": 0}


@app.get("/api/databases")
def databases(_: dict = Depends(require_roles("ADMIN", "ANALYST", "VIEWER"))):
    sources = _query("SELECT source_id, source_name, database_name, db_type, description FROM data_sources ORDER BY source_name")
    names = {row["database_name"] for row in sources}
    if "idop_platform_db" not in names:
        sources.append({"source_id": None, "source_name": "Platform Metadata", "database_name": "idop_platform_db", "db_type": "MYSQL", "description": "Platform users, workloads and recommendations."})
    return sources


@app.get("/api/databases/{database_name}/tables")
def database_tables(database_name: str, _: dict = Depends(require_roles("ADMIN", "ANALYST", "VIEWER"))):
    return _query("SELECT TABLE_NAME AS table_name, TABLE_ROWS AS row_count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = %s ORDER BY TABLE_NAME", (database_name,))


@app.get("/api/schema/{database_name}/{table_name}")
def table_schema(database_name: str, table_name: str, _: dict = Depends(require_roles("ADMIN", "ANALYST", "VIEWER"))):
    return {
        "database_name": database_name,
        "table_name": table_name,
        "columns": _query("SELECT COLUMN_NAME AS name, COLUMN_TYPE AS type, COLUMN_KEY AS `key`, IS_NULLABLE AS nullable, COLUMN_DEFAULT AS default_value FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s ORDER BY ORDINAL_POSITION", (database_name, table_name)),
        "indexes": _query("SELECT INDEX_NAME AS name, COLUMN_NAME AS column_name, NON_UNIQUE AS non_unique FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s ORDER BY INDEX_NAME, SEQ_IN_INDEX", (database_name, table_name)),
    }


@app.get("/api/workloads/{workload_id}/recommendations")
def recommendations(workload_id: int, _: dict = Depends(current_user)):
    return _query("SELECT recommendation_id, workload_id, rule_code, recommendation, rationale, severity, status, created_at FROM optimization_recommendations WHERE workload_id = %s ORDER BY recommendation_id", (workload_id,))


@app.get("/api/workloads/{workload_id}")
def workload_detail(workload_id: int, user: dict = Depends(current_user)):
    rows = _query("SELECT workload_id AS id, query_label, sql_text AS query_text, query_type, execution_time_ms, rows_examined, rows_returned FROM query_workloads WHERE workload_id = %s", (workload_id,))
    if not rows:
        raise HTTPException(404, "Workload not found")
    return {**rows[0], "recommendations": recommendations(workload_id, user)}


@app.patch("/api/recommendations/{recommendation_id}")
def update_recommendation(recommendation_id: int, request: StatusRequest, user: dict = Depends(current_user)):
    if user["role"] not in {"ADMIN", "ANALYST"}:
        raise HTTPException(403, "Analyst or admin access required")
    if request.status not in {"NEW", "REVIEWED", "DISMISSED", "IMPLEMENTED"}:
        raise HTTPException(400, "Invalid recommendation status")
    connection = get_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("UPDATE optimization_recommendations SET status = %s WHERE recommendation_id = %s", (request.status, recommendation_id))
        connection.commit()
        if cursor.rowcount == 0:
            raise HTTPException(404, "Recommendation not found")
        return {"updated": True}
    finally:
        cursor.close()
        connection.close()


@app.get("/api/search")
def search(q: str = Query(min_length=2), limit: int = Query(5, ge=1, le=20), _: dict = Depends(require_roles("ADMIN", "ANALYST"))):
    vector = next(EMBEDDING_MODEL.query_embed(q)).tolist()
    points = QDRANT.query_points(collection_name=os.getenv("QDRANT_COLLECTION", "sql_workloads"), query=vector, limit=limit, with_payload=True).points
    return [{"score": point.score, **(point.payload or {})} for point in points]


@app.post("/api/search")
def search_post(request: SearchRequest, limit: int = Query(5, ge=1, le=20), user: dict = Depends(require_roles("ADMIN", "ANALYST"))):
    results = search(request.query, limit, user)
    return {"results": [{"workload_id": item.get("workload_id"), "query_text": item.get("sql_text", ""), "similarity_score": item.get("score", 0), "matched_tags": []} for item in results]}


@app.get("/api/queries/{workload_id}")
def query_details(workload_id: int, user: dict = Depends(current_user)):
    item = workload_detail(workload_id, user)
    plan = explain(workload_id, user)
    return {"id": str(item["id"]), "query_text": item["query_text"], "recommendations": item["recommendations"], "explain_plan": plan}


@app.get("/api/workloads/{workload_id}/explain")
def explain(workload_id: int, _: dict = Depends(current_user)):
    rows = _query("SELECT sql_text FROM query_workloads WHERE workload_id = %s", (workload_id,))
    if not rows:
        raise HTTPException(404, "Workload not found")
    sql = rows[0]["sql_text"].strip().rstrip(";").strip()
    if not sql.lower().startswith("select ") or ";" in sql:
        raise HTTPException(400, "Only single SELECT workloads can be explained")
    rows = _query("EXPLAIN " + sql, database="idop_demo_db")
    return [{"id": row.get("id"), "select_type": row.get("select_type"), "table": row.get("table"), "type": row.get("type"), "rows": row.get("rows"), "extra": row.get("Extra") or row.get("extra") or ""} for row in rows]
