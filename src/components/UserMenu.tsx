"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

// Koyu tema kaldırıldı
import { useState, useEffect } from "react";


export default function UserMenu() {
  // HOOKS: Always at the top, before any return/condition
  const { data: session, status } = useSession();
  // Tema yönetimi kaldırıldı
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
      <div className="flex items-center gap-2 min-w-0 max-w-xs truncate">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "Kullanıcı"}
            className="w-8 h-8 rounded-full border flex-shrink-0"
          />
        )}
        <span
          className="user-name font-medium text-sm truncate block max-w-[120px]"
          title={session.user?.name ?? ''}
        >
          {session.user?.name ?? ''}
        </span>
      </div>
      {/* Tema butonu kaldırıldı */}
      <Button variant="outline" onClick={() => signOut()}>Çıkış Yap</Button>

    </div>
  );
}
