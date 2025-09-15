"use client";
import { useEffect, useState } from "react";
// Basit custom modal
function ConfirmModal({ open, onConfirm, onCancel, message }: { open: boolean; onConfirm: () => void; onCancel: () => void; message: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="bg-white rounded shadow-lg p-6 max-w-xs w-full relative flex flex-col items-center">
        <div className="mb-4 text-center text-base text-gray-800">{message}</div>
        <div className="flex gap-3 mt-2">
          <button onClick={onCancel} className="px-4 py-1 rounded border border-gray-400 text-gray-700 bg-gray-100 hover:bg-gray-200">Vazgeç</button>
          <button onClick={onConfirm} className="px-4 py-1 rounded border border-black text-white bg-black hover:bg-gray-900">Evet, Sil</button>
        </div>
      </div>
    </div>
  );
}
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FolderTagManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState<null | (() => void)>(null);
  const [folders, setFolders] = useState<{name: string, id: string}[]>([]);
  const [tags, setTags] = useState<{name: string, id: string}[]>([]);
  const [newFolder, setNewFolder] = useState("");
  const [newTag, setNewTag] = useState("");

  // Klasör ve etiketleri getir
  const fetchFolders = () => {
    fetch("/api/folders").then(res => res.json()).then(setFolders);
  };
  const fetchTags = () => {
    fetch("/api/tags").then(res => res.json()).then(setTags);
  };

  useEffect(() => {
    fetchFolders();
    fetchTags();
  }, []);

  // Klasör ekle
  const handleAddFolder = async () => {
    if (!newFolder.trim()) return;
    const folderArr = newFolder.split(",").map(f => f.trim()).filter(Boolean);
    await Promise.all(folderArr.map(folder =>
      fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder })
      })
    ));
    setNewFolder("");
    fetchFolders();
  };
  // Klasör sil
  const handleDeleteFolder = (folder: string) => {
    setModalMessage(`"${folder}" klasörünü ve bu klasöre bağlı tüm notlardaki klasör bilgisini silmek istediğinize emin misiniz?`);
    setModalAction(() => async () => {
      setModalOpen(false);
      await fetch(`/api/folders?folder=${encodeURIComponent(folder)}`, { method: "DELETE" });
      fetchFolders();
    });
    setModalOpen(true);
  };
  // Etiket ekle
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: newTag.trim() })
    });
    setNewTag("");
    fetchTags();
  };
  // Etiket sil
  const handleDeleteTag = (tag: string) => {
    setModalMessage(`"${tag}" etiketini ve bu etiketi içeren tüm notlardaki etiketi silmek istediğinize emin misiniz?`);
    setModalAction(() => async () => {
      setModalOpen(false);
      await fetch(`/api/tags?tag=${encodeURIComponent(tag)}`, { method: "DELETE" });
      fetchTags();
    });
    setModalOpen(true);
  };

  return (
    <>
      <ConfirmModal open={modalOpen} message={modalMessage} onCancel={() => setModalOpen(false)} onConfirm={() => { if (modalAction) modalAction(); }} />
      <div className="my-4 max-w-full sm:max-w-xl mx-auto px-1">
      <h2 className="text-lg font-bold mb-2">Klasör ve Etiket Yönetimi</h2>
  <div className="mb-3">
        <div className="font-semibold mb-1">Klasörler:</div>
  <div className="flex flex-wrap gap-2 mb-2 w-full">
    {folders.map(folder => (
      <span key={folder.id} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1">
        {folder.name}
        <button onClick={() => handleDeleteFolder(folder.name)} className="ml-1 text-red-500 hover:text-red-700 text-xs" title="Sil">✕</button>
      </span>
    ))}
  </div>
  <Input
    value={newFolder}
    onChange={e => setNewFolder(e.target.value)}
    placeholder="Yeni klasör ismi"
    className="inline-block w-auto mr-2"
  />
  <Button size="sm" className="border-2 border-black" onClick={handleAddFolder}>+ Ekle</Button>
      </div>
  <div className="mb-3">
        <div className="font-semibold mb-1">Etiketler:</div>
  <div className="flex flex-wrap gap-2 mb-2 w-full">
    {tags.map(tag => (
      <span key={tag.id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1">
        #{tag.name}
        <button onClick={() => handleDeleteTag(tag.name)} className="ml-1 text-red-500 hover:text-red-700 text-xs" title="Sil">✕</button>
      </span>
    ))}
  </div>
  <Input
    value={newTag}
    onChange={e => setNewTag(e.target.value)}
    placeholder="Yeni etiket"
    className="inline-block w-auto mr-2"
  />
  <Button size="sm" className="border-2 border-black" onClick={handleAddTag}>+ Ekle</Button>
      </div>
  <div className="text-xs text-gray-500 mt-2">Klasör ve etiket ekleme/silme işlemlerini buradan yönetebilirsiniz.</div>
    </div>
    </>
  );
}
