"use client";
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import PortadaEditable from './PortadaEditable';
import { createSupabaseBrowser } from "../supabaseClient";

export default function AdminPage() {
  const session = useSession();
  const router = useRouter();
  const [bloques, setBloques] = useState<unknown[]>([]);
  const [articulos, setArticulos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.replace('/login');
    }
  }, [session, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowser();
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

  if (!session) return null;
  if (loading) return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">Cargando portada...</main>;
  if (error) return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">{error}</main>;

  return <PortadaEditable bloques={bloques as any[]} articulos={articulos as any[]} onRefetch={fetchData} />;
} 