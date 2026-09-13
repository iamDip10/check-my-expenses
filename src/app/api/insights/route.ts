import { NextResponse } from 'next/server';
import { getOwnerId, getSessionUser } from '@/lib/session';
import { computeInsights } from '@/lib/insights';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ownerId = await getOwnerId();
  const result = await computeInsights(ownerId);
  return NextResponse.json(result);
}
