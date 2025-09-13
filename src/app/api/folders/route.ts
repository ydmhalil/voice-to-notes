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
  // Kullanıcının notlarındaki klasörleri distinct olarak getir
  const folders = await prisma.note.findMany({
    where: { user: { email: session.user.email } },
    select: { folder: true },
    distinct: ["folder"],
  });
  // Sadece null olmayan ve boş olmayan klasör isimleri
  const folderList = folders.map(f => f.folder).filter(f => !!f);
  return NextResponse.json(folderList);
}

// Klasör ekleme/silme işlemleri için POST/DELETE endpointleri eklenebilir (notlar üzerinden yönetim yapılacak)
