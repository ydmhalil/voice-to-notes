
'use client';


import { useState, useRef, useEffect } from 'react';
// Klasör ve etiketleri API'den çekmek için yardımcı fonksiyonlar
async function fetchFolders(): Promise<string[]> {
	const res = await fetch('/api/folders');
	if (!res.ok) return [];
	return await res.json();
}
async function fetchTags(): Promise<string[]> {
	const res = await fetch('/api/tags');
	if (!res.ok) return [];
	return await res.json();
}
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function Spinner() {
	return (
		<div className="flex justify-center items-center mt-4">
			<svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
				<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
			</svg>
		</div>
	);
}
import ResultsDisplay from './ResultsDisplay';
import ExportButtons from './ExportButtons';

export default function AudioUpload() {
	const { data: session } = useSession();
	const [isRecording, setIsRecording] = useState(false);
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [transcript, setTranscript] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<any>(null);
	const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
	const [contentType, setContentType] = useState<'ders' | 'toplanti' | 'genel'>('genel');
		const [tags, setTags] = useState("");
		const [folder, setFolder] = useState("");
		const [allFolders, setAllFolders] = useState<string[]>([]);
		const [allTags, setAllTags] = useState<string[]>([]);
	// Klasör ve etiketleri yükle
	useEffect(() => {
		fetchFolders().then(setAllFolders);
		fetchTags().then(setAllTags);
	}, []);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ 
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					sampleRate: 44100,
				}
			});
			mediaRecorderRef.current = new MediaRecorder(stream);
			audioChunksRef.current = [];
			mediaRecorderRef.current.ondataavailable = (event) => {
				audioChunksRef.current.push(event.data);
			};
			mediaRecorderRef.current.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, { 
					type: 'audio/wav' 
				});
				const audioFile = new File([audioBlob], 'recording.wav', { 
					type: 'audio/wav' 
				});
				setAudioFile(audioFile);
				stream.getTracks().forEach(track => track.stop());
			};
			mediaRecorderRef.current.start();
			setIsRecording(true);
		} catch (error) {
			console.error('Error accessing microphone:', error);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		// Format kontrolü
		const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/webm', 'audio/x-wav'];
		if (!allowedTypes.includes(file.type)) {
			setError('Desteklenmeyen dosya formatı. Lütfen MP3, WAV, M4A veya benzeri bir ses dosyası yükleyin.');
			setAudioFile(null);
			return;
		}
		// Boyut kontrolü (Whisper için max 25MB)
		if (file.size > 25 * 1024 * 1024) {
			setError('Dosya boyutu çok büyük. Maksimum 25MB olabilir.');
			setAudioFile(null);
			return;
		}
		setError(null);
		setAudioFile(file);
	};

	const handleTranscribe = async () => {
		if (!audioFile) return;
		setProcessing(true);
		setError(null);
		setTranscript(null);
		setResult(null);
		try {
			const formData = new FormData();
			formData.append('audio', audioFile);
			const res = await fetch('/api/transcribe', {
				method: 'POST',
				body: formData,
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Transkripsiyon hatası');
			setTranscript(data.text);
			await handleProcess(data.text);
		} catch (err: any) {
			setError(err.message || 'Bir hata oluştu');
		} finally {
			setProcessing(false);
		}
	};

		const handleProcess = async (text: string) => {
			setProcessing(true);
			setError(null);
			try {
				const res = await fetch('/api/process', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ transcript: text, contentType }),
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || 'İşleme hatası');
				setResult(data);

				// Parse and set suggested tags from Gemini
				if (data.suggestedTags) {
					const tagList = data.suggestedTags
						.split(',')
						.map((t: string) => t.trim())
						.filter(Boolean);
					setSuggestedTags(tagList);
				} else {
					setSuggestedTags([]);
				}

				// Kullanıcı giriş yaptıysa notu kaydet
				if (session?.user?.email) {
					await fetch('/api/notes', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							transcript: text,
							summary: data.summary,
							keyPoints: data.keyPoints || '',
							questions: data.questions || '',
							actionItems: data.actionItems || '',
							tags,
							folder
						}),
					});
				}
			} catch (err: any) {
				setError(err.message || 'Bir hata oluştu');
			} finally {
				setProcessing(false);
			}
		};

		return (
			<Card className="p-3 sm:p-5 w-full max-w-full sm:max-w-xl mx-auto shadow-lg border border-gray-200">
				<div className="space-y-3 sm:space-y-4 text-base sm:text-[1rem]">
				{/* Content Type Selector */}
				<div className="flex gap-1 sm:gap-2 justify-center mb-2 flex-wrap">
					<Button variant={contentType === 'ders' ? 'default' : 'outline'} onClick={() => setContentType('ders')}>Ders</Button>
					<Button variant={contentType === 'toplanti' ? 'default' : 'outline'} onClick={() => setContentType('toplanti')}>Toplantı</Button>
					<Button variant={contentType === 'genel' ? 'default' : 'outline'} onClick={() => setContentType('genel')}>Genel</Button>
				</div>

				{/* Recording Section */}
				<div className="text-center">
					<Button
						onClick={isRecording ? stopRecording : startRecording}
						variant={isRecording ? "destructive" : "default"}
						className="w-32"
						disabled={processing}
					>
						{isRecording ? 'Durdur' : 'Kayıt Başlat'}
					</Button>
				</div>

				{/* Divider */}
				<div className="text-center text-gray-500 text-sm">veya</div>

				{/* File Upload */}
				<div>
					<input
						type="file"
						accept="audio/*"
						onChange={handleFileUpload}
						className="w-full"
						disabled={processing}
					/>
				</div>

										{/* Selected File Info */}
										{audioFile && (
											<div className="bg-gray-100 p-2 sm:p-3 rounded flex flex-col gap-2">
												<p>Seçilen dosya: {audioFile.name}</p>
												<p>Boyut: {(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
												{/* Audio player */}
												<audio
													controls
													src={URL.createObjectURL(audioFile)}
													className="w-full mt-2"
												>
													Tarayıcınız audio etiketini desteklemiyor.
												</audio>
																		<div className="flex flex-col gap-2">
																			<div>
																				<label className="block text-xs mb-1">Klasör:</label>
																				<select
																					value={folder}
																					onChange={e => setFolder(e.target.value)}
																					className="border rounded px-2 py-1 w-full"
																					disabled={processing}
																				>
																					<option value="">Klasör seçin veya yazın</option>
																					{allFolders.map(f => (
																						<option key={f} value={f}>{f}</option>
																					))}
																				</select>
																				<Input
																					placeholder="Yeni klasör ekle (yazıp Enter'a bas)"
																					value={folder}
																					onChange={e => setFolder(e.target.value)}
																					onKeyDown={e => {
																						if (e.key === 'Enter') e.preventDefault();
																					}}
																					disabled={processing}
																					className="mt-1"
																				/>
																			</div>
																			<div>
																				<label className="block text-xs mb-1">Etiketler:</label>
																				<select
																					multiple
																					value={tags.split(",").map(t => t.trim()).filter(Boolean)}
																					onChange={e => {
																						const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
																						setTags(selected.join(", "));
																					}}
																					className="border rounded px-2 py-1 w-full"
																					disabled={processing}
																				>
																					{allTags.map(tag => (
																						<option key={tag} value={tag}>{tag}</option>
																					))}
																				</select>
																				<Input
																					placeholder="Yeni etiket ekle (virgülle ayır)"
																					value={tags}
																					onChange={e => setTags(e.target.value)}
																					disabled={processing}
																					className="mt-1"
																				/>
																			</div>
																		</div>
												<Button onClick={handleTranscribe} disabled={processing} className="w-full mt-2 text-base py-2">
													{processing ? 'İşleniyor...' : 'Transkribe & Özetle'}
												</Button>
												{processing && <Spinner />}
											</div>
										)}

				{/* Progress indicator (global, eğer dosya seçili değilse de göster) */}
				{processing && !audioFile && <Spinner />}

				{/* Error */}
				{error && <div className="text-red-500 text-center">{error}</div>}

				{/* Sonuç */}
				{result && (
					<div className="mt-6">
						{/* Gemini önerilen etiketler */}
						{suggestedTags.length > 0 && (
							<div className="mb-4">
								<div className="font-semibold mb-1">🤖 Önerilen Etiketler:</div>
								<div className="flex flex-wrap gap-2">
									{suggestedTags.map((tag) => (
										<button
											key={tag}
											type="button"
											className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs hover:bg-blue-200"
											onClick={() => {
												// Add tag to tags field if not already present
												const current = tags.split(',').map(t => t.trim()).filter(Boolean);
												if (!current.includes(tag)) {
													setTags(current.concat(tag).join(', '));
												}
											}}
										>
											#{tag}
										</button>
									))}
								</div>
								<div className="text-xs text-gray-500 mt-1">Bir etikete tıklayarak ekleyebilirsiniz.</div>
							</div>
						)}
						<ResultsDisplay content={{ ...result, text: transcript }} />
						<ExportButtons content={{
							...result,
							summary: result.summary || '',
							keyPoints: result.keyPoints || '',
							questions: result.questions || '',
							actionItems: result.actionItems || '',
							text: transcript || ''
						}} title={audioFile?.name.replace(/\.[^/.]+$/, '') || 'notlar'} />
					</div>
				)}
			</div>
		</Card>
	);
}
