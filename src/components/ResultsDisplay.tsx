import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


import { useState } from 'react';

interface ProcessedContent {
	summary: string;
	keyPoints: string;
	questions: string;
	actionItems?: string;
	text?: string; // Tam transkript
}


export default function ResultsDisplay({ content }: { content: ProcessedContent }) {
	const [showFullText, setShowFullText] = useState(false);

	return (
		<div className="space-y-6">
			{/* Özet */}
			<Card>
				<CardHeader>
					<CardTitle>📝 Özet</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="whitespace-pre-wrap text-gray-700">
						{content.summary}
					</div>
				</CardContent>
			</Card>

			{/* Anahtar Noktalar */}
			<Card>
				<CardHeader>
					<CardTitle>🎯 Önemli Noktalar</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="whitespace-pre-wrap text-gray-700">
						{content.keyPoints}
					</div>
				</CardContent>
			</Card>

			{/* Eylem Noktaları (Toplantı için) */}
			{content.actionItems && (
				<Card>
					<CardHeader>
						<CardTitle>✅ Eylem Noktaları</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="whitespace-pre-wrap text-gray-700">
							{content.actionItems}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Sorular ve Cevaplar */}
			<Card>
				<CardHeader>
					<CardTitle>❓ Sorular ve Cevaplar</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="whitespace-pre-wrap text-gray-700">
						{content.questions}
					</div>
				</CardContent>
			</Card>

			{/* Tam Metin Göster/Gizle */}
			{content.text && (
				<Card>
					<CardHeader>
						<CardTitle>
							<button
								className="text-blue-600 underline text-base font-medium hover:text-blue-800 transition"
								onClick={() => setShowFullText((v) => !v)}
							>
								{showFullText ? 'Tam Metni Gizle' : 'Tam Metni Göster'}
							</button>
						</CardTitle>
					</CardHeader>
					{showFullText && (
						<CardContent>
							<div className="whitespace-pre-wrap text-gray-700 max-h-96 overflow-auto border-t pt-2">
								{content.text}
							</div>
						</CardContent>
					)}
				</Card>
			)}
		</div>
	);
}
