import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOwnerId, getSessionUser } from '@/lib/session';

const createExpenseSchema = z.object({
  amount: z.number().int().positive().max(10_000_000),
  categoryId: z.string().min(1),
  description: z.string().max(280).optional().nullable(),
  occurredAt: z.string().datetime().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'MOBILE_BANKING', 'OTHER']).optional(),
  travelFrom: z.string().max(120).optional().nullable(),
  travelTo: z.string().max(120).optional().nullable(),
  transportType: z.string().max(60).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const categoryKey = searchParams.get('category');
  const limit = Number(searchParams.get('limit') ?? '100');

  const ownerId = await getOwnerId();

  const expenses = await prisma.expense.findMany({
    where: {
      userId: ownerId,
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(categoryKey ? { category: { key: categoryKey } } : {}),
    },
    include: {
      category: true,
      reactions: { include: { user: { select: { name: true, role: true } } } },
    },
    orderBy: { occurredAt: 'desc' },
    take: Math.min(limit, 500),
  });

  return NextResponse.json({ expenses });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the owner can add expenses.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the expense details." }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: 'Unknown category.' }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      userId: user.id,
      amount: parsed.data.amount,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description ?? null,
      occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date(),
      paymentMethod: parsed.data.paymentMethod ?? 'OTHER',
      travelFrom: parsed.data.travelFrom ?? null,
      travelTo: parsed.data.travelTo ?? null,
      transportType: parsed.data.transportType ?? null,
    },
    include: { category: true, reactions: true },
  });

  return NextResponse.json({ expense }, { status: 201 });
}
