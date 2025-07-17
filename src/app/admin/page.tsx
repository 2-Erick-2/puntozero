"use client";
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PortadaEditable from './PortadaEditable';
import { createSupabaseBrowser } from "../supabaseClient";

export default function AdminPage() {
  const session = useSession();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bloques, setBloques] = useState<unknown[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [articulos, setArticulos] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      router.replace('/login');
    }
  }, [session, router]);

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, []);

  if (!session) return null;
  if (loading) return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">Cargando portada...</main>;
  if (error) return <main className="max-w-6xl mx-auto w-full py-8 px-2 md:px-0 bg-white">{error}</main>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortadaEditable bloques={bloques as any[]} articulos={articulos as any[]} />;
} 