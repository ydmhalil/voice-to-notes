"use client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import ExportButtons from "@/components/ExportButtons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
// Basit bir modal
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg p-6 max-w-lg w-full relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

export default function NotesHistory() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareNote, setShareNote] = useState<any>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [shareLoading, setShareLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<string>("");
  // Paylaşım modalını aç
  const openShareModal = async (note: any) => {
    setShareNote(note);
    setShareModalOpen(true);
    setShareLoading(true);
    // Eğer publicShareId yoksa oluştur
    if (!note.publicShareId) {
      // Backend'de güncelle
      const newId = uuidv4();
      await fetch(`/api/notes/${note.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicShareId: newId }),
      });
      setShareLink(`${window.location.origin}/paylas/${newId}`);
      // Notları güncelle
      fetchNotes();
    } else {
      setShareLink(`${window.location.origin}/paylas/${note.publicShareId}`);
    }
    setShareLoading(false);
  };
  const closeShareModal = () => {
    setShareModalOpen(false);
    setShareNote(null);
    setShareLink("");
  };
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [versionNoteId, setVersionNoteId] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [versionLoading, setVersionLoading] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  // Sürüm geçmişini getir
  const openVersionModal = async (noteId: string) => {
    setVersionNoteId(noteId);
    setVersionModalOpen(true);
    setVersionLoading(true);
    const res = await fetch(`/api/notes/${noteId}/versions`);
    const data = await res.json();
    setVersions(data);
    setVersionLoading(false);
  };
  const closeVersionModal = () => {
    setVersionModalOpen(false);
    setVersionNoteId(null);
    setVersions([]);
  };
  // Geri alma (rollback)
  const handleRollback = async (noteId: string, version: any) => {
    if (!confirm("Bu sürüme geri dönmek istediğinize emin misiniz?")) return;
    setRollbackLoading(true);
    await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: version.summary,
        transcript: version.transcript,
        tags: version.tags,
        folder: version.folder,
      }),
    });
    setRollbackLoading(false);
    closeVersionModal();
    fetchNotes();
  };
  const { data: session } = useSession();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editTranscript, setEditTranscript] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editFolder, setEditFolder] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    const params = new URLSearchParams();
    if (tagFilter) params.append("tags", tagFilter);
    if (folderFilter) params.append("folder", folderFilter);
    if (starredOnly) params.append("starred", "true");
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    fetch(`/api/notes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!session?.user?.email) return;
    fetchNotes();
    // eslint-disable-next-line
  }, [session?.user?.email]);

  // Filtreler değiştiğinde notları tekrar getir
  useEffect(() => {
    if (!session?.user?.email) return;
    fetchNotes();
    // eslint-disable-next-line
  }, [tagFilter, folderFilter, starredOnly, dateFrom, dateTo]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return;
    setActionLoading(true);
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    fetchNotes();
    setActionLoading(false);
  };

  const handleEdit = (note: any) => {
    setEditId(note.id);
    setEditTitle(note.title || "");
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
      body: JSON.stringify({ title: editTitle, summary: editSummary, transcript: editTranscript, tags: editTags, folder: editFolder }),
    });
    setEditId(null);
    fetchNotes();
    setActionLoading(false);
  };

  if (!session?.user?.email) return null;

  // Etiketleri ve klasörleri topla (tüm notlardan)
  const allTags = Array.from(new Set(notes.flatMap(n => (n.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean))));
  const allFolders = Array.from(new Set(notes.map(n => n.folder || "Diğer").filter(Boolean)));

  // Sadece arama kutusu frontend'de filtreleniyor, diğer filtreler backend'den geliyor
  const filteredNotes = notes.filter(note => {
    return (
      !search ||
      note.summary.toLowerCase().includes(search.toLowerCase()) ||
      note.transcript.toLowerCase().includes(search.toLowerCase())
    );
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
  <div className="my-4 max-w-full sm:max-w-xl mx-auto px-1">
      <h2 className="text-xl font-bold mb-4">🗂️ Not Geçmişim</h2>
  <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center w-full">
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
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          className="border rounded px-2 py-1 text-base"
          title="Başlangıç tarihi"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          className="border rounded px-2 py-1 text-base"
          title="Bitiş tarihi"
        />
      </div>
      {loading && <div>Yükleniyor...</div>}
      {filteredNotes.length === 0 && !loading && <div>Hiç not bulunamadı.</div>}
  <div className="space-y-6 sm:space-y-8">
        {Object.entries(notesByFolder).map(([folder, notes]) => (
          <div key={folder}>
            <h3 className="text-lg font-semibold mb-2">📁 {folder}</h3>
            <div className="space-y-4">
              {notes.map((note: any) => (
                <Card key={note.id}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-shrink">
                      <button
                        aria-label={note.starred ? "Yıldızı kaldır" : "Yıldızla"}
                        className={"text-yellow-500 text-xl focus:outline-none" + (note.starred ? "" : " opacity-40 hover:opacity-80")}
                        onClick={() => handleStarToggle(note.id, note.starred)}
                        disabled={actionLoading}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                      >
                        ★
                      </button>
                      <span className="font-bold text-base truncate max-w-[160px]">
                        {note.title || "Başlıksız Not"}
                      </span>
                      <span className="text-gray-500 text-sm whitespace-nowrap">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(note)} disabled={actionLoading || editId === note.id}>Düzenle</Button>
                      <Button size="sm" variant="outline" className="text-black border-black hover:bg-gray-100" onClick={() => openShareModal(note)} disabled={actionLoading}>Paylaş</Button>
                        <Button size="sm" variant="outline" className="text-black border-black hover:bg-gray-100" onClick={() => handleDelete(note.id)} disabled={actionLoading} aria-label="Sil">Sil</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editId === note.id ? (
                      <div className="space-y-2">
                        <div className="font-semibold">Başlık:</div>
                        <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Not başlığı" />
                        <div className="font-semibold">Özet:</div>
                        <Textarea value={editSummary} onChange={e => setEditSummary(e.target.value)} rows={3} />
                        <div className="font-semibold">Transkript:</div>
                        <Textarea value={editTranscript} onChange={e => setEditTranscript(e.target.value)} rows={5} />
                        <div className="font-semibold">Etiketler (virgülle ayır):</div>
                        <Input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="ör: toplantı, önemli, ders" />
                        <div className="font-semibold">Klasör:</div>
                        <Input value={editFolder} onChange={e => setEditFolder(e.target.value)} placeholder="ör: Projeler, Toplantılar, Kişisel" />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="text-black border-black hover:bg-gray-100" onClick={() => handleEditSave(note.id)} disabled={actionLoading}>Kaydet</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditId(null)} disabled={actionLoading}>Vazgeç</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold mb-2">Özet:</div>
                        <div className="whitespace-pre-wrap text-gray-700 mb-2">{note.summary}</div>
                        {note.keyPoints && (
                          <>
                            <div className="font-semibold mb-1">Önemli Noktalar:</div>
                            <div className="whitespace-pre-wrap text-gray-800 mb-2">{note.keyPoints}</div>
                          </>
                        )}
                        {note.questions && (
                          <>
                            <div className="font-semibold mb-1">Sorular:</div>
                            <div className="whitespace-pre-wrap text-gray-800 mb-2">{note.questions}</div>
                          </>
                        )}
                        {note.actionItems && (
                          <>
                            <div className="font-semibold mb-1">Aksiyon Maddeleri:</div>
                            <div className="whitespace-pre-wrap text-gray-800 mb-2">{note.actionItems}</div>
                          </>
                        )}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(note.tags || "").split(",").map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                            <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
                          ))}
                        </div>
                        <details className="mt-2 group">
                          <summary className="cursor-pointer border border-black rounded px-3 py-1 text-black hover:bg-gray-100 transition flex items-center gap-2 select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Transkript
                          </summary>
                          <div className="whitespace-pre-wrap text-gray-700 mt-2 p-2 bg-gray-50 rounded border border-gray-200">{note.transcript}</div>
                        </details>
                        <ExportButtons
                          content={{
                            summary: note.summary || '',
                            keyPoints: note.keyPoints || '',
                            questions: note.questions || '',
                            actionItems: note.actionItems || '',
                            transcript: note.transcript || '',
                            tags: note.tags || '',
                            folder: note.folder || '',
                            createdAt: note.createdAt
                          }}
                          title={note.title || note.summary?.slice(0, 30) || "Not"}
                        />
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
