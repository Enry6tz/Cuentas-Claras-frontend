import type { NextRequest } from 'next/server';
import { forward } from '@/lib/backend';

export function POST(request: NextRequest) {
  return forward(request);
}
