import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioFile: File): Promise<{
	text: string;
	language: string;
	duration: number;
}> {
	try {
		const transcription = await openai.audio.transcriptions.create({
			file: audioFile,
			model: 'whisper-1',
			language: 'tr',
			response_format: 'verbose_json',
			timestamp_granularities: ['segment'],
		});

		return {
			text: transcription.text,
			language: transcription.language || 'tr',
			duration: transcription.duration || 0,
		};
	} catch (error) {
		console.error('Whisper API Error:', error);
		throw new Error('Ses dosyası işlenemedi');
	}
}
