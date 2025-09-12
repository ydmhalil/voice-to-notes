import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function processWithGemini(transcript: string, contentType: 'ders' | 'toplanti' | 'genel') {
	const prompts = {
		ders: `\nBu bir ders kaydının metnidir. Aşağıdaki formatta analiz et:\n\n## ÖZET\nAna konuları ve kavramları özetle\n\n## ANAHTAR NOKTALAR  \n• Önemli bilgileri listele\n• Her maddeyi tek satırda yaz\n\n## SORULAR VE CEVAPLAR\n1. Soru: [İçerikle ilgili soru]\n   Cevap: [Kısa ve net cevap]\n\n2. Soru: [Başka bir soru]\n   Cevap: [Cevap]\n\n(En az 5 soru-cevap üret)\n\nMetin: ${transcript}\n    `,
		toplanti: `\nBu bir toplantı kaydının metnidir. Aşağıdaki formatta analiz et:\n\n## TOPLANTI ÖZETİ\nToplantının ana konuları ve kararları\n\n## EYLEM NOKTALARI\n• Alınan kararları listele\n• Yapılacaklar listesi\n• Sorumlular (varsa)\n\n## ANAHTAR BULGULAR\n• Önemli görüşler\n• Öne çıkan fikirler  \n\n## SORULAR VE CEVAPLAR\n1. Soru: [Toplantı içeriğiyle ilgili]\n   Cevap: [Net cevap]\n\nMetin: ${transcript}\n    `,
		genel: `\nBu ses kaydının metnidir. Aşağıdaki formatta analiz et:\n\n## GENEL ÖZET\nİçeriğin ana konuları\n\n## ÖNEMLİ NOKTALAR\n• Vurgulanan bilgiler\n• Dikkat çeken detaylar\n\n## SORULAR VE CEVAPLAR  \n1. Soru: [İçerikle ilgili]\n   Cevap: [Cevap]\n\nMetin: ${transcript}\n    `
	};

	try {
		const result = await model.generateContent(prompts[contentType]);
		const response = await result.response;
		const text = response.text();
    
		return parseGeminiResponse(text);
	} catch (error) {
		console.error('Gemini API Error:', error);
		throw new Error('Metin işleme başarısız');
	}
}

function parseGeminiResponse(text: string) {
	const sections = text.split('## ');
  
	return {
		summary: extractSection(sections, 'ÖZET') || extractSection(sections, 'TOPLANTI ÖZETİ') || extractSection(sections, 'GENEL ÖZET'),
		keyPoints: extractSection(sections, 'ANAHTAR NOKTALAR') || extractSection(sections, 'EYLEM NOKTALARI') || extractSection(sections, 'ÖNEMLİ NOKTALAR'),
		questions: extractSection(sections, 'SORULAR VE CEVAPLAR'),
		actionItems: extractSection(sections, 'EYLEM NOKTALARI'),
	};
}

function extractSection(sections: string[], sectionName: string): string | null {
	const section = sections.find(s => s.startsWith(sectionName));
	return section ? section.replace(sectionName, '').trim() : null;
}
