"use client";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import PortadaEditable from './PortadaEditable';

export default function AdminPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClientComponentClient());
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [bloques, setBloques] = useState<unknown[]>([]);
  const [articulos, setArticulos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);

      if (!session) {
        console.log("AdminPage - No session found, redirecting to login");
        router.replace('/login');
      }
    };
    checkUser();
  }, [supabase, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: bloquesData, error: bloquesError } = await supabase
      .from('bloques_portada')
      .select(`
        id,
        nombre,
        tipo,
        posicion,
        articulo:articulos (
          id,
          titulo,
          slug,
          categoria,
          imagen,
          descripcion_corta,
          fecha,
          created_at,
          updated_at
        )
      `)
      .order('posicion', { ascending: true });
    const { data: articulosData, error: articulosError } = await supabase
      .from('articulos')
      .select('*')
      .order('fecha', { ascending: false });
    if (bloquesError || articulosError) setError('Error cargando datos');
    else {
      setBloques(bloquesData || []);
      setArticulos(articulosData || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Escuchar evento de refetch desde el modal de editar artículos
  useEffect(() => {
    const handleRefetchEvent = () => {
      fetchData();
    };

    window.addEventListener('refetchAdminData', handleRefetchEvent);

    return () => {
      window.removeEventListener('refetchAdminData', handleRefetchEvent);
    };
  }, [fetchData]);

  if (authLoading) return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white text-center">Verificando acceso de seguridad...</main>;
  if (!session) return null;
  if (loading) return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">Cargando portada...</main>;
  if (error) return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">{error}</main>;

  return <PortadaEditable bloques={bloques as any[]} articulos={articulos as any[]} onRefetch={fetchData} />;
} 