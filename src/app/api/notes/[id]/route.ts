import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Notun sahibi mi kontrolü
  const note = await prisma.note.findUnique({ where: { id: params.id } });
  if (!note) {
    return NextResponse.json({ error: "Not bulunamadı" }, { status: 404 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || note.userId !== user.id) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
  }
  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { summary, transcript } = body;
  if (!summary || !transcript) {
    return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  }
  // Notun sahibi mi kontrolü
  const note = await prisma.note.findUnique({ where: { id: params.id } });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!note || !user || note.userId !== user.id) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
  }
  const updated = await prisma.note.update({
    where: { id: params.id },
    data: { summary, transcript },
  });
  return NextResponse.json(updated);
}
