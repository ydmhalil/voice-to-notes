import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json(user?.notes ?? []);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { transcript, summary, tags, folder } = body;
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
      transcript,
      summary,
      tags: tags || "",
      folder: folder || null,
      userId: user.id,
    },
  });
  return NextResponse.json(note);
}
