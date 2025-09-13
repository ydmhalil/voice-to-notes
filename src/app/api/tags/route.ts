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
  // Kullanıcının notlarındaki tüm etiketleri topla
  const notes = await prisma.note.findMany({
    where: { user: { email: session.user.email } },
    select: { tags: true },
  });
  // Virgülle ayrılmış etiketleri ayıkla ve benzersiz liste oluştur
  const tagSet = new Set<string>();
  notes.forEach(n => {
    (n.tags || "").split(",").map(t => t.trim()).filter(Boolean).forEach(t => tagSet.add(t));
  });
  return NextResponse.json(Array.from(tagSet));
}

// Etiket ekleme/silme işlemleri için POST/DELETE endpointleri eklenebilir (notlar üzerinden yönetim yapılacak)
