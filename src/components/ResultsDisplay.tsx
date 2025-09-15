
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ProcessedContent {
	summary: string;
	keyPoints: string;
	questions: string;
	actionItems?: string;
	text?: string; // Tam transkript
	id?: string; // Notun id'si (gerekirse)
}



export default function ResultsDisplay({ content }: { content: ProcessedContent }) {
       const [showFullText, setShowFullText] = useState(false);
       const [questions, setQuestions] = useState(content.questions);
       const [loading, setLoading] = useState(false);

       const handleGenerateMoreQuestions = async () => {
	       if (!content.id) {
		       alert('Not kaydedilmedi veya id bulunamadı.');
		       return;
	       }
	       setLoading(true);
	       try {
		       const res = await fetch(`/api/notes/${content.id}/generate-questions`, { method: 'POST' });
		       const data = await res.json();
		       setQuestions(data.questions);
	       } catch (e) {
		       alert('Sorular oluşturulurken bir hata oluştu.');
	       }
	       setLoading(false);
       };

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
					       {questions}
				       </div>
				       {content.id && (
					       <div className="flex justify-end mt-2">
						       <Button onClick={handleGenerateMoreQuestions} disabled={loading} variant="outline" className="text-sm">
							       {loading ? 'Oluşturuluyor...' : 'Daha fazla soru oluştur'}
						       </Button>
					       </div>
				       )}
			       </CardContent>
		       </Card>

		       {/* Tam Metin Göster/Gizle */}
			   {content.text && (
				   <Card>
					   <CardHeader className="flex flex-row items-center justify-between">
						   <CardTitle>📄 Tam Metin</CardTitle>
						   <Button
							   size="sm"
							   variant="outline"
							   className="ml-auto text-sm"
							   onClick={() => setShowFullText((v) => !v)}
						   >
							   {showFullText ? 'Tam Metni Gizle' : 'Tam Metni Göster'}
						   </Button>
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
