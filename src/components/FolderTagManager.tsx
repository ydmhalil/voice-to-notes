"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FolderTagManager() {
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
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

  // Klasör ve etiket ekleme (yeni not eklerken kullanılacak, burada sadece gösterim ve silme var)

  return (
  <div className="my-4 max-w-full sm:max-w-xl mx-auto px-1">
      <h2 className="text-lg font-bold mb-2">Klasör ve Etiket Yönetimi</h2>
  <div className="mb-3">
        <div className="font-semibold mb-1">Klasörler:</div>
  <div className="flex flex-wrap gap-2 mb-2 w-full">
          {folders.map(folder => (
            <span key={folder} className="bg-gray-200 px-2 py-1 rounded text-sm">{folder}</span>
          ))}
        </div>
        <Input
          value={newFolder}
          onChange={e => setNewFolder(e.target.value)}
          placeholder="Yeni klasör ismi"
          className="inline-block w-auto mr-2"
        />
        <Button size="sm" disabled>+ Ekle (Not eklerken)</Button>
      </div>
  <div className="mb-3">
        <div className="font-semibold mb-1">Etiketler:</div>
  <div className="flex flex-wrap gap-2 mb-2 w-full">
          {tags.map(tag => (
            <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">#{tag}</span>
          ))}
        </div>
        <Input
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="Yeni etiket"
          className="inline-block w-auto mr-2"
        />
        <Button size="sm" disabled>+ Ekle (Not eklerken)</Button>
      </div>
  <div className="text-xs text-gray-500 mt-2">Klasör ve etiket ekleme/silme işlemleri not eklerken veya düzenlerken yapılabilir.</div>
    </div>
  );
}
