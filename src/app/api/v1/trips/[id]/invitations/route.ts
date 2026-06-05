import type { NextRequest } from 'next/server';
import { forward } from '@/lib/backend';

export function GET(request: NextRequest) {
  return forward(request);
}

export function POST(request: NextRequest) {
  return forward(request);
}
