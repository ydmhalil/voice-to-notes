import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Query parametrelerini al
  const { searchParams } = new URL(req.url);
  const tags = searchParams.get("tags"); // virgülle ayrılmış string
  const folder = searchParams.get("folder");
  const starred = searchParams.get("starred"); // "true" veya "false"
  const dateFrom = searchParams.get("dateFrom"); // ISO string
  const dateTo = searchParams.get("dateTo"); // ISO string

  // Filtre objesini oluştur
  const noteWhere: any = {
    user: { email: session.user.email },
  };
  if (tags) {
    // Her bir etiketi içeren notları getir (AND)
    const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
    noteWhere.AND = tagList.map((tag: string) => ({ tags: { contains: tag } }));
  }
  if (folder) {
    noteWhere.folder = folder;
  }
  if (starred === "true" || starred === "false") {
    noteWhere.starred = starred === "true";
  }
  if (dateFrom || dateTo) {
    noteWhere.createdAt = {};
    if (dateFrom) noteWhere.createdAt.gte = new Date(dateFrom);
    if (dateTo) noteWhere.createdAt.lte = new Date(dateTo);
  }

  // Notları filtrele ve sırala
  const notes = await prisma.note.findMany({
    where: noteWhere,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title, transcript, summary, keyPoints, questions, actionItems, tags, folder } = body;
  if (!transcript || !summary) {
    return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
  }
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });
  const note = await prisma.note.create({
    data: {
      title: title || "",
      transcript,
      summary,
      keyPoints: keyPoints || "",
      questions: questions || "",
      actionItems: actionItems || null,
      tags: tags || "",
      folder: folder || null,
      userId: user.id,
    },
  });
  return NextResponse.json(note);
}
