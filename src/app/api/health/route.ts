import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    frontend: { status: 'ok' },
  };

  // Ping backend → backend pings Supabase
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const start = Date.now();
    const res = await fetch(`${backendUrl}/health`, { cache: 'no-store' });
    const ms = Date.now() - start;

    if (res.ok) {
      const data = await res.json();
      results.backend = { status: 'ok', responseTime: `${ms}ms`, ...data.data };
    } else {
      results.backend = { status: 'error', statusCode: res.status, responseTime: `${ms}ms` };
      results.status = 'degraded';
    }
  } catch (err) {
    results.backend = { status: 'unreachable', error: String(err) };
    results.status = 'degraded';
  }

  const statusCode = results.status === 'ok' ? 200 : 503;
  return NextResponse.json(results, { status: statusCode });
}
