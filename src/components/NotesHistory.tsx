"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";

export default function NotesHistory() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) return;
    setLoading(true);
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .finally(() => setLoading(false));
  }, [session?.user?.email]);

  if (!session?.user?.email) return null;

  return (
    <div className="my-8 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🗂️ Not Geçmişim</h2>
      {loading && <div>Yükleniyor...</div>}
      {notes.length === 0 && !loading && <div>Henüz hiç notunuz yok.</div>}
      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle className="text-base">{new Date(note.createdAt).toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-semibold mb-2">Özet:</div>
              <div className="whitespace-pre-wrap text-gray-700 mb-2">{note.summary}</div>
              <details>
                <summary className="cursor-pointer text-blue-600 underline">Transkript</summary>
                <div className="whitespace-pre-wrap text-gray-500 mt-2">{note.transcript}</div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
