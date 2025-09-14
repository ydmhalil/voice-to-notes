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
  const { title, summary, transcript, keyPoints, questions, actionItems, tags, folder } = body;
  if (!summary || !transcript) {
    return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  }
  // Notun sahibi mi kontrolü
  const note = await prisma.note.findUnique({ where: { id: params.id } });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!note || !user || note.userId !== user.id) {
    return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
  }
  // Eski sürümü NoteVersion tablosuna kaydet
  await prisma.noteVersion.create({
    data: {
      noteId: note.id,
      transcript: note.transcript,
      summary: note.summary,
      tags: note.tags,
      folder: note.folder,
      starred: note.starred,
    },
  });
  // Klasör(ler) yeni ise Folder tablosuna ekle (virgülle ayrılmışsa hepsini ekle)
  if (folder && folder.trim()) {
    const folderArr = folder.split(",").map((f: string) => f.trim()).filter(Boolean);
    for (const f of folderArr) {
      const existingFolder = await prisma.folder.findFirst({ where: { name: f, userId: user.id } });
      if (!existingFolder) {
        await prisma.folder.create({ data: { name: f, userId: user.id } });
      }
    }
  }
  // Etiket(ler) yeni ise Tag tablosuna ekle
  if (tags && typeof tags === "string") {
    const tagArr = tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    for (const tag of tagArr) {
      const existingTag = await prisma.tag.findFirst({ where: { name: tag, userId: user.id } });
      if (!existingTag) {
        await prisma.tag.create({ data: { name: tag, userId: user.id } });
      }
    }
  }
  // Notu güncelle
  const updated = await prisma.note.update({
    where: { id: params.id },
    data: {
      title: title ?? note.title,
      summary,
      transcript,
      keyPoints: keyPoints ?? note.keyPoints,
      questions: questions ?? note.questions,
      actionItems: actionItems ?? note.actionItems,
      tags: tags ?? note.tags,
      folder: folder ?? note.folder,
    },
  });
  return NextResponse.json(updated);
}
