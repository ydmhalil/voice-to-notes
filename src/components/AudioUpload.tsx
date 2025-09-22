
"use client";


import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import ResultsDisplay from '@/components/ResultsDisplay';
import ExportButtons from '@/components/ExportButtons';


export default function AudioUpload() {
	// State tanımları
	const [contentType, setContentType] = useState<'ders' | 'toplanti' | 'genel'>('ders');
	const [isRecording, setIsRecording] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [folder, setFolder] = useState('');
	const [allFolders, setAllFolders] = useState<string[]>([]);
	const [tags, setTags] = useState('');
	const [allTags, setAllTags] = useState<{id: string, name: string}[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<any>(null);
	const [transcript, setTranscript] = useState<string | null>(null);

	// MediaRecorder referansları
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);

	// Klasör ve etiketleri yükle (örnek, backend'den fetch ile güncellenebilir)
	useEffect(() => {
		// TODO: API'den klasör ve etiketleri çek
		setAllFolders(['Genel', 'Dersler', 'Toplantılar']);
		setAllTags([
			{ id: '1', name: 'önemli' },
			{ id: '2', name: 'acil' },
			{ id: '3', name: 'ders' },
		]);
	}, []);

	// Ses kaydını başlat
	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorderRef.current = new MediaRecorder(stream);
			audioChunksRef.current = [];
			mediaRecorderRef.current.ondataavailable = (e) => {
				if (e.data.size > 0) audioChunksRef.current.push(e.data);
			};
			mediaRecorderRef.current.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
				const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
				setAudioFile(file);
				stream.getTracks().forEach((track) => track.stop());
			};
			mediaRecorderRef.current.start();
			setIsRecording(true);
		} catch (err) {
			setError('Mikrofona erişilemiyor.');
		}
	};

	// Ses kaydını durdur
	const stopRecording = () => {
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
		}
	};

	// Dosya yükleme
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		// Format kontrolü
		const allowedTypes = [
			'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/webm', 'audio/x-wav'
		];
		if (!allowedTypes.includes(file.type)) {
			setError('Desteklenmeyen dosya formatı. Lütfen MP3, WAV, M4A veya benzeri bir ses dosyası yükleyin.');
			setAudioFile(null);
			return;
		}
		// Boyut kontrolü (ör: max 25MB)
		if (file.size > 25 * 1024 * 1024) {
			setError('Dosya boyutu çok büyük. Maksimum 25MB olabilir.');
			setAudioFile(null);
			return;
		}
		setError(null);
		setAudioFile(file);
		setResult(null);
		setTranscript(null);
	};

	// Transkripsiyon ve işleme
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
				body: formData
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

	// Notu işleme ve kaydetme
	const handleProcess = async (text: string) => {
		setProcessing(true);
		setError(null);
		try {
			const res = await fetch("/api/process", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ transcript: text, contentType, tags, folder }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "İşleme hatası");

			const saveRes = await fetch("/api/notes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: '',
					transcript: text,
					summary: data.summary,
					keyPoints: data.keyPoints,
					questions: data.questions,
					actionItems: data.actionItems,
					tags,
					folder
				})
			});
			const savedNote = await saveRes.json();
			if (!saveRes.ok) throw new Error(savedNote.error || "Not kaydedilemedi");
			setResult(savedNote);
		} catch (err: any) {
			setError(err.message || "Bir hata oluştu");
		} finally {
			setProcessing(false);
		}
	};

	return (
		<Card className="p-3 sm:p-5 w-full max-w-full sm:max-w-xl mx-auto shadow-lg border border-gray-200">
			<div className="space-y-3 sm:space-y-4 text-base sm:text-[1rem]">
				{/* Content Type Selector */}
				<div className="flex gap-1 sm:gap-2 justify-center mb-2 flex-wrap">
					<Button
						variant="default"
						onClick={() => setContentType('ders')}
						className={contentType === 'ders'
							? 'bg-black text-white border-black hover:bg-black hover:text-white'
							: 'bg-white text-black border-black hover:bg-gray-100'}
					>Ders</Button>
					<Button
						variant="default"
						onClick={() => setContentType('toplanti')}
						className={contentType === 'toplanti'
							? 'bg-black text-white border-black hover:bg-black hover:text-white'
							: 'bg-white text-black border-black hover:bg-gray-100'}
					>Toplantı</Button>
					<Button
						variant="default"
						onClick={() => setContentType('genel')}
						className={contentType === 'genel'
							? 'bg-black text-white border-black hover:bg-black hover:text-white'
							: 'bg-white text-black border-black hover:bg-gray-100'}
					>Genel</Button>
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

				{/* File Upload - Buton Stili */}
				<div className="flex flex-col items-center gap-2">
					<label htmlFor="audio-upload" className="w-full flex justify-center">
						<Button
							asChild
							variant="default"
							className={
								'w-48 text-base py-2 cursor-pointer ' +
								(contentType === 'ders' || contentType === 'toplanti' || contentType === 'genel')
									? (contentType === 'ders'
										? (contentType === 'ders' ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'bg-white text-black border-black hover:bg-gray-100')
										: contentType === 'toplanti'
										? (contentType === 'toplanti' ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'bg-white text-black border-black hover:bg-gray-100')
										: (contentType === 'genel' ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'bg-white text-black border-black hover:bg-gray-100'))
									: 'bg-white text-black border-black hover:bg-gray-100'
							}
							disabled={processing}
						>
							<span>
								{contentType === 'ders' && 'Ders Dosyası Seç'}
								{contentType === 'toplanti' && 'Toplantı Dosyası Seç'}
								{contentType === 'genel' && 'Genel Dosya Seç'}
							</span>
						</Button>
						<input
							id="audio-upload"
							type="file"
							accept="audio/*"
							onChange={handleFileUpload}
							className="hidden"
							disabled={processing}
						/>
					</label>
					<div className="text-gray-700 text-base min-h-[1.5rem]">
						{audioFile ? `Seçilen dosya: ${audioFile.name}` : 'Dosya seçilmedi.'}
					</div>
				</div>

				{/* Selected File Info */}
				{audioFile && (
					<div className="bg-gray-100 p-2 sm:p-3 rounded flex flex-col gap-2">
						<p>Seçilen dosya: {audioFile?.name}</p>
						<p>Boyut: {audioFile ? (audioFile.size / 1024 / 1024).toFixed(2) : ''} MB</p>
						{/* Audio player */}
						{audioFile && (
							<audio
								controls
								src={URL.createObjectURL(audioFile)}
								className="w-full mt-2"
							>
								Tarayıcınız audio etiketini desteklemiyor.
							</audio>
						)}
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
										<option key={tag.id} value={tag.name}>{tag.name}</option>
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
							{processing ? 'İşleniyor...' : 'Sesi Yazıya Çevir ve Notları Oluştur'}
						</Button>
						{processing && <div className="text-center text-gray-500">Yükleniyor...</div>}
					</div>
				)}

				{/* Progress indicator (global, eğer dosya seçili değilse de göster) */}
				{processing && !audioFile && <div className="text-center text-gray-500">Yükleniyor...</div>}

				{/* Error */}
				{error && <div className="text-red-500 text-center">{error}</div>}

				{/* Sonuç */}
				{result && (
					<div className="mt-6">
						<ResultsDisplay content={{ ...result, text: transcript, id: result?.id }} />
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
