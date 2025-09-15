import { NextRequest, NextResponse } from "next/server";

import { processWithGemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const params = await context.params;
  const noteId = params.id;
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) return NextResponse.json({ error: "Not bulunamadı" }, { status: 404 });

  // Gemini ile gerçek soru üretimi
  const geminiResult = await processWithGemini((note.summary || "") + "\n" + (note.transcript || ""), "genel");
  const questions = geminiResult.questions || "";
  await prisma.note.update({ where: { id: noteId }, data: { questions } });
  return NextResponse.json({ questions });
}
