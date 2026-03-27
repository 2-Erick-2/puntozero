"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() => createClientComponentClient());
  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthChecking(false);

      if (session) {
        console.log("LoginPage - Session detected on load, forcing redirect to /admin...");
        window.location.href = '/admin';
      }
    };
    checkUser();
  }, [supabase]);

  if (authChecking || session) return <main className="min-h-screen flex items-center justify-center bg-gray-50"><p>Comprobando sesión...</p></main>;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log("LoginPage - Supabase Response:", { data, error });
    setLoading(false);
    if (error) setError(error.message);
    else {
      console.log("LoginPage - Login Success, forcing reload and redirect to /admin...");
      // Forzar recarga completa para sincronizar cookies
      window.location.href = '/admin';
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-red-700 text-white py-2 rounded font-bold hover:bg-red-800 transition"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
} 