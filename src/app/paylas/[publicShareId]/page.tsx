import React from 'react';
import { notFound } from 'next/navigation';

async function getNote(publicShareId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/notes/share/${publicShareId}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicNotePage({ params }: { params: { publicShareId: string } }) {
  const note = await getNote(params.publicShareId);
  if (!note) return notFound();
  return (
    <main className="max-w-xl mx-auto my-8 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2">📝 Paylaşılan Not</h1>
      <div className="text-xs text-gray-500 mb-4">Oluşturan: {note.user?.name || 'Bilinmiyor'} | {new Date(note.createdAt).toLocaleString()}</div>
      <div className="mb-4">
        <div className="font-semibold mb-1">Özet:</div>
        <div className="whitespace-pre-wrap text-gray-700">{note.summary}</div>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-1">Etiketler:</div>
        <div className="flex flex-wrap gap-1">
          {(note.tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
            <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
          ))}
        </div>
      </div>
      <details>
        <summary className="cursor-pointer text-blue-600 underline">Transkript</summary>
        <div className="whitespace-pre-wrap text-gray-500 mt-2">{note.transcript}</div>
      </details>
    </main>
  );
}
