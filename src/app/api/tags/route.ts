import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

// Kullanıcının tüm etiketlerini getir
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Kullanıcının Tag tablosundaki etiketlerini getir
  const tags = await prisma.tag.findMany({
    where: { user: { email: session.user.email } },
    select: { name: true, id: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tags);
}


// Etiket ekle
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { tag } = await req.json();
  if (!tag) return NextResponse.json({ error: "Etiket ismi gerekli" }, { status: 400 });
  // Etiket ekle
  await prisma.tag.create({
    data: {
      name: tag,
      user: { connect: { email: session.user.email } },
    },
  });
  return NextResponse.json({ success: true });
}

// Etiket sil (tüm notlardan bu etiketi kaldır)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  if (!tag) return NextResponse.json({ error: "Etiket ismi gerekli" }, { status: 400 });
  // Tag tablosundan sil
  await prisma.tag.deleteMany({
    where: { name: tag, user: { email: session.user.email } },
  });
  // İlgili etiketi tüm notlardan da sil
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (user) {
    const notes = await prisma.note.findMany({ where: { userId: user.id } });
    for (const note of notes) {
      if (!note.tags) continue;
      const tagList = note.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t && t !== tag);
      await prisma.note.update({ where: { id: note.id }, data: { tags: tagList.join(",") } });
    }
  }
  return NextResponse.json({ success: true });
}
