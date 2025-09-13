import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

// GET /api/notes/share/[publicShareId]
export async function GET(
  req: NextRequest,
  { params }: { params: { publicShareId: string } }
) {
  const { publicShareId } = params;
  if (!publicShareId) {
    return NextResponse.json({ error: 'Geçersiz bağlantı.' }, { status: 400 });
  }
  const note = await prisma.note.findUnique({
    where: { publicShareId },
    select: {
      id: true,
      summary: true,
      transcript: true,
      tags: true,
      folder: true,
      createdAt: true,
      user: { select: { name: true } },
      sharedWith: true,
    },
  });
  if (!note) {
    return NextResponse.json({ error: 'Not bulunamadı.' }, { status: 404 });
  }
  // Eğer özel paylaşım varsa, erişim kontrolü yap
  if (note.sharedWith && note.sharedWith.trim() !== "") {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || "";
    const allowed = userEmail && note.sharedWith.split(',').map((e: string) => e.trim()).includes(userEmail);
    if (!userEmail || !allowed) {
      return NextResponse.json({ error: 'Bu notu görüntüleme yetkiniz yok.' }, { status: 403 });
    }
  }
  // sharedWith bilgisini frontend'e göndermiyoruz
  const { sharedWith, ...publicNote } = note;
  return NextResponse.json(publicNote);
}
