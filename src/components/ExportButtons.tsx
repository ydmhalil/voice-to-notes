

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportToPDF, exportToText } from '@/lib/export';

interface ExportButtonsProps {
  content: any;
  title: string;
}

export default function ExportButtons({ content, title }: ExportButtonsProps) {
	const [copied, setCopied] = useState(false);
	const [shared, setShared] = useState(false);

	// E-posta ile paylaş fonksiyonu
	const handleShareEmail = () => {
		const subject = encodeURIComponent(`${title} - Not`);
		const body = encodeURIComponent(
			`Özet:\n${content.summary}\n\nTranskript:\n${content.transcript || ""}\n\nEtiketler: ${content.tags || ""}\nKlasör: ${content.folder || ""}\nTarih: ${content.createdAt ? new Date(content.createdAt).toLocaleString() : ""}`
		);
		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	};

	// Panoya kopyala
	const handleCopy = async () => {
		let text = `Özet:\n${content.summary}\n\nTranskript:\n${content.transcript || ""}`;
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	// Paylaşım linki (publicShareId varsa)
	const shareUrl = content.publicShareId ? `${window.location.origin}/paylas/${content.publicShareId}` : '';

	// Paylaşım linkini kopyala
	const handleCopyShareLink = async () => {
		if (shareUrl) {
			await navigator.clipboard.writeText(shareUrl);
			setShared(true);
			setTimeout(() => setShared(false), 1500);
		}
	};

	return (
		<div className="flex flex-wrap gap-4 mt-4 items-center">
					<Button onClick={() => exportToPDF(content, title)} variant="outline" className="text-black border-black hover:bg-gray-100">
						PDF Olarak İndir
					</Button>
					<Button onClick={() => exportToText(content, title)} variant="outline" className="text-black border-black hover:bg-gray-100">
						TXT Olarak İndir
					</Button>
					<Button onClick={handleShareEmail} variant="outline" className="text-black border-black hover:bg-gray-100">
						E-posta ile Paylaş
					</Button>
			<Button onClick={handleCopy} variant="outline">
				{copied ? 'Kopyalandı!' : 'Kopyala'}
			</Button>
			{content.publicShareId && (
				<Button onClick={handleCopyShareLink} variant="secondary">
					{shared ? 'Link Kopyalandı!' : 'Paylaş (Link)'}
				</Button>
			)}
		</div>
	);
}
