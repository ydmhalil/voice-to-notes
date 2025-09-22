export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-blue-50">
      <img src="/file.svg" alt="Voice to Notes Logo" className="w-24 h-24 mb-6 opacity-90" />
      <h1 className="text-3xl font-bold mb-4 text-blue-900">VoiceToNotes'a Hoş Geldiniz</h1>
      <p className="mb-6 text-lg text-gray-700 max-w-xl text-center">
        Sesli notlarınızı kolayca metne dönüştürün, düzenleyin ve yönetin. Güçlü arama, etiketleme ve paylaşım özellikleriyle notlarınızı her zaman yanınızda taşıyın.
      </p>
      <div className="text-gray-500 text-base">Devam etmek için yukarıdan giriş yapabilirsiniz.</div>
    </div>
  );
}
