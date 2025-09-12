import { Button } from '@/components/ui/button';
import { exportToPDF, exportToText } from '@/lib/export';

interface ExportButtonsProps {
	content: any;
	title: string;
}

export default function ExportButtons({ content, title }: ExportButtonsProps) {
	return (
		<div className="flex gap-4 mt-4">
			<Button onClick={() => exportToPDF(content, title)} variant="default">
				PDF Olarak İndir
			</Button>
			<Button onClick={() => exportToText(content, title)} variant="outline">
				TXT Olarak İndir
			</Button>
		</div>
	);
}
