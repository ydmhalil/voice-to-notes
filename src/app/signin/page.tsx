import { getProviders, signIn } from "next-auth/react";

export default async function SignInPage() {
  const providers = await getProviders();
  return (
    <div className="min-h-screen flex items-center justify-center bg-white/60 backdrop-blur-md">
      <div className="bg-white bg-opacity-80 rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Giriş Yap</h1>
        {providers && Object.values(providers).map((provider) => (
          <button
            key={provider.id}
            onClick={() => signIn(provider.id)}
            className="w-full mb-3 px-4 py-2 bg-black text-white rounded hover:bg-gray-900 transition"
          >
            {provider.name} ile Giriş Yap
          </button>
        ))}
      </div>
    </div>
  );
}
