import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

// POST /api/notes/[id]/share - set publicShareId
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { publicShareId } = body;
  if (!publicShareId) {
    return NextResponse.json({ error: 'Eksik publicShareId' }, { status: 400 });
  }
  // Notun sahibi mi kontrolü
  const note = await prisma.note.findUnique({ where: { id: params.id } });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!note || !user || note.userId !== user.id) {
    return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
  }
  await prisma.note.update({
    where: { id: params.id },
    data: { publicShareId },
  });
  return NextResponse.json({ success: true });
}

// PATCH /api/notes/[id]/share - update sharedWith (private sharing)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { sharedWith } = body;
  if (!sharedWith) {
    return NextResponse.json({ error: 'Eksik sharedWith' }, { status: 400 });
  }
  // Notun sahibi mi kontrolü
  const note = await prisma.note.findUnique({ where: { id: params.id } });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!note || !user || note.userId !== user.id) {
    return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
  }
  await prisma.note.update({
    where: { id: params.id },
    data: { sharedWith },
  });
  return NextResponse.json({ success: true });
}
