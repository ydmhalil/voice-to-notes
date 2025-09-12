import { NextRequest, NextResponse } from 'next/server';
import { processWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { transcript, contentType } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Metin bulunamadı' },
        { status: 400 }
      );
    }

    const result = await processWithGemini(transcript, contentType || 'genel');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Metin işleme başarısız' },
      { status: 500 }
    );
  }
}
