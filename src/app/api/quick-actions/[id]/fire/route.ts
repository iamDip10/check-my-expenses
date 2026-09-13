import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (user.role !== 'OWNER') {
    return NextResponse.json(
      { error: 'Only the owner can log expenses.' },
      { status: 403 }
    );
  }

  const { id } = await params;

  const quickAction = await prisma.quickAction.findUnique({
    where: { id },
  });

  if (!quickAction || quickAction.userId !== user.id) {
    return NextResponse.json(
      { error: 'Quick action not found.' },
      { status: 404 }
    );
  }

  const expense = await prisma.expense.create({
    data: {
      userId: user.id,
      amount: quickAction.amount,
      categoryId: quickAction.categoryId,
      description: quickAction.label,
      occurredAt: new Date(),
      paymentMethod: 'OTHER',
    },
    include: {
      category: true,
      reactions: true,
    },
  });

  return NextResponse.json(
    { expense },
    { status: 201 }
  );
}