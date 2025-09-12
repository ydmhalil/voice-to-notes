import jsPDF from 'jspdf';

export function exportToPDF(content: any, title: string) {
	const doc = new jsPDF();
	doc.setFontSize(20);
	doc.text(title, 20, 20);
	doc.setFontSize(12);
	let yPosition = 40;
	doc.setFontSize(16);
	doc.text('ÖZET', 20, yPosition);
	yPosition += 10;
	doc.setFontSize(12);
	const summaryLines = doc.splitTextToSize(content.summary, 170);
	doc.text(summaryLines, 20, yPosition);
	yPosition += summaryLines.length * 5 + 10;
	doc.setFontSize(16);
	doc.text('ÖNEMLİ NOKTALAR', 20, yPosition);
	yPosition += 10;
	doc.setFontSize(12);
	const keyPointsLines = doc.splitTextToSize(content.keyPoints, 170);
	doc.text(keyPointsLines, 20, yPosition);
	yPosition += keyPointsLines.length * 5 + 10;
	if (yPosition > 250) {
		doc.addPage();
		yPosition = 20;
	}
	doc.setFontSize(16);
	doc.text('SORULAR VE CEVAPLAR', 20, yPosition);
	yPosition += 10;
	doc.setFontSize(12);
	const questionsLines = doc.splitTextToSize(content.questions, 170);
	doc.text(questionsLines, 20, yPosition);
	doc.save(`${title}-notlar.pdf`);
}

export function exportToText(content: any, title: string) {
	const textContent = `\n${title}\n${'='.repeat(title.length)}\n\nÖZET\n----\n${content.summary}\n\nÖNEMLİ NOKTALAR\n---------------\n${content.keyPoints}\n\n${content.actionItems ? `EYLEM NOKTALARI\n---------------\n${content.actionItems}\n\n` : ''}\nSORULAR VE CEVAPLAR\n-------------------\n${content.questions}\n\n---\nOluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`;
	const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `${title}-notlar.txt`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
