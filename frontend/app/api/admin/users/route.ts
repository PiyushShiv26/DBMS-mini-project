import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization");
  const provisioningKey = process.env.ADMIN_PROVISIONING_KEY?.trim();
  if (!provisioningKey) return NextResponse.json({ detail: "Server provisioning is not configured" }, { status: 503 });
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const body = await request.json();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}/auth/provision`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ ...body, provisioning_key: provisioningKey }),
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
