import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

const createCategorySchema = z.object({
  label: z.string().min(1).max(40),
  icon: z.string().min(1).max(8),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default('#9C9488'),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only the owner can manage categories.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please check the category details.' }, { status: 400 });

  const key = parsed.data.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });

  const category = await prisma.category.create({
    data: {
      key: `${key}-${Date.now().toString(36)}`,
      label: parsed.data.label.trim(),
      icon: parsed.data.icon,
      color: parsed.data.color,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
