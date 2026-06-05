import type { NextRequest } from 'next/server';
import { forward } from '@/lib/backend';

export function DELETE(request: NextRequest) {
  return forward(request);
}
