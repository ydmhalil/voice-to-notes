

import AudioUpload from "@/components/AudioUpload";
import NotesHistory from "@/components/NotesHistory";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 py-6 sm:px-4 sm:py-10 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center tracking-tight">VoiceToNotes</h1>
      <AudioUpload />
      <NotesHistory />
    </div>
  );
}
