import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/whisper';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Ses dosyası bulunamadı' },
        { status: 400 }
      );
    }

    // File size check (max 25MB for Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük (max 25MB)' },
        { status: 400 }
      );
    }

    const result = await transcribeAudio(audioFile);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transkripsiyon işlemi başarısız' },
      { status: 500 }
    );
  }
}
