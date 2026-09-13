import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOwnerId, getSessionUser } from '@/lib/session';
import { monthKey } from '@/lib/utils';

const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().int().nonnegative().max(100_000_000),
});

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month') ?? monthKey(new Date());
  const ownerId = await getOwnerId();

  const budget = await prisma.budget.findUnique({ where: { userId_month: { userId: ownerId, month } } });
  return NextResponse.json({ budget });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the owner can set the budget.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid budget.' }, { status: 400 });

  const budget = await prisma.budget.upsert({
    where: { userId_month: { userId: user.id, month: parsed.data.month } },
    update: { amount: parsed.data.amount },
    create: { userId: user.id, month: parsed.data.month, amount: parsed.data.amount },
  });

  return NextResponse.json({ budget });
}
