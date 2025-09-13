


import AudioUpload from "@/components/AudioUpload";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-2 py-4 sm:px-4 sm:py-8 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center tracking-tight">VoiceToNotes</h1>
      <div className="w-full max-w-md sm:max-w-xl flex flex-col gap-6">
        <AudioUpload />
      </div>
    </div>
  );
}
