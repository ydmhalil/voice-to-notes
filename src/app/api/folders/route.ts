import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

// Kullanıcının tüm klasörlerini getir
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Kullanıcının Folder tablosundaki klasörlerini getir
  const folders = await prisma.folder.findMany({
    where: { user: { email: session.user.email } },
    select: { name: true, id: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(folders);
}


// Klasör ekle
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { folder } = await req.json();
  if (!folder) return NextResponse.json({ error: "Klasör ismi gerekli" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  // Hem frontend hem backend güvenliği için burada da split
  const folderArr = folder.split(",").map((f: string) => f.trim()).filter(Boolean);
  for (const f of folderArr) {
    const exists = await prisma.folder.findFirst({ where: { name: f, userId: user.id } });
    if (!exists) {
      await prisma.folder.create({
        data: {
          name: f,
          user: { connect: { email: session.user.email } },
        },
      });
    }
  }
  return NextResponse.json({ success: true });
}

// Klasör sil (tüm notlardan bu klasörü kaldır)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");
  if (!folder) return NextResponse.json({ error: "Klasör ismi gerekli" }, { status: 400 });
  // Folder tablosundan sil
  await prisma.folder.deleteMany({
    where: { name: folder, user: { email: session.user.email } },
  });
  // İlgili klasörü tüm notlardan da sil
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (user) {
    await prisma.note.updateMany({
      where: { userId: user.id, folder },
      data: { folder: null },
    });
  }
  return NextResponse.json({ success: true });
}
