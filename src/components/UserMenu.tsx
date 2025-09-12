"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const { data: session, status } = useSession();

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
      <span className="font-medium text-sm">{session.user?.name}</span>
      <Button variant="outline" onClick={() => signOut()}>Çıkış Yap</Button>
    </div>
  );
}
