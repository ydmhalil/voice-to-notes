"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NotesHistory() {
  const { data: session } = useSession();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSummary, setEditSummary] = useState("");
  const [editTranscript, setEditTranscript] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editFolder, setEditFolder] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const handleStarToggle = async (id: string, starred: boolean) => {
    setActionLoading(true);
    await fetch(`/api/notes/${id}/star`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: !starred }),
    });
    fetchNotes();
    setActionLoading(false);
  };

  const fetchNotes = () => {
    setLoading(true);
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!session?.user?.email) return;
    fetchNotes();
  }, [session?.user?.email]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return;
    setActionLoading(true);
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    fetchNotes();
    setActionLoading(false);
  };

  const handleEdit = (note: any) => {
    setEditId(note.id);
    setEditSummary(note.summary);
    setEditTranscript(note.transcript);
    setEditTags(note.tags || "");
    setEditFolder(note.folder || "");
  };

  const handleEditSave = async (id: string) => {
    setActionLoading(true);
    await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: editSummary, transcript: editTranscript, tags: editTags, folder: editFolder }),
    });
    setEditId(null);
    fetchNotes();
    setActionLoading(false);
  };

  if (!session?.user?.email) return null;

  // Etiketleri ve klasörleri topla (tüm notlardan)
  const allTags = Array.from(new Set(notes.flatMap(n => (n.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean))));
  const allFolders = Array.from(new Set(notes.map(n => n.folder || "Diğer").filter(Boolean)));

  // Filtrelenmiş notlar
  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      !search ||
      note.summary.toLowerCase().includes(search.toLowerCase()) ||
      note.transcript.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !tagFilter || (note.tags || "").split(",").map((t: string) => t.trim()).includes(tagFilter);
    const matchesFolder = !folderFilter || (note.folder || "Diğer") === folderFilter;
    const matchesStar = !starredOnly || note.starred;
    return matchesSearch && matchesTag && matchesFolder && matchesStar;
  });

  // Notları klasöre göre grupla, yıldızlıları en üste sırala
  const notesByFolder: { [folder: string]: any[] } = {};
  filteredNotes.forEach(note => {
    const folder = note.folder || "Diğer";
    if (!notesByFolder[folder]) notesByFolder[folder] = [];
    notesByFolder[folder].push(note);
  });
  Object.keys(notesByFolder).forEach(folder => {
    notesByFolder[folder].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
  });

  return (
    <div className="my-8 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🗂️ Not Geçmişim</h2>
  <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={starredOnly} onChange={e => setStarredOnly(e.target.checked)} />
          Sadece yıldızlılar
        </label>
        <Input
          placeholder="Notlarda ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:w-1/3"
        />
        <select
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          className="border rounded px-2 py-1 text-base"
        >
          <option value="">Tüm Etiketler</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <select
          value={folderFilter}
          onChange={e => setFolderFilter(e.target.value)}
          className="border rounded px-2 py-1 text-base"
        >
          <option value="">Tüm Klasörler</option>
          {allFolders.map(folder => (
            <option key={folder} value={folder}>{folder}</option>
          ))}
        </select>
      </div>
      {loading && <div>Yükleniyor...</div>}
      {filteredNotes.length === 0 && !loading && <div>Hiç not bulunamadı.</div>}
      <div className="space-y-8">
        {Object.entries(notesByFolder).map(([folder, notes]) => (
          <div key={folder}>
            <h3 className="text-lg font-semibold mb-2">📁 {folder}</h3>
            <div className="space-y-4">
              {notes.map((note: any) => (
                <Card key={note.id}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={note.starred ? "Yıldızı kaldır" : "Yıldızla"}
                        className={"text-yellow-500 text-xl focus:outline-none" + (note.starred ? "" : " opacity-40 hover:opacity-80")}
                        onClick={() => handleStarToggle(note.id, note.starred)}
                        disabled={actionLoading}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                      >
                        ★
                      </button>
                      <CardTitle className="text-base">{new Date(note.createdAt).toLocaleString()}</CardTitle>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(note)} disabled={actionLoading || editId === note.id}>Düzenle</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(note.id)} disabled={actionLoading}>Sil</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editId === note.id ? (
                      <div className="space-y-2">
                        <div className="font-semibold">Özet:</div>
                        <Textarea value={editSummary} onChange={e => setEditSummary(e.target.value)} rows={3} />
                        <div className="font-semibold">Transkript:</div>
                        <Textarea value={editTranscript} onChange={e => setEditTranscript(e.target.value)} rows={5} />
                        <div className="font-semibold">Etiketler (virgülle ayır):</div>
                        <Input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="ör: toplantı, önemli, ders" />
                        <div className="font-semibold">Klasör:</div>
                        <Input value={editFolder} onChange={e => setEditFolder(e.target.value)} placeholder="ör: Projeler, Toplantılar, Kişisel" />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => handleEditSave(note.id)} disabled={actionLoading}>Kaydet</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditId(null)} disabled={actionLoading}>Vazgeç</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold mb-2">Özet:</div>
                        <div className="whitespace-pre-wrap text-gray-700 mb-2">{note.summary}</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(note.tags || "").split(",").map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                            <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
                          ))}
                        </div>
                        <details>
                          <summary className="cursor-pointer text-blue-600 underline">Transkript</summary>
                          <div className="whitespace-pre-wrap text-gray-500 mt-2">{note.transcript}</div>
                        </details>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
