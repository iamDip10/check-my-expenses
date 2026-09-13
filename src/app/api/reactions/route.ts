import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { REACTION_SET } from '@/lib/utils';

const reactionSchema = z.object({
  expenseId: z.string().min(1),
  emoji: z.enum(REACTION_SET as [string, ...string[]]),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'MONITOR') {
    return NextResponse.json({ error: 'Only the monitor can react to expenses.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = reactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "That reaction didn't go through." }, { status: 400 });
  }

  const expense = await prisma.expense.findUnique({ where: { id: parsed.data.expenseId } });
  if (!expense) return NextResponse.json({ error: 'Expense not found.' }, { status: 404 });

  const reaction = await prisma.reaction.upsert({
    where: { expenseId_userId: { expenseId: parsed.data.expenseId, userId: user.id } },
    update: { emoji: parsed.data.emoji },
    create: { expenseId: parsed.data.expenseId, userId: user.id, emoji: parsed.data.emoji },
  });

  return NextResponse.json({ reaction });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'MONITOR') {
    return NextResponse.json({ error: 'Only the monitor can remove a reaction.' }, { status: 403 });
  }

  const { expenseId } = await req.json().catch(() => ({ expenseId: null }));
  if (!expenseId) return NextResponse.json({ error: 'Missing expense.' }, { status: 400 });

  await prisma.reaction
    .delete({ where: { expenseId_userId: { expenseId, userId: user.id } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
