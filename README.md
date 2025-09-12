
# VoiceToNotes

Akıllı Ses Notu Asistanı (MVP)

## Özellikler
- Ses dosyası yükleme veya tarayıcıdan kayıt
- Whisper API ile otomatik transkripsiyon (OpenAI)
- Gemini API ile özetleme ve soru-cevap (Google)
- Sonuçları PDF/TXT olarak dışa aktarma
- Mobil ve responsive tasarım

## Kurulum
1. Depoyu klonla veya indir:
	```bash
	git clone <repo-url>
	cd voice-to-notes
	```
2. Gerekli paketleri yükle:
	```bash
	npm install
	```
3. `.env.local` dosyasını oluştur ve API anahtarlarını ekle:
	```env
	OPENAI_API_KEY=senin_openai_anahtarın
	GOOGLE_AI_API_KEY=senin_gemini_anahtarın
	NEXTAUTH_SECRET=herhangi_bir_gizli_değer
	```
4. Geliştirme sunucusunu başlat:
	```bash
	npm run dev
	```
5. Tarayıcıda `http://localhost:3000` adresine git.

## Kullanım
- Ses dosyası yükle veya kayıt başlat.
- İçerik tipini seç (Ders, Toplantı, Genel).
- "Transkribe & Özetle" butonuna tıkla.
- Sonuçları ekranda görüntüle ve istersen PDF/TXT olarak indir.


