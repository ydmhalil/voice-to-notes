"use client";
import NotesHistory from "@/components/NotesHistory";
import FolderTagManager from "@/components/FolderTagManager";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/welcome");
    }
  }, [session, status, router]);

  if (!session?.user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-2 py-4 sm:px-4 sm:py-8 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center tracking-tight">Notlarım</h1>
      <div className="w-full max-w-6xl flex flex-col sm:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0">
          <NotesHistory />
        </div>
        <aside className="w-full sm:w-80 flex-shrink-0">
          <FolderTagManager />
        </aside>
      </div>
    </div>
  );
}

