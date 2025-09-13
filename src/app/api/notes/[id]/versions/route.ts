import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

// Belirli bir notun sürüm geçmişini getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Notun sahibi mi kontrolü
  const note = await prisma.note.findUnique({ where: { id: params.id } });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!note || !user || note.userId !== user.id) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
  }
  const versions = await prisma.noteVersion.findMany({
    where: { noteId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(versions);
}

// Geri alma (rollback) için POST veya PUT eklenebilir
