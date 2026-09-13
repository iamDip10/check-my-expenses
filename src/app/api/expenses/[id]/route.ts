import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

const updateExpenseSchema = z.object({
  amount: z.number().int().positive().max(10_000_000).optional(),
  categoryId: z.string().min(1).optional(),
  description: z.string().max(280).optional().nullable(),
  occurredAt: z.string().datetime().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'MOBILE_BANKING', 'OTHER']).optional(),
  travelFrom: z.string().max(120).optional().nullable(),
  travelTo: z.string().max(120).optional().nullable(),
  transportType: z.string().max(60).optional().nullable(),
});

async function assertOwnsExpense(userId: string, id: string) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense || expense.userId !== userId) return null;
  return expense;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expense = await prisma.expense.findUnique({
    where: { id: params.id },
    include: { category: true, reactions: { include: { user: { select: { name: true, role: true } } } } },
  });
  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ expense });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the owner can edit expenses.' }, { status: 403 });
  }

  const owned = await assertOwnsExpense(user.id, params.id);
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Couldn't save these changes." }, { status: 400 });
  }

  const expense = await prisma.expense.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : undefined,
    },
    include: { category: true, reactions: true },
  });

  return NextResponse.json({ expense });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the owner can delete expenses.' }, { status: 403 });
  }

  const owned = await assertOwnsExpense(user.id, params.id);
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
