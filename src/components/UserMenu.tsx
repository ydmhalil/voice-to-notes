"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

import { useTheme } from "@/lib/useTheme";
import { useState, useEffect } from "react";


export default function UserMenu() {
  // HOOKS: Always at the top, before any return/condition
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [language, setLanguage] = useState("tr");
  const [notifications, setNotifications] = useState(true);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLanguage(localStorage.getItem("language") || "tr");
      setNotifications(localStorage.getItem("notifications") !== "false");
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
      localStorage.setItem("notifications", notifications ? "true" : "false");
    }
  }, [language, notifications]);

  if (status === "loading") {
    return <div className="px-4 py-2">Yükleniyor...</div>;
  }

  if (!session) {
    return (
      <Button onClick={() => signIn("google")}>Google ile Giriş Yap</Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user?.image && (
        <img
          src={session.user.image}
          alt={session.user.name || "Kullanıcı"}
          className="w-8 h-8 rounded-full border"
        />
      )}
  <span
    className="user-name font-medium text-sm"
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: `<span style='color:#111 !important;'>${session.user?.name ?? ''}</span>` }}
  />
      <Button
        variant="outline"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={theme === "dark" ? "Açık Mod" : "Koyu Mod"}
      >
        {theme === "dark" ? "🌙" : "🌞"}
      </Button>
      <Button
        variant="outline"
        onClick={() => setSettingsOpen(true)}
        title="Ayarlar"
      >
        ⚙️
      </Button>
      <Button variant="outline" onClick={() => signOut()}>Çıkış Yap</Button>

      {/* Ayarlar Modalı */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded shadow-lg p-6 max-w-xs w-full relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSettingsOpen(false)}>✕</button>
            <h3 className="font-bold mb-4 text-lg">Kullanıcı Ayarları</h3>
            <div className="mb-3">
              <label className="block text-xs mb-1">Tema:</label>
              <select
                value={theme}
                onChange={e => setTheme(e.target.value as "light" | "dark")}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="light">Açık</option>
                <option value="dark">Koyu</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs mb-1">Dil:</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifications}
                onChange={e => setNotifications(e.target.checked)}
                id="notif"
              />
              <label htmlFor="notif" className="text-xs">Bildirimleri Aç</label>
            </div>
            <Button variant="default" className="w-full mt-2" onClick={() => setSettingsOpen(false)}>
              Kaydet & Kapat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
